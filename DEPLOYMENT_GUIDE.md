# Artitalk MongoDB 版本部署到博客指南

## 📋 部署流程概览

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  后端服务    │────▶│   云服务器   │────▶│  MongoDB    │
│  (Node.js)  │     │  (Railway等) │     │  (Atlas)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │ 提供 API 接口
       ▼
┌─────────────┐
│    博客      │
│ (任何平台)   │
└─────────────┘
```

## 1️⃣ 部署后端服务

### 方案 A: Railway（推荐，简单免费）

**步骤：**

1. **注册 Railway 账号**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权 Railway 访问你的 GitHub

3. **上传代码到 GitHub**
   ```bash
   # 在项目根目录创建 git 仓库
   git init
   git add .
   git commit -m "Initial commit"
   
   # 创建 GitHub 仓库并推送
   git remote add origin https://github.com/你的用户名/artitalk-mongodb.git
   git push -u origin main
   ```

4. **在 Railway 中部署**
   - 选择你刚推送的仓库
   - Railway 会自动检测 Node.js 项目并部署
   - 添加环境变量：
     - `MONGODB_URI`: 你的 MongoDB Atlas 连接字符串
     - `JWT_SECRET`: 随机生成的强密码
     - `PORT`: 3000

5. **获取域名**
   - 部署完成后，Railway 会提供一个域名
   - 如：`https://artitalk-api-production.up.railway.app`
   - 测试：`https://artitalk-api-production.up.railway.app/api/shuoshuo`

### 方案 B: Render（免费）

1. 访问 https://render.com
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 设置：
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 添加环境变量
6. 部署

### 方案 C: 阿里云/腾讯云（国内推荐）

1. 购买轻量应用服务器（学生优惠约 10元/月）
2. 安装 Node.js 和 PM2
3. 上传代码
4. 使用 PM2 启动服务
5. 配置 Nginx 反向代理

## 2️⃣ 准备前端文件

### 方式一：使用 CDN（推荐）

将以下文件上传到你的 CDN 或对象存储：

1. **api-client.js** - API 客户端
2. **artitalk-mongodb.js** - 修改后的 Artitalk（需要将 src/main.js 中的 LeanCloud 代码替换为 MongoDB 版本）
3. **artitalk.css** - 样式文件（从 dist/css/ 复制）

### 方式二：直接使用 jsDelivr（从 GitHub 加载）

如果你将代码推送到 GitHub，可以直接使用 jsDelivr：

```html
<script src="https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/src/api-client.js"></script>
```

## 3️⃣ 在博客中集成

### Hexo 博客示例

在主题文件中添加（如 `themes/你的主题/layout/_partial/artitalk.ejs`）：

```html
<!-- Artitalk MongoDB 版本 -->
<div id="artitalk-container"></div>

<script>
    // 配置 API 地址
    var apiUrl = 'https://your-railway-app.up.railway.app/api';
</script>
<script src="https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/src/api-client.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/dist/css/artitalk.min.css">
<script src="https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/dist/js/artitalk-mongodb.js"></script>

<script>
    new Artitalk({
        el: '#artitalk-container',
        pageSize: 5
    });
</script>
```

### Hugo 博客示例

创建 `layouts/shortcodes/artitalk.html`：

```html
<div id="artitalk-{{ .Get 0 }}"></div>

<script>
    var apiUrl = 'https://your-railway-app.up.railway.app/api';
</script>
<script src="https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/src/api-client.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/dist/css/artitalk.min.css">
<script src="https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/dist/js/artitalk-mongodb.js"></script>

<script>
    new Artitalk({
        el: '#artitalk-{{ .Get 0 }}',
        pageSize: {{ .Get 1 | default 5 }}
    });
</script>
```

在文章中使用：
```markdown
{{< artitalk "main" 10 >}}
```

### VuePress 博客示例

创建 `.vuepress/components/Artitalk.vue`：

```vue
<template>
  <div id="artitalk-container"></div>
</template>

<script>
export default {
  mounted() {
    window.apiUrl = 'https://your-railway-app.up.railway.app/api';
    
    // 动态加载脚本
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };
    
    // 加载依赖
    loadScript('https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/src/api-client.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/gh/你的用户名/artitalk-mongodb@main/dist/js/artitalk-mongodb.js'))
      .then(() => {
        new Artitalk({
          el: '#artitalk-container',
          pageSize: 5
        });
      });
  }
}
</script>
```

## 4️⃣ 完整集成代码

### 最简单的集成方式（只显示说说列表）

如果你只需要在博客中显示说说，不需要发布功能：

```html
<div id="my-shuoshuo"></div>

<script>
async function loadShuoshuo() {
    const API_URL = 'https://your-railway-app.up.railway.app/api';
    
    try {
        const response = await fetch(`${API_URL}/shuoshuo?page=0&pageSize=10`);
        const list = await response.json();
        
        let html = '<div style="max-width: 800px; margin: 0 auto;">';
        list.forEach(item => {
            html += `
                <div style="
                    background: #f5f5f5;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 8px;
                    border-left: 4px solid #4CAF50;
                ">
                    <div>${item.attributes.atContentHtml}</div>
                    <div style="color: #999; font-size: 12px; margin-top: 10px;">
                        ${new Date(item.createdAt).toLocaleString('zh-CN')}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        document.getElementById('my-shuoshuo').innerHTML = html;
    } catch (error) {
        document.getElementById('my-shuoshuo').innerHTML = '<p>加载失败</p>';
    }
}

loadShuoshuo();
</script>
```

## 5️⃣ 常见问题

### Q: 跨域错误 (CORS)
A: 在后端 `server/index.js` 中配置允许的域名：
```javascript
app.use(cors({
    origin: ['https://your-blog.com', 'https://your-blog.github.io']
}));
```

### Q: 如何更新代码？
A: 修改代码后推送到 GitHub，Railway/Render 会自动重新部署

### Q: 数据库满了怎么办？
A: MongoDB Atlas 免费版有 512MB 限制，可以：
- 定期清理旧数据
- 升级到付费版
- 使用自托管 MongoDB

### Q: 如何备份数据？
A: 使用 MongoDB Atlas 的自动备份功能，或手动导出：
```bash
mongodump --uri="your-connection-string" --out=backup/
```

## 6️⃣ 成本估算

| 项目 | 免费额度 | 付费版 |
|------|---------|--------|
| Railway | $5/月 | $5+/月 |
| Render | 免费（有休眠） | $7+/月 |
| MongoDB Atlas | 512MB | $9+/月 |
| 阿里云/腾讯云 | 学生机 10元/月 | 50-100元/月 |

**推荐组合（免费）**：Railway ($5) + MongoDB Atlas (免费层) = 完全免费！

## 7️⃣ 安全建议

1. **修改 JWT_SECRET** - 使用随机生成的强密码
2. **配置 MongoDB IP 白名单** - 只允许后端服务器访问
3. **启用 HTTPS** - Railway/Render 默认提供
4. **定期更新依赖** - `npm audit fix`
5. **不要提交 .env 文件** - 添加到 .gitignore
