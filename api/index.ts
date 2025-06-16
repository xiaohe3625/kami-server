import express from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes/index";

dotenv.config();

const app = express();
app.use(express.json()); // 解析 JSON 请求体

// 注册所有路由
registerRoutes(app).then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
