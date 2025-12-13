# 护持项目信息收集系统

基于Node.js + MongoDB + Express构建的信息收集和管理系统，支持数据收集、存储、管理和分析。

## 功能特性

### 前端收集页面 (`index.html`)
- 响应式表格设计，支持移动设备
- 本地数据存储（浏览器LocalStorage）
- 数据验证和自动填充
- 服务器同步功能
- CSV导出功能
- 实时数据统计

### 后端API (`server/`)
- RESTful API设计
- MongoDB数据存储
- 数据验证和错误处理
- 分页和筛选支持
- 数据统计和分析
- 安全防护（CORS、速率限制、Helmet）

### 管理后台 (`admin.html`)
- 数据查看和筛选
- 详细数据查看
- 数据统计和图表
- CSV/JSON导出
- 操作日志
- 响应式设计

## 部署步骤

### 1. 本地开发环境
```bash
# 克隆项目
git clone <repository-url>
cd donation-collection-system

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置MongoDB连接字符串等

# 启动开发服务器
npm run dev