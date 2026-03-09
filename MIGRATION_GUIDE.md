# Artitalk 迁移指南

## 已完成的后端 API 服务

后端服务已创建在 `server/` 目录下，包含以下功能：

### 启动后端服务

```bash
cd server
npm install
npm start
```

后端服务将在 `http://localhost:3000` 运行。

### API 端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出
- `GET /api/shuoshuo?page=0&pageSize=5` - 获取说说列表
- `POST /api/shuoshuo` - 创建说说
- `GET /api/shuoshuo/:id` - 获取单个说说
- `PUT /api/shuoshuo/:id` - 更新说说
- `DELETE /api/shuoshuo/:id` - 删除说说
- `GET /api/comments/:atId` - 获取评论列表
- `POST /api/comments` - 创建评论
- `GET /api/comments/count/:atId` - 获取评论数量

## 前端修改步骤

### 1. 引入 API 客户端

在 HTML 文件中，在引入 `main.js` 之前引入 `api-client.js`：

```html
<script src="./api-client.js"></script>
<script src="./main.js"></script>
```

### 2. 配置 API 地址

在初始化 Artitalk 时添加 `apiUrl` 配置：

```javascript
new Artitalk({
    apiUrl: 'http://localhost:3000/api',  // 你的后端 API 地址
    // ... 其他配置
})
```

### 3. 需要替换的 LeanCloud 代码

以下是 main.js 中需要替换的关键代码：

#### 3.1 替换 AV.init (第 641, 647 行)
**原代码：**
```javascript
AV.init({
    appId: appId,
    appKey: appKey,
    serverURL: serverURL,
});
```
**替换为：**
```javascript
// 初始化已通过 api-client.js 完成，无需 AV.init
```

#### 3.2 替换 AV.User.current() (多处)
**原代码：**
```javascript
let currentUser = AV.User.current();
```
**替换为：**
```javascript
let currentUser = atAPI.getCurrentUser();
```

#### 3.3 替换 AV.User.logIn (第 900 行)
**原代码：**
```javascript
AV.User.logIn(userName, passWord).then((user) => {
    // ...
}, (error) => {
    // ...
});
```
**替换为：**
```javascript
atAPI.login(userName, passWord).then((data) => {
    let user = data.user;
    // ...
}).catch((error) => {
    // ...
});
```

#### 3.4 替换 AV.Object.extend 和 save (第 1014 行)
**原代码：**
```javascript
let artitalkObject = AV.Object.extend('shuoshuo');
let atObject = new artitalkObject();
// ... 设置属性 ...
atObject.save().then(function (res) {
    // ...
});
```
**替换为：**
```javascript
atAPI.createShuoshuo({
    atContentMd: shuoshuoContentMd,
    atContentHtml: shuoshuoContentHtml,
    userOs: userOs,
    avatar: atAvatar
}).then(function (res) {
    // ...
});
```

#### 3.5 替换 AV.Object.createWithoutData 和 destroy (第 1116 行)
**原代码：**
```javascript
const deletes = AV.Object.createWithoutData('shuoshuo', id);
deletes.destroy().then(function (success) {
    // ...
});
```
**替换为：**
```javascript
atAPI.deleteShuoshuo(id).then(function (success) {
    // ...
});
```

#### 3.6 替换 AV.Query (第 1424 行)
**原代码：**
```javascript
let query = new AV.Query('shuoshuo');
query.descending('createdAt');
query.limit(pageSize);
query.skip(pageSize * pageNum);
query.find().then(function (shuoContent) {
    // ...
});
```
**替换为：**
```javascript
atAPI.getShuoshuoList(pageNum, pageSize).then(function (shuoContent) {
    // ...
});
```

#### 3.7 替换评论查询 (第 1635, 2017 行)
**原代码：**
```javascript
let countQuery = new AV.Query('atComment');
countQuery.equalTo('atId', id);
countQuery.descending('createdAt');
countQuery.find().then(res => {
    // ...
});
```
**替换为：**
```javascript
atAPI.getComments(id).then(res => {
    // ...
});
```

#### 3.8 替换评论创建 (第 1821 行)
**原代码：**
```javascript
let comment = AV.Object.extend('atComment');
let atComment = new comment();
// ... 设置属性 ...
atComment.save().then(function (res) {
    // ...
});
```
**替换为：**
```javascript
atAPI.createComment({
    atId: id,
    content: commentContent,
    nickname: nickname,
    email: email,
    avatar: avatar
}).then(function (res) {
    // ...
});
```

#### 3.9 替换评论数量查询
**原代码：**
```javascript
let countQuery = new AV.Query('atComment');
countQuery.equalTo('atId', id);
countQuery.find().then(res => {
    let count = res.length;
    // ...
});
```
**替换为：**
```javascript
atAPI.getCommentCount(id).then(count => {
    // ...
});
```

## 数据迁移

### 从 LeanCloud 导出数据

1. 登录 LeanCloud 控制台
2. 进入数据存储 -> 结构化数据
3. 选择 `shuoshuo` 和 `atComment` 表
4. 导出为 JSON 格式

### 导入到 MongoDB

使用以下脚本导入数据：

```javascript
// migrate.js
const mongoose = require('mongoose');
const fs = require('fs');

const Shuoshuo = require('./server/models/Shuoshuo');
const Comment = require('./server/models/Comment');
const User = require('./server/models/User');

async function migrate() {
    await mongoose.connect('mongodb://localhost:27017/artitalk');
    
    // 读取 LeanCloud 导出的 JSON 文件
    const shuoshuoData = JSON.parse(fs.readFileSync('./shuoshuo.json', 'utf8'));
    const commentData = JSON.parse(fs.readFileSync('./atComment.json', 'utf8'));
    
    // 迁移说说数据
    for (const item of shuoshuoData) {
        await Shuoshuo.create({
            atContentMd: item.atContentMd,
            atContentHtml: item.atContentHtml,
            userOs: item.userOs,
            avatar: item.avatar,
            user: item.user.objectId, // 需要映射到新的用户ID
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        });
    }
    
    // 迁移评论数据
    for (const item of commentData) {
        await Comment.create({
            atId: item.atId,
            content: item.content,
            nickname: item.nickname,
            email: item.email,
            avatar: item.avatar,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        });
    }
    
    console.log('Migration completed!');
    process.exit(0);
}

migrate().catch(console.error);
```

## 注意事项

1. **用户数据迁移**：LeanCloud 的用户密码是加密的，无法直接迁移。需要用户重新注册或重置密码。

2. **文件存储**：如果使用了 LeanCloud 的文件存储功能，需要将文件迁移到其他存储服务（如阿里云 OSS、腾讯云 COS 等）。

3. **CORS 配置**：确保后端服务正确配置 CORS，允许前端域名访问。

4. **生产环境**：在生产环境中，请确保：
   - 使用 HTTPS
   - 设置强密码的 JWT_SECRET
   - 配置 MongoDB 认证
   - 使用环境变量管理敏感信息
