// api/storage.ts

export interface CardCode {
  code: string;
  status: "unused" | "used" | "expired";
  prefix?: string | null;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
}

interface Activity {
  type: string;
  count?: number;
  cardCode?: string;
  message: string;
  timestamp: Date;
}

const cardCodes: CardCode[] = [];
const activities: Activity[] = [];

/** 根据卡密code获取卡密 */
export async function getCardCode(code: string): Promise<CardCode | undefined> {
  return cardCodes.find(c => c.code === code);
}

/** 新增卡密 */
export async function createCardCode(card: CardCode): Promise<void> {
  cardCodes.push(card);
}

/** 更新卡密 */
export async function updateCardCode(code: string, updates: Partial<CardCode>): Promise<void> {
  const card = cardCodes.find(c => c.code === code);
  if (card) Object.assign(card, updates);
}

/** 查询卡密列表，支持按状态和搜索过滤 */
export async function getCardCodes(filter?: { status?: string; search?: string }): Promise<CardCode[]> {
  let result = cardCodes;
  if (filter?.status) {
    result = result.filter(c => c.status === filter.status);
  }
  if (filter?.search) {
    result = result.filter(c => c.code.includes(filter.search));
  }
  return result;
}

/** 删除指定卡密 */
export async function deleteCardCode(code: string): Promise<boolean> {
  const index = cardCodes.findIndex(c => c.code === code);
  if (index === -1) return false;
  cardCodes.splice(index, 1);
  return true;
}

/** 记录活动日志 */
export async function createActivity(activity: Omit<Activity, "timestamp">): Promise<void> {
  activities.unshift({ ...activity, timestamp: new Date() });
  // 限制日志长度，比如只保留最近100条
  if (activities.length > 100) activities.pop();
}

/** 获取统计数据 */
export async function getStats() {
  return {
    total: cardCodes.length,
    used: cardCodes.filter(c => c.status === "used").length,
    unused: cardCodes.filter(c => c.status === "unused").length,
    expired: cardCodes.filter(c => c.status === "expired").length,
  };
}

/** 获取最近的活动日志 */
export async function getRecentActivities(limit: number): Promise<Activity[]> {
  return activities.slice(0, limit);
}

// 关键：导出一个统一对象
export const storage = {
  getCardCode,
  createCardCode,
  updateCardCode,
  getCardCodes,
  deleteCardCode,
  createActivity,
  getStats,
  getRecentActivities,
};
