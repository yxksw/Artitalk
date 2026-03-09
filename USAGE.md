# Artitalk MongoDB 版本使用说明

## 🚀 快速开始

### 1. 确保 MongoDB 已启动

**选项 A: 本地 MongoDB**
```bash
# 启动 MongoDB 服务（Windows）
net start MongoDB

# 或者使用 mongod 命令
mongod --dbpath "C:\data\db"
```

**选项 B: MongoDB Atlas（云数据库）**
1. 访问 https://www.mongodb.com/atlas
2. 注册并创建免费集群
3. 修改 `server/.env` 文件中的连接字符串：
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artitalk
```

### 2. 启动后端服务

```bash
cd server
npm install  # 首次运行需要安装依赖
npm start
```

看到以下输出表示启动成功：
```
MongoDB Connected: localhost
Server running on port 3000
```

### 3. 测试页面

打开浏览器访问：`http://localhost:3000`

你应该看到：`{"message":"Artitalk API Server"}`

### 4. 运行测试页面

直接双击打开 `test-mongodb.html` 文件，或者使用本地服务器：

```bash
# 使用 Python 启动简单服务器
python -m http.server 8080

# 然后访问 http://localhost:8080/test-mongodb.html
```

## 📖 使用流程

### 第一步：注册账号

1. 打开测试页面
2. 输入用户名和密码
3. 点击"注册"按钮

### 第二步：登录

1. 输入已注册的用户名和密码
2. 点击"登录"按钮
3. 登录成功后会显示发布说说的区域

### 第三步：发布说说

1. 在文本框中输入内容
2. 点击"发布"按钮
3. 说说会显示在下方的列表中

### 第四步：查看说说

- 页面会自动加载说说列表
- 点击"刷新列表"按钮可以获取最新内容

## 🔧 API 接口说明

### 用户认证

#### 注册
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "123456",
    "img": "https://example.com/avatar.png",  // 可选
    "imgToken": "token123"  // 可选
}
```

#### 登录
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "123456"
}
```

#### 获取当前用户信息
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer <token>
```

### 说说管理

#### 获取说说列表
```http
GET http://localhost:3000/api/shuoshuo?page=0&pageSize=5
```

#### 创建说说（需要登录）
```http
POST http://localhost:3000/api/shuoshuo
Content-Type: application/json
Authorization: Bearer <token>

{
    "atContentMd": "说说内容",
    "atContentHtml": "<p>说说内容</p>",
    "userOs": "windows",
    "avatar": "https://example.com/avatar.png"
}
```

#### 更新说说（需要登录）
```http
PUT http://localhost:3000/api/shuoshuo/<id>
Content-Type: application/json
Authorization: Bearer <token>

{
    "atContentMd": "更新后的内容",
    "atContentHtml": "<p>更新后的内容</p>"
}
```

#### 删除说说（需要登录）
```http
DELETE http://localhost:3000/api/shuoshuo/<id>
Authorization: Bearer <token>
```

### 评论管理

#### 获取评论列表
```http
GET http://localhost:3000/api/comments/<shuoshuo_id>
```

#### 创建评论
```http
POST http://localhost:3000/api/comments
Content-Type: application/json

{
    "atId": "shuoshuo_id",
    "content": "评论内容",
    "nickname": "访客",
    "email": "visitor@example.com",
    "avatar": "https://example.com/avatar.png"
}
```

#### 获取评论数量
```http
GET http://localhost:3000/api/comments/count/<shuoshuo_id>
```

## 📝 前端集成

### 1. 引入 API 客户端

```html
<script src="./src/api-client.js"></script>
```

### 2. 配置 API 地址（可选）

默认使用 `http://localhost:3000/api`，如需修改：

```html
<script>
    var apiUrl = 'http://your-server.com/api';
</script>
<script src="./src/api-client.js"></script>
```

### 3. 使用 API 客户端

```javascript
// 登录
atAPI.login('username', 'password')
    .then(data => {
        console.log('登录成功:', data.user);
    })
    .catch(error => {
        console.error('登录失败:', error.message);
    });

// 获取当前用户
const user = atAPI.getCurrentUser();

// 发布说说
atAPI.createShuoshuo({
    atContentMd: '内容',
    atContentHtml: '<p>内容</p>',
    userOs: 'windows',
    avatar: 'https://example.com/avatar.png'
});

// 获取说说列表
atAPI.getShuoshuoList(0, 10)
    .then(shuoshuos => {
        console.log('说说列表:', shuoshuos);
    });
```

## 🔐 注意事项

### 1. 跨域问题

如果前端和后端运行在不同域名/端口，后端已配置 CORS 允许所有来源。生产环境建议配置具体的允许域名：

```javascript
// server/index.js
app.use(cors({
    origin: 'https://your-website.com'
}));
```

### 2. 安全性

- 生产环境请修改 `server/.env` 中的 `JWT_SECRET` 为强密码
- 使用 HTTPS 协议
- 配置 MongoDB 认证（不要暴露无密码的数据库）

### 3. 数据迁移

从 LeanCloud 迁移数据：

1. 从 LeanCloud 控制台导出 `shuoshuo` 和 `atComment` 表为 JSON
2. 使用迁移脚本导入（参考 MIGRATION_GUIDE.md）

## 🐛 常见问题

### Q: 后端启动失败，提示 "MongoDB Connection Error"
A: 确保 MongoDB 已启动，或检查 `.env` 中的连接字符串是否正确

### Q: 前端提示 "API request failed"
A: 检查后端服务是否正常运行，以及 `apiUrl` 配置是否正确

### Q: 登录后刷新页面需要重新登录
A: 这是正常的，Token 存储在 localStorage 中，检查浏览器是否禁用了 localStorage

### Q: 如何修改默认端口？
A: 修改 `server/.env` 文件中的 `PORT` 变量

## 📞 支持

如有问题，请查看：
- 迁移指南：`MIGRATION_GUIDE.md`
- 代码替换参考：`src/main-mongodb.js`
