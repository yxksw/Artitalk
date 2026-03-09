# Artitalk MongoDB 版本 - 前端调用文档

## 📋 目录

1. [快速开始](#快速开始)
2. [API 基础](#api-基础)
3. [用户认证](#用户认证)
4. [说说管理](#说说管理)
5. [评论管理](#评论管理)
6. [完整示例](#完整示例)
7. [错误处理](#错误处理)
8. [最佳实践](#最佳实践)

---

## 快速开始

### 基础配置

```javascript
// API 基础地址
const API_BASE_URL = 'https://artitalk.050815.xyz/api';

// 获取存储的 Token
const getToken = () => localStorage.getItem('artitalk_token');

// 通用请求头
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});
```

---

## API 基础

### 请求格式

所有 API 请求都遵循 RESTful 规范：

```
基础URL: https://artitalk.050815.xyz/api
```

### 响应格式

成功响应：
```json
{
    "id": "...",
    "attributes": {
        "atContentMd": "...",
        "atContentHtml": "...",
        "userOs": "...",
        "avatar": "..."
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
        "username": "...",
        "img": "..."
    }
}
```

错误响应：
```json
{
    "message": "错误描述"
}
```

---

## 用户认证

### 1. 用户注册

**接口：** `POST /api/auth/register`

**权限：** 公开

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（唯一） |
| password | string | 是 | 密码 |
| img | string | 否 | 头像URL |
| imgToken | string | 否 | 图片Token |

**请求示例：**

```javascript
async function register(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // 保存 Token 和用户信息
            localStorage.setItem('artitalk_token', data.token);
            localStorage.setItem('artitalk_user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 使用示例
register('myusername', 'mypassword')
    .then(result => {
        if (result.success) {
            console.log('注册成功:', result.user);
        } else {
            console.error('注册失败:', result.error);
        }
    });
```

**响应示例：**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "...",
        "username": "myusername",
        "img": "https://...",
        "imgToken": "",
        "role": "user"
    }
}
```

---

### 2. 用户登录

**接口：** `POST /api/auth/login`

**权限：** 公开

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例：**

```javascript
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('artitalk_token', data.token);
            localStorage.setItem('artitalk_user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

### 3. 获取当前用户信息

**接口：** `GET /api/auth/me`

**权限：** 需要登录

**请求示例：**

```javascript
async function getCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, user: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

### 4. 退出登录

```javascript
function logout() {
    localStorage.removeItem('artitalk_token');
    localStorage.removeItem('artitalk_user');
    // 刷新页面或跳转到登录页
    window.location.reload();
}
```

---

### 5. 检查登录状态

```javascript
function checkLoginStatus() {
    const token = localStorage.getItem('artitalk_token');
    const user = JSON.parse(localStorage.getItem('artitalk_user') || '{}');
    
    return {
        isLoggedIn: !!token,
        isAdmin: user.role === 'admin',
        user: user
    };
}
```

---

## 说说管理

### 1. 获取说说列表

**接口：** `GET /api/shuoshuo`

**权限：** 公开

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 0 | 页码（从0开始） |
| pageSize | number | 5 | 每页数量 |

**请求示例：**

```javascript
async function getShuoshuoList(page = 0, pageSize = 5) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/shuoshuo?page=${page}&pageSize=${pageSize}`
        );

        const data = await response.json();

        if (response.ok) {
            return { success: true, list: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 使用示例
getShuoshuoList(0, 10).then(result => {
    if (result.success) {
        result.list.forEach(item => {
            console.log('内容:', item.attributes.atContentHtml);
            console.log('作者:', item.user.username);
            console.log('时间:', item.createdAt);
        });
    }
});
```

**响应示例：**

```json
[
    {
        "id": "...",
        "attributes": {
            "atContentMd": "原始Markdown内容",
            "atContentHtml": "<p>HTML内容</p>",
            "userOs": "windows",
            "avatar": "https://..."
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
            "username": "author",
            "img": "https://..."
        }
    }
]
```

---

### 2. 发布说说（仅管理员）

**接口：** `POST /api/shuoshuo`

**权限：** 管理员

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| atContentMd | string | 是 | Markdown 内容 |
| atContentHtml | string | 是 | HTML 内容 |
| userOs | string | 否 | 操作系统 |
| avatar | string | 否 | 头像URL |

**请求示例：**

```javascript
async function createShuoshuo(content) {
    // 简单的 Markdown 转 HTML
    const html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    const userOs = getOperatingSystem(); // 获取当前操作系统
    const user = JSON.parse(localStorage.getItem('artitalk_user') || '{}');

    try {
        const response = await fetch(`${API_BASE_URL}/shuoshuo`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                atContentMd: content,
                atContentHtml: html,
                userOs: userOs,
                avatar: user.img || 'https://fastly.jsdelivr.net/gh/drew233/cdn/logol.png'
            })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, shuoshuo: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 获取操作系统
function getOperatingSystem() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Windows') !== -1) return 'windows';
    if (userAgent.indexOf('Mac') !== -1) return 'Mac';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iOS') !== -1) return 'iOS';
    return 'Unknown';
}
```

---

### 3. 获取单个说说

**接口：** `GET /api/shuoshuo/:id`

**权限：** 公开

**请求示例：**

```javascript
async function getShuoshuo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/shuoshuo/${id}`);
        const data = await response.json();

        if (response.ok) {
            return { success: true, shuoshuo: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

### 4. 更新说说（仅管理员）

**接口：** `PUT /api/shuoshuo/:id`

**权限：** 管理员

**请求示例：**

```javascript
async function updateShuoshuo(id, content) {
    const html = content.replace(/\n/g, '<br>');

    try {
        const response = await fetch(`${API_BASE_URL}/shuoshuo/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                atContentMd: content,
                atContentHtml: html
            })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, shuoshuo: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

### 5. 删除说说（仅管理员）

**接口：** `DELETE /api/shuoshuo/:id`

**权限：** 管理员

**请求示例：**

```javascript
async function deleteShuoshuo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/shuoshuo/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

## 评论管理

### 1. 获取评论列表

**接口：** `GET /api/comments/:atId`

**权限：** 公开

**请求示例：**

```javascript
async function getComments(shuoshuoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${shuoshuoId}`);
        const data = await response.json();

        if (response.ok) {
            return { success: true, comments: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

### 2. 发表评论

**接口：** `POST /api/comments`

**权限：** 公开

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| atId | string | 是 | 说说ID |
| content | string | 是 | 评论内容 |
| nickname | string | 是 | 昵称 |
| email | string | 是 | 邮箱 |
| avatar | string | 否 | 头像URL |

**请求示例：**

```javascript
async function createComment(shuoshuoId, content, nickname, email) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                atId: shuoshuoId,
                content: content,
                nickname: nickname,
                email: email,
                avatar: ''
            })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, comment: data };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

### 3. 获取评论数量

**接口：** `GET /api/comments/count/:atId`

**权限：** 公开

**请求示例：**

```javascript
async function getCommentCount(shuoshuoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/count/${shuoshuoId}`);
        const data = await response.json();

        if (response.ok) {
            return { success: true, count: data.count };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

## 完整示例

### 完整的 Artitalk 组件

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的说说</title>
    <style>
        .artitalk-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .shuoshuo-item {
            background: #f5f5f5;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .shuoshuo-content {
            margin-bottom: 10px;
        }
        .shuoshuo-meta {
            color: #999;
            font-size: 12px;
        }
        .login-form, .post-form {
            margin-bottom: 20px;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #5568d3;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="artitalk-container">
        <h1>🎨 我的说说</h1>
        
        <!-- 登录区域 -->
        <div id="loginSection" class="login-form">
            <input type="text" id="username" placeholder="用户名">
            <input type="password" id="password" placeholder="密码">
            <button onclick="handleLogin()">登录</button>
            <button onclick="handleRegister()">注册</button>
        </div>

        <!-- 用户信息区域 -->
        <div id="userSection" class="hidden">
            <p>欢迎, <span id="currentUser"></span> 
               <span id="roleBadge"></span>
            </p>
            <button onclick="handleLogout()">退出</button>
        </div>

        <!-- 发布区域（仅管理员） -->
        <div id="postSection" class="post-form hidden">
            <textarea id="content" rows="3" placeholder="分享新鲜事..."></textarea>
            <button onclick="handlePost()">发布</button>
        </div>

        <!-- 说说列表 -->
        <div id="shuoshuoList"></div>
        
        <!-- 加载更多 -->
        <button onclick="loadMore()" id="loadMoreBtn">加载更多</button>
    </div>

    <script>
        const API_BASE_URL = 'https://artitalk.050815.xyz/api';
        let currentPage = 0;
        let currentUser = null;

        // 初始化
        window.onload = () => {
            const token = localStorage.getItem('artitalk_token');
            if (token) {
                currentUser = JSON.parse(localStorage.getItem('artitalk_user'));
                showLoggedIn();
            }
            loadShuoshuoList();
        };

        // 登录
        async function handleLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('artitalk_token', data.token);
                localStorage.setItem('artitalk_user', JSON.stringify(data.user));
                currentUser = data.user;
                showLoggedIn();
                loadShuoshuoList();
            } else {
                alert(data.message);
            }
        }

        // 注册
        async function handleRegister() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('注册成功，请登录');
            } else {
                alert(data.message);
            }
        }

        // 退出
        function handleLogout() {
            localStorage.removeItem('artitalk_token');
            localStorage.removeItem('artitalk_user');
            currentUser = null;
            location.reload();
        }

        // 显示登录状态
        function showLoggedIn() {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('userSection').classList.remove('hidden');
            document.getElementById('currentUser').textContent = currentUser.username;
            
            const isAdmin = currentUser.role === 'admin';
            document.getElementById('roleBadge').textContent = isAdmin ? '[管理员]' : '[用户]';
            
            if (isAdmin) {
                document.getElementById('postSection').classList.remove('hidden');
            }
        }

        // 发布说说
        async function handlePost() {
            const content = document.getElementById('content').value;
            if (!content) return;

            const token = localStorage.getItem('artitalk_token');
            const html = content.replace(/\n/g, '<br>');

            const response = await fetch(`${API_BASE_URL}/shuoshuo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    atContentMd: content,
                    atContentHtml: html,
                    userOs: 'web',
                    avatar: currentUser.img
                })
            });

            if (response.ok) {
                document.getElementById('content').value = '';
                currentPage = 0;
                loadShuoshuoList();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        }

        // 加载说说列表
        async function loadShuoshuoList() {
            const response = await fetch(
                `${API_BASE_URL}/shuoshuo?page=${currentPage}&pageSize=5`
            );
            const list = await response.json();

            const container = document.getElementById('shuoshuoList');
            
            if (currentPage === 0) {
                container.innerHTML = '';
            }

            list.forEach(item => {
                const div = document.createElement('div');
                div.className = 'shuoshuo-item';
                div.innerHTML = `
                    <div class="shuoshuo-content">${item.attributes.atContentHtml}</div>
                    <div class="shuoshuo-meta">
                        ${item.user.username} • ${item.attributes.userOs} • 
                        ${new Date(item.createdAt).toLocaleString()}
                    </div>
                `;
                container.appendChild(div);
            });
        }

        // 加载更多
        function loadMore() {
            currentPage++;
            loadShuoshuoList();
        }
    </script>
</body>
</html>
```

---

## 错误处理

### 常见错误码

| HTTP 状态码 | 说明 | 处理方式 |
|------------|------|----------|
| 200 | 成功 | - |
| 201 | 创建成功 | - |
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未授权 | 需要登录 |
| 403 | 禁止访问 | 需要管理员权限 |
| 404 | 资源不存在 | 检查ID是否正确 |
| 500 | 服务器错误 | 稍后重试 |

### 统一错误处理

```javascript
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            // 根据状态码处理
            switch (response.status) {
                case 401:
                    // Token 过期，清除登录状态
                    localStorage.removeItem('artitalk_token');
                    alert('登录已过期，请重新登录');
                    window.location.reload();
                    break;
                case 403:
                    alert('权限不足，需要管理员权限');
                    break;
                default:
                    alert(data.message || '请求失败');
            }
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

---

## 最佳实践

### 1. Token 管理

```javascript
// 封装 Token 操作
const TokenManager = {
    get() {
        return localStorage.getItem('artitalk_token');
    },
    set(token) {
        localStorage.setItem('artitalk_token', token);
    },
    remove() {
        localStorage.removeItem('artitalk_token');
        localStorage.removeItem('artitalk_user');
    },
    exists() {
        return !!this.get();
    }
};
```

### 2. 请求封装

```javascript
// API 客户端封装
class ArtitalkAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(path, options = {}) {
        const url = `${this.baseURL}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (TokenManager.exists()) {
            headers['Authorization'] = `Bearer ${TokenManager.get()}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    }

    // 用户认证
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        TokenManager.set(data.token);
        localStorage.setItem('artitalk_user', JSON.stringify(data.user));
        return data;
    }

    // 获取说说列表
    async getShuoshuoList(page = 0, pageSize = 5) {
        return this.request(`/shuoshuo?page=${page}&pageSize=${pageSize}`);
    }

    // 发布说说
    async createShuoshuo(content) {
        const html = content.replace(/\n/g, '<br>');
        const user = JSON.parse(localStorage.getItem('artitalk_user') || '{}');
        
        return this.request('/shuoshuo', {
            method: 'POST',
            body: JSON.stringify({
                atContentMd: content,
                atContentHtml: html,
                userOs: 'web',
                avatar: user.img
            })
        });
    }
}

// 使用
const api = new ArtitalkAPI('https://artitalk.050815.xyz/api');
```

### 3. 加载状态管理

```javascript
// 加载状态管理
class LoadingManager {
    constructor() {
        this.loadingElements = new Map();
    }

    start(key, element) {
        this.loadingElements.set(key, element);
        element.dataset.originalText = element.textContent;
        element.textContent = '加载中...';
        element.disabled = true;
    }

    stop(key) {
        const element = this.loadingElements.get(key);
        if (element) {
            element.textContent = element.dataset.originalText;
            element.disabled = false;
            this.loadingElements.delete(key);
        }
    }
}

const loading = new LoadingManager();

// 使用
async function loadData() {
    loading.start('loadBtn', document.getElementById('loadBtn'));
    try {
        const data = await api.getShuoshuoList();
        render(data);
    } finally {
        loading.stop('loadBtn');
    }
}
```

---

## 相关文件

- `test-production.html` - 完整测试页面
- `src/api-client.js` - API 客户端封装
- `blog-integration-example.html` - 博客集成示例

---

**文档版本：** 1.0  
**最后更新：** 2024年
