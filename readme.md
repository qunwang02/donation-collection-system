# 护持项目收集系统

一个完整的护持项目数据收集和管理系统，包含前端数据收集页面和后端API服务器。

## 功能特点

### 前端页面
1. **数据收集页面** (`index.html`)
   - 填写护持项目信息
   - 自动计算金额（新台币/人民币）
   - 本地存储数据
   - 提交到服务器
   - 数据导出（CSV）

2. **数据查看页面** (`view-data.html`)
   - 查看所有提交的数据
   - 筛选和搜索功能
   - 数据统计和分析
   - 导出功能（CSV、Excel、PDF）

### 后端API服务器
- RESTful API接口
- 数据持久化存储
- 健康检查端点
- 数据统计功能
- 错误处理和日志

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **存储**: JSON文件存储（可升级到数据库）
- **部署**: 支持Render、Heroku、Vercel等平台

## 快速开始

### 本地运行

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/donation-collection-system.git
   cd donation-collection-system/server