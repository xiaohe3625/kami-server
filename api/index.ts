import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoutes } from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 根路径响应
app.get("/", (req, res) => {
  res.json({ message: "Kami Server API is running" });
});

registerRoutes(app).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});
