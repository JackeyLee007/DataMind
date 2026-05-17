# 数据源管理模块 Spec

## Why
用户需要将本地数据文件（Excel、CSV、PDF）上传到系统中，作为 AI 数据分析的数据源。当前系统只有基础的 Datasource 模型，缺少文件上传、解析、预览等核心功能。

## What Changes
- 扩展 Prisma Datasource 模型，增加文件元数据、状态、预览数据等字段
- 新增 DatasourceType 和 DatasourceStatus 枚举
- 实现文件上传 API（支持 Excel、CSV、PDF）
- 实现数据源 CRUD API（列表、详情、更新、删除）
- 实现数据预览 API（提取前 N 行数据）
- 添加文件存储和解析逻辑
- 集成认证中间件保护数据源接口
- **BREAKING**: Datasource 模型的 `type` 字段从 String 改为 DatasourceType 枚举

## Impact
- Affected specs: 用户认证系统（复用 authenticateToken 中间件）
- Affected code: backend/prisma/schema.prisma, backend/src/index.ts, backend/package.json
- Affected storage: 新增 /uploads 目录用于文件存储

## ADDED Requirements

### Requirement: 文件上传
The system SHALL 允许认证用户上传 Excel、CSV、PDF 文件，并创建对应的数据源记录。

#### Scenario: 成功上传 Excel 文件
- **GIVEN** 用户已登录并持有有效 JWT Token
- **WHEN** 用户通过 multipart/form-data 上传一个 .xlsx 文件
- **THEN** 系统保存文件到 /uploads/{userId}/{datasourceId}/ 目录
- **AND** 解析文件提取列结构和前 100 行预览数据
- **AND** 创建 Datasource 记录，状态为 ACTIVE
- **AND** 返回 201 和数据源信息

#### Scenario: 上传不支持的文件类型
- **GIVEN** 用户已登录
- **WHEN** 用户上传一个 .txt 文件
- **THEN** 返回 400 错误，提示"不支持的文件格式"

#### Scenario: 上传过大的文件
- **GIVEN** 用户已登录
- **WHEN** 用户上传一个超过 50MB 的文件
- **THEN** 返回 413 错误，提示"文件过大"

### Requirement: 数据源列表查询
The system SHALL 允许认证用户分页查询自己的数据源列表，支持按类型和状态筛选。

#### Scenario: 获取第一页数据源
- **GIVEN** 用户已登录且有 3 个数据源
- **WHEN** 用户请求 GET /api/datasources?page=1&limit=10
- **THEN** 返回 200 和数据源列表及分页信息
- **AND** 只返回该用户的数据源

### Requirement: 数据源详情
The system SHALL 允许认证用户查看单个数据源的详细信息，包括列结构和预览数据。

#### Scenario: 获取数据源详情
- **GIVEN** 用户已登录且拥有数据源 DS-1
- **WHEN** 用户请求 GET /api/datasources/DS-1
- **THEN** 返回 200 和完整数据源信息（含 columnSchema 和 previewData）

#### Scenario: 访问其他用户的数据源
- **GIVEN** 用户 A 已登录
- **WHEN** 用户 A 请求 GET /api/datasources/DS-B（属于用户 B）
- **THEN** 返回 404 错误（不暴露资源存在性）

### Requirement: 数据源更新
The system SHALL 允许认证用户更新自己数据源的名称等元数据。

#### Scenario: 重命名数据源
- **GIVEN** 用户已登录且拥有数据源 DS-1
- **WHEN** 用户发送 PATCH /api/datasources/DS-1，body 为 { "name": "新名称" }
- **THEN** 返回 200 和更新后的数据源信息

### Requirement: 数据源删除
The system SHALL 允许认证用户删除自己的数据源，并清理关联的文件。

#### Scenario: 删除数据源
- **GIVEN** 用户已登录且拥有数据源 DS-1
- **WHEN** 用户发送 DELETE /api/datasources/DS-1
- **THEN** 删除数据库记录
- **AND** 删除关联的文件目录
- **AND** 返回 204

### Requirement: 数据预览
The system SHALL 允许认证用户获取数据源的前 N 行数据用于预览。

#### Scenario: 获取前 100 行预览
- **GIVEN** 用户已登录且拥有数据源 DS-1
- **WHEN** 用户请求 GET /api/datasources/DS-1/preview?limit=100
- **THEN** 返回 200 和列名数组及行数据数组

## MODIFIED Requirements

### Requirement: Datasource 模型
**原实现**: Datasource 模型使用 String 类型的 type 字段，仅包含基础字段（name, type, size, url, userId）。

**新实现**:
- type 字段改为 DatasourceType 枚举（EXCEL, CSV, PDF, POSTGRES, MYSQL, GOOGLE_SHEETS）
- 新增 status 字段（DatasourceStatus 枚举：ACTIVE, PROCESSING, ERROR, INACTIVE）
- 新增文件元数据字段：fileName, fileSize, filePath, mimeType
- 新增数据字段：previewData（Json，前100行）, columnSchema（Json，列结构）
- 新增统计字段：rowCount
- 移除旧的 size 和 url 字段（被新的 fileSize 和 filePath 替代）

## REMOVED Requirements
无
