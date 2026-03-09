# Vercel 部署指南

## 📋 部署步骤

### 1. 准备代码

确保以下文件已创建：
- `vercel.json` - Vercel 配置文件
- `package.json` - 项目依赖
- `server/index.js` - 已适配 Vercel

### 2. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 3. 登录 Vercel

```bash
vercel login
```

### 4. 部署

在项目根目录运行：

```bash
vercel
```

按照提示操作：
- 确认项目路径
- 选择或创建项目
- 等待部署完成

### 5. 配置环境变量

部署完成后，在 Vercel 控制台设置环境变量：

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 点击 "Settings" → "Environment Variables"
4. 添加以下变量：
   - `MONGODB_URI` - MongoDB Atlas 连接字符串
   - `JWT_SECRET` - JWT 密钥（随机字符串）

5. 点击 "Save" 保存
6. 重新部署：`vercel --prod`

## 🌐 使用 GitHub 自动部署

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/artitalk-mongodb.git
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 访问 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 授权 Vercel 访问你的 GitHub
4. 选择 `artitalk-mongodb` 仓库
5. 配置环境变量（同上）
6. 点击 "Deploy"

## 📁 项目结构

```
artitalk/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Shuoshuo.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── shuoshuo.js
│   │   └── comments.js
│   └── index.js
├── vercel.json
├── package.json
└── .gitignore
```

## 🔧 配置说明

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    }
  ]
}
```

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `MONGODB_URI` | MongoDB 连接字符串 | `mongodb+srv://user:pass@cluster.mongodb.net/artitalk` |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key-here` |

## 🚀 部署后测试

部署完成后，你会获得一个域名：
```
https://artitalk-api-你的用户名.vercel.app
```

测试 API：
```bash
curl https://artitalk-api-你的用户名.vercel.app/api/shuoshuo
```

## 📝 更新代码

修改代码后推送到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update something"
git push
```

## ⚠️ 注意事项

1. **免费额度**：Vercel 免费版有 100GB 带宽限制
2. **Serverless 限制**：API 请求有 10 秒超时限制
3. **冷启动**：长时间不访问会有冷启动延迟
4. **数据库连接**：建议使用 MongoDB Atlas，不要自托管

## 🔗 前端配置

部署后，在前端代码中修改 API 地址：

```javascript
var apiUrl = 'https://artitalk-api-你的用户名.vercel.app/api';
```
