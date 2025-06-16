import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());           // 允许所有跨域请求
app.use(express.json());   // 解析 JSON 请求体

// 注册你的路由
registerRoutes(app).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});
