# 数据源管理模块 - 技术规格 (Spec)

## 1. 概述

### 1.1 目标
实现一个完整的数据源管理系统，支持用户上传文件（Excel、CSV、PDF）和管理数据库连接。

### 1.2 范围
- 文件上传与解析
- 数据源 CRUD 操作
- 文件存储管理
- 数据预览功能

---

## 2. 数据库模型更新

### 2.1 Datasource 模型扩展

```prisma
model Datasource {
  id          String   @id @default(cuid())
  name        String
  type        DatasourceType
  status      DatasourceStatus @default(ACTIVE)
  
  // 文件相关字段
  fileName    String?  @map("file_name")
  fileSize    Int?     @map("file_size")      // 字节数
  filePath    String?  @map("file_path")      // 存储路径
  mimeType    String?  @map("mime_type")      // 文件类型
  
  // 数据库连接相关字段（可选）
  connectionConfig Json? @map("connection_config")
  
  // 数据预览（存储前100行数据）
  previewData Json?    @map("preview_data")
  columnSchema Json?   @map("column_schema")   // 列结构信息
  
  // 统计信息
  rowCount    Int?     @map("row_count")
  
  userId      String   @map("user_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id])

  @@map("datasources")
}

enum DatasourceType {
  EXCEL
  CSV
  PDF
  POSTGRES
  MYSQL
  GOOGLE_SHEETS
}

enum DatasourceStatus {
  ACTIVE
  PROCESSING
  ERROR
  INACTIVE
}
```

---

## 3. API 接口规格

### 3.1 文件上传

#### POST /api/datasources/upload
上传文件并创建数据源

**请求**
```http
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: <binary>
name: "销售数据2024"  // 可选，默认使用文件名
```

**响应 201**
```json
{
  "id": "clx1234567890",
  "name": "销售数据2024",
  "type": "EXCEL",
  "status": "PROCESSING",
  "fileName": "sales_2024.xlsx",
  "fileSize": 1024576,
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "rowCount": null,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**错误响应**
- `400` - 文件格式不支持
- `413` - 文件过大（最大 50MB）
- `401` - 未授权

---

### 3.2 获取数据源列表

#### GET /api/datasources
获取当前用户的数据源列表

**请求**
```http
Authorization: Bearer {token}
```

**查询参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 按类型筛选 (excel, csv, pdf) |
| status | string | 按状态筛选 |
| page | number | 页码，默认 1 |
| limit | number | 每页数量，默认 20 |

**响应 200**
```json
{
  "data": [
    {
      "id": "clx1234567890",
      "name": "销售数据2024",
      "type": "EXCEL",
      "status": "ACTIVE",
      "fileSize": 1024576,
      "rowCount": 1500,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:05Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 3.3 获取数据源详情

#### GET /api/datasources/:id

**响应 200**
```json
{
  "id": "clx1234567890",
  "name": "销售数据2024",
  "type": "EXCEL",
  "status": "ACTIVE",
  "fileName": "sales_2024.xlsx",
  "fileSize": 1024576,
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "rowCount": 1500,
  "columnSchema": [
    { "name": "日期", "type": "date" },
    { "name": "产品", "type": "string" },
    { "name": "销售额", "type": "number" }
  ],
  "previewData": [
    { "日期": "2024-01-01", "产品": "产品A", "销售额": 10000 },
    { "日期": "2024-01-02", "产品": "产品B", "销售额": 15000 }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:05Z"
}
```

---

### 3.4 更新数据源

#### PATCH /api/datasources/:id

**请求**
```json
{
  "name": "新的数据源名称"
}
```

**响应 200**
```json
{
  "id": "clx1234567890",
  "name": "新的数据源名称",
  ...
}
```

---

### 3.5 删除数据源

#### DELETE /api/datasources/:id

**响应 204**
无响应体

---

### 3.6 获取数据预览

#### GET /api/datasources/:id/preview
获取前 N 行数据预览

**查询参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| limit | number | 行数，默认 100，最大 1000 |

**响应 200**
```json
{
  "columns": ["日期", "产品", "销售额"],
  "rows": [
    ["2024-01-01", "产品A", 10000],
    ["2024-01-02", "产品B", 15000]
  ],
  "totalRows": 1500
}
```

---

## 4. 技术实现细节

### 4.1 文件存储策略

```
/uploads/
  └── {userId}/
      └── {datasourceId}/
          └── {filename}
```

**存储限制**
- 单文件最大：50MB
- 用户总存储：根据 Plan 决定
  - FREE: 100MB
  - PRO: 1GB
  - ENTERPRISE: 10GB

### 4.2 支持的文件格式

| 格式 | MIME Type | 解析库 |
|------|-----------|--------|
| Excel (.xlsx) | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | xlsx |
| Excel (.xls) | application/vnd.ms-excel | xlsx |
| CSV | text/csv | csv-parse |
| PDF | application/pdf | pdf-parse |

### 4.3 数据处理流程

```
上传文件
    ↓
验证文件类型和大小
    ↓
保存到临时目录
    ↓
解析文件内容
    ↓
提取列结构
    ↓
生成预览数据（前100行）
    ↓
移动到永久存储
    ↓
保存元数据到数据库
    ↓
返回数据源信息
```

### 4.4 错误处理

| 错误码 | 场景 | 用户提示 |
|--------|------|----------|
| INVALID_FILE_TYPE | 不支持的文件格式 | "不支持的文件格式，请上传 Excel、CSV 或 PDF 文件" |
| FILE_TOO_LARGE | 文件超过50MB | "文件过大，请上传小于50MB的文件" |
| STORAGE_LIMIT_EXCEEDED | 超出存储配额 | "存储空间不足，请升级套餐或删除旧数据源" |
| PARSE_ERROR | 文件解析失败 | "文件解析失败，请检查文件格式是否正确" |
| EMPTY_FILE | 文件为空 | "文件内容为空" |

---

## 5. 前端接口

### 5.1 上传组件

```typescript
interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (datasource: Datasource) => void;
  onError?: (error: UploadError) => void;
}

function uploadFile(file: File, name?: string, options?: UploadOptions): Promise<Datasource>;
```

### 5.2 数据源列表

```typescript
interface ListDatasourcesParams {
  type?: DatasourceType;
  status?: DatasourceStatus;
  page?: number;
  limit?: number;
}

interface ListDatasourcesResponse {
  data: Datasource[];
  pagination: PaginationInfo;
}

function listDatasources(params?: ListDatasourcesParams): Promise<ListDatasourcesResponse>;
```

---

## 6. 安全考虑

1. **文件类型白名单** - 只允许特定的 MIME 类型
2. **文件大小限制** - 防止大文件攻击
3. **用户隔离** - 用户只能访问自己的文件
4. **路径安全** - 防止目录遍历攻击
5. **病毒扫描** - 考虑集成病毒扫描（未来）

---

## 7. 后续扩展

- [ ] 数据库直连（PostgreSQL、MySQL）
- [ ] Google Sheets 集成
- [ ] 数据清洗功能
- [ ] 自动数据类型检测
- [ ] 大数据文件分片上传
