import { Express } from "express";

interface Card {
  code: string;
  status: "unused" | "used";
}

const cards: Card[] = [];

function generateCardCode(prefix?: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 12;
  let code = prefix ? prefix + "-" : "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function registerRoutes(app: Express) {
  // 生成卡密接口
  app.post("/api/generate", (req, res) => {
    const { count = 1, prefix } = req.body;
    const generatedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = generateCardCode(prefix);
      cards.push({ code, status: "unused" });
      generatedCodes.push(code);
    }

    res.json({
      success: true,
      message: `${count} 个卡密生成成功`,
      data: generatedCodes,
    });
  });

  // 验证卡密接口
  app.post("/api/verify", (req, res) => {
    const { code } = req.body;
    const card = cards.find(c => c.code === code);

    if (!card) {
      return res.status(404).json({ success: false, message: "卡密不存在" });
    }

    if (card.status === "used") {
      return res.json({ success: true, message: "卡密已被使用" });
    }

    card.status = "used";
    res.json({ success: true, message: "卡密验证成功" });
  });
}
