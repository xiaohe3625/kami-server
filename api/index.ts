import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes/index";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // 允许所有跨域请求
app.use(express.json()); // 解析 JSON 请求体

registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
