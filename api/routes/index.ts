import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
// 这里示例用伪 storage，你替换成真实的数据库操作模块
import { storage } from "../storage"; 
import { z } from "zod";

function generateCardCode(prefix?: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 12;
  let result = prefix ? `${prefix}-` : "";

  for (let i = 0; i < codeLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 根目录返回状态信息，避免访问根路径404
  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Kami Server API is running" });
  });

  // 生成卡密
  app.post("/api/generate", async (req: Request, res: Response) => {
    try {
      const { count, expiryDays, prefix } = req.body as {
        count: number;
        expiryDays: number;
        prefix?: string;
      };

      const codes: string[] = [];
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      for (let i = 0; i < count; i++) {
        let code: string;
        let attempts = 0;
        do {
          code = generateCardCode(prefix);
          attempts++;
          if (attempts > 100) {
            throw new Error("Failed to generate unique card code");
          }
        } while (await storage.getCardCode(code));

        await storage.createCardCode({
          code,
          status: "unused",
          prefix: prefix || null,
          expiresAt,
        });

        codes.push(code);
      }

      await storage.createActivity({
        type: "generated",
        count,
        message: `生成了 ${count} 个卡密${prefix ? `，前缀: ${prefix}` : ""}`,
      });

      res.json({
        success: true,
        message: "卡密生成成功",
        data: {
          codes,
          count,
          expiresAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "生成卡密失败",
      });
    }
  });

  // 验证卡密
  app.post("/api/verify", async (req: Request, res: Response) => {
    try {
      const { cardCode, usedBy } = req.body as { cardCode: string; usedBy?: string };

      const card = await storage.getCardCode(cardCode);

      if (!card) {
        res.status(404).json({
          success: false,
          message: "卡密不存在",
        });
        return;
      }

      if (card.status === "used") {
        res.json({
          success: true,
          message: "卡密已被使用",
          data: {
            code: cardCode,
            status: card.status,
            usedAt: card.usedAt,
            usedBy: card.usedBy,
          },
        });
        return;
      }

      if (card.status === "expired") {
        res.status(400).json({
          success: false,
          message: "卡密已过期",
          data: {
            code: cardCode,
            status: card.status,
            expiresAt: card.expiresAt,
          },
        });
        return;
      }

      await storage.updateCardCode(cardCode, {
        status: "used",
        usedAt: new Date(),
        usedBy: usedBy || "unknown",
      });

      await storage.createActivity({
        type: "used",
        cardCode,
        message: `卡密 ${cardCode} 已被使用`,
      });

      res.json({
        success: true,
        message: "卡密验证成功",
        data: {
          code: cardCode,
          status: "valid",
          expiresAt: card.expiresAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "验证卡密失败",
      });
    }
  });

  // 获取卡密列表
  app.get("/api/cards", async (req: Request, res: Response) => {
    try {
      const { status, search } = req.query as { status?: string; search?: string };
      const cards = await storage.getCardCodes({ status, search });

      res.json({
        success: true,
        data: cards,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取卡密列表失败",
      });
    }
  });

  // 删除卡密
  app.delete("/api/cards/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const success = await storage.deleteCardCode(code);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "卡密不存在",
        });
        return;
      }

      res.json({
        success: true,
        message: "卡密删除成功",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "删除卡密失败",
      });
    }
  });

  // 统计数据
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取统计数据失败",
      });
    }
  });

  // 活动记录
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivities(limit);
      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取活动记录失败",
      });
    }
  });

  return createServer(app);
}
