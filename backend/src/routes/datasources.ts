import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as xlsx from "xlsx";
import { parse } from "csv-parse/sync";
import { PrismaClient, DatasourceType, DatasourceStatus, Role, TenantRole } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

const ALLOWED_MIME_TYPES: Record<string, DatasourceType> = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": DatasourceType.EXCEL,
  "application/vnd.ms-excel": DatasourceType.EXCEL,
  "text/csv": DatasourceType.CSV,
  "application/pdf": DatasourceType.PDF,
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const tempDir = path.join(UPLOAD_DIR, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件格式"));
    }
  },
});

function detectColumnType(values: any[]): string {
  const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNullValues.length === 0) return "string";

  const allNumbers = nonNullValues.every((v) => !isNaN(Number(v)) && v !== "");
  if (allNumbers) return "number";

  const allDates = nonNullValues.every((v) => !isNaN(Date.parse(String(v))));
  if (allDates) return "date";

  return "string";
}

function parseExcel(filePath: string) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  if (data.length === 0) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const headers = data[0];
  const rows = data.slice(1);

  const columnSchema = headers.map((header, index) => {
    const columnValues = rows.map((row) => row[index]);
    return {
      name: String(header || `Column ${index + 1}`),
      type: detectColumnType(columnValues),
    };
  });

  return {
    columns: headers.map((h) => String(h)),
    rows,
    totalRows: rows.length,
    columnSchema,
  };
}

function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const records = parse(content, {
    columns: false,
    skip_empty_lines: true,
  }) as any[][];

  if (records.length === 0) {
    return { columns: [], rows: [], totalRows: 0 };
  }

  const headers = records[0];
  const rows = records.slice(1);

  const columnSchema = headers.map((header: any, index: number) => {
    const columnValues = rows.map((row) => row[index]);
    return {
      name: String(header || `Column ${index + 1}`),
      type: detectColumnType(columnValues),
    };
  });

  return {
    columns: headers.map((h: any) => String(h)),
    rows,
    totalRows: rows.length,
    columnSchema,
  };
}

function parseFile(filePath: string, mimeType: string) {
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return parseExcel(filePath);
  } else if (mimeType === "text/csv") {
    return parseCSV(filePath);
  }
  return { columns: [], rows: [], totalRows: 0, columnSchema: [] };
}

// Helper function to build where clause based on tenant isolation
function buildWhereClause(req: AuthRequest): any {
  const { userId, tenantId, role } = req;

  if (role === Role.ADMIN) {
    // 系统管理员可以访问所有数据
    return {};
  } else if (tenantId) {
    // 有租户的用户按租户隔离
    return { tenantId };
  } else {
    // 无租户用户按用户隔离
    return { userId };
  }
}

// POST /api/datasources/upload
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "未提供文件" });
      }

      const userId = req.userId!;
      const { tenantId } = req;
      const file = req.file;
      const name = req.body.name || file.originalname;
      const datasourceType = ALLOWED_MIME_TYPES[file.mimetype];

      // Parse file
      const parseResult = parseFile(file.path, file.mimetype);
      const previewData = parseResult.rows.slice(0, 100).map((row) => {
        const obj: Record<string, any> = {};
        parseResult.columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });

      // Create datasource record
      const datasource = await prisma.datasource.create({
        data: {
          name,
          type: datasourceType,
          status: DatasourceStatus.ACTIVE,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          rowCount: parseResult.totalRows,
          columnSchema: parseResult.columnSchema as any,
          previewData: previewData as any,
          userId,
          tenantId,
        },
      });

      // Move file to permanent location
      const storageDir = tenantId
        ? path.join(UPLOAD_DIR, "tenants", tenantId, datasource.id)
        : path.join(UPLOAD_DIR, "users", userId, datasource.id);

      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      const newPath = path.join(storageDir, file.filename);
      fs.renameSync(file.path, newPath);

      // Update filePath
      await prisma.datasource.update({
        where: { id: datasource.id },
        data: { filePath: newPath },
      });

      res.status(201).json({
        id: datasource.id,
        name: datasource.name,
        type: datasource.type,
        status: datasource.status,
        fileName: datasource.fileName,
        fileSize: datasource.fileSize,
        mimeType: datasource.mimeType,
        rowCount: datasource.rowCount,
        createdAt: datasource.createdAt,
      });
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (error.message === "不支持的文件格式") {
        return res.status(400).json({ error: "不支持的文件格式" });
      }
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "文件过大" });
      }

      console.error("Upload error:", error);
      res.status(500).json({ error: "上传失败" });
    }
  }
);

// GET /api/datasources
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = req.query.type as string;
    const status = req.query.status as string;

    const where = buildWhereClause(req);
    if (type) where.type = type.toUpperCase();
    if (status) where.status = status.toUpperCase();

    const [datasources, total] = await Promise.all([
      prisma.datasource.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          fileName: true,
          fileSize: true,
          rowCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.datasource.count({ where }),
    ]);

    res.json({
      data: datasources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List datasources error:", error);
    res.status(500).json({ error: "获取数据源列表失败" });
  }
});

// GET /api/datasources/:id
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const where = buildWhereClause(req);

    const datasource = await prisma.datasource.findFirst({
      where: { ...where, id },
    });

    if (!datasource) {
      return res.status(404).json({ error: "数据源不存在" });
    }

    res.json(datasource);
  } catch (error) {
    console.error("Get datasource error:", error);
    res.status(500).json({ error: "获取数据源详情失败" });
  }
});

// PATCH /api/datasources/:id
router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { name } = req.body;
    const where = buildWhereClause(req);

    const existing = await prisma.datasource.findFirst({
      where: { ...where, id },
    });

    if (!existing) {
      return res.status(404).json({ error: "数据源不存在" });
    }

    // 权限检查：VIEWER 不能修改
    if (req.tenantRole === TenantRole.VIEWER) {
      return res.status(403).json({ error: "无权修改数据源" });
    }

    const updated = await prisma.datasource.update({
      where: { id },
      data: { name: name || existing.name },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update datasource error:", error);
    res.status(500).json({ error: "更新数据源失败" });
  }
});

// DELETE /api/datasources/:id
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const where = buildWhereClause(req);

    const existing = await prisma.datasource.findFirst({
      where: { ...where, id },
    });

    if (!existing) {
      return res.status(404).json({ error: "数据源不存在" });
    }

    // 权限检查：只有 OWNER/ADMIN 可以删除
    if (req.tenantId && req.tenantRole !== TenantRole.OWNER && req.tenantRole !== TenantRole.ADMIN) {
      return res.status(403).json({ error: "无权删除数据源" });
    }

    // Delete file if exists
    if (existing.filePath && fs.existsSync(existing.filePath)) {
      fs.unlinkSync(existing.filePath);
      // Try to remove empty parent directory
      const parentDir = path.dirname(existing.filePath);
      if (fs.existsSync(parentDir) && fs.readdirSync(parentDir).length === 0) {
        fs.rmdirSync(parentDir);
      }
    }

    await prisma.datasource.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Delete datasource error:", error);
    res.status(500).json({ error: "删除数据源失败" });
  }
});

// GET /api/datasources/:id/preview
router.get("/:id/preview", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const previewLimit = Math.min(1000, Math.max(1, parseInt(req.query.limit as string) || 100));
    const where = buildWhereClause(req);

    const datasource = await prisma.datasource.findFirst({
      where: { ...where, id },
      select: {
        filePath: true,
        mimeType: true,
        columnSchema: true,
        previewData: true,
      },
    });

    if (!datasource) {
      return res.status(404).json({ error: "数据源不存在" });
    }

    // If we have previewData stored and limit <= 100, return it
    if (datasource.previewData && previewLimit <= 100) {
      const preview = datasource.previewData as any[];
      const columns = datasource.columnSchema
        ? (datasource.columnSchema as any[]).map((c) => c.name)
        : Object.keys(preview[0] || {});

      return res.json({
        columns,
        rows: preview.slice(0, previewLimit).map((row) =>
          columns.map((col) => row[col])
        ),
        totalRows: preview.length,
      });
    }

    // Otherwise parse from file
    if (!datasource.filePath || !fs.existsSync(datasource.filePath)) {
      return res.status(404).json({ error: "数据源文件不存在" });
    }

    const parseResult = parseFile(datasource.filePath, datasource.mimeType || "");
    const rows = parseResult.rows.slice(0, previewLimit);

    res.json({
      columns: parseResult.columns,
      rows,
      totalRows: parseResult.totalRows,
    });
  } catch (error) {
    console.error("Preview datasource error:", error);
    res.status(500).json({ error: "获取数据预览失败" });
  }
});

export default router;
