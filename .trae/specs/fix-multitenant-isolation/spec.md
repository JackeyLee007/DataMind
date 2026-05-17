# 多租户隔离修复 Spec

## Why
当前系统缺少多租户架构，所有用户数据全局共享，存在严重的数据隔离问题。用户注册时没有租户概念，导致：1) 邮箱全局唯一限制；2) 数据无租户边界；3) 缺少租户级用户管理。需要引入 Tenant 模型和租户隔离机制。

## What Changes
- 新增 Tenant 模型，普通用户注册时可选择创建或加入租户
- User 模型添加 tenantId（可为 null）和 tenantRole 字段
- 系统管理员（role=ADMIN）独立于租户体系，tenantId 为 null
- 所有业务模型（Chat、Datasource、Report）添加 tenantId 字段（可为 null）
- 注册流程改造：普通用户注册时可选创建租户或加入现有租户
- 新增租户成员管理 API：邀请用户、分配角色
- 认证中间件 JWT 包含 tenant_id（可为 null）和 tenantRole
- 所有查询添加租户隔离过滤（仅当用户有租户时）
- **BREAKING**: 数据库 Schema 重大变更，需要重新迁移

## Impact
- Affected specs: 用户认证系统、数据源管理、对话系统、报表系统
- Affected code: backend/prisma/schema.prisma, backend/src/index.ts, backend/src/routes/datasources.ts, backend/src/middleware/auth.ts
- Affected data: 现有数据需要迁移或清空重建

## ADDED Requirements

### Requirement: 租户模型
The system SHALL 提供 Tenant 模型存储租户信息。普通用户可选择创建租户或加入现有租户，系统管理员无租户。

#### Scenario: 普通用户注册创建租户
- **GIVEN** 新用户提交注册信息并选择创建租户
- **WHEN** 系统创建用户记录
- **THEN** 同时创建 Tenant 记录，name 为用户指定或邮箱前缀
- **AND** 设置用户 tenantId 指向该租户
- **AND** 设置用户 tenantRole 为 OWNER

#### Scenario: 系统管理员无租户
- **GIVEN** 系统管理员账号（role=ADMIN）
- **WHEN** 查询管理员信息
- **THEN** tenantId 为 null
- **AND** tenantRole 为 null

### Requirement: 租户内用户管理
The system SHALL 允许租户 Owner/Admin 邀请和管理租户内成员。

#### Scenario: 邀请成员加入租户
- **GIVEN** 租户 Owner 已登录
- **WHEN** 发送邀请邮件/链接给新用户
- **THEN** 新用户接受邀请后注册，自动加入该租户
- **AND** 新用户 tenantRole 默认为 MEMBER

#### Scenario: 分配成员角色
- **GIVEN** 租户 Owner 已登录
- **WHEN** 修改成员角色为 ADMIN 或 MEMBER
- **THEN** 更新用户 tenantRole 字段

### Requirement: 数据租户隔离
The system SHALL 确保有租户的用户只能访问所属租户的数据，系统管理员可访问全局数据。

#### Scenario: 有租户用户查询数据源
- **GIVEN** 用户已登录且属于租户 T1
- **WHEN** 请求 GET /api/datasources
- **THEN** 只返回 tenantId = T1 的数据源

#### Scenario: 系统管理员查询数据源
- **GIVEN** 系统管理员已登录（tenantId 为 null）
- **WHEN** 请求 GET /api/datasources
- **THEN** 返回所有数据源（或根据权限配置）

#### Scenario: 跨租户访问被拒绝
- **GIVEN** 用户 A 属于租户 T1
- **WHEN** 尝试访问租户 T2 的数据源
- **THEN** 返回 404（不暴露资源存在性）

## MODIFIED Requirements

### Requirement: 用户注册
**原实现**: 用户直接注册，email 全局唯一，无租户概念。

**新实现**:
- 普通用户注册时可选择创建租户或加入现有租户
- 创建租户时设置 tenantId 和 tenantRole = OWNER
- 加入租户时设置 tenantId 和 tenantRole = MEMBER
- 系统管理员（role=ADMIN）无租户，tenantId 为 null
- email 唯一约束改为 (email, tenantId) 组合唯一，允许不同租户相同邮箱

### Requirement: JWT 认证
**原实现**: JWT 只包含 userId。

**新实现**:
- JWT payload 包含 userId、tenantId（可为 null）、tenantRole（可为 null）、role
- 认证中间件将 tenantId 注入请求上下文
- 系统管理员的 JWT 包含 role=ADMIN，tenantId 为 null

### Requirement: 数据源管理
**原实现**: 按 userId 隔离。

**新实现**:
- 有租户的用户按 tenantId 隔离
- 租户内所有成员共享数据源
- 权限检查基于 tenantRole（VIEWER 只能读，MEMBER 可上传，ADMIN/OWNER 可管理）
- 系统管理员可访问所有数据源

## REMOVED Requirements
无
