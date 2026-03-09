require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shuoshuo', require('./routes/shuoshuo'));
app.use('/api/comments', require('./routes/comments'));

app.get('/', (req, res) => {
    res.json({ message: 'Artitalk API Server' });
});

// 本地开发时使用
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Vercel 导出
module.exports = app;
