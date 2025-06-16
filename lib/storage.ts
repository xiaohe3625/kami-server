import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const storage = {
  async createCardCode(card) {
    return supabase.from("card_codes").insert(card);
  },

  async getCardCode(code: string) {
    const { data } = await supabase
      .from("card_codes")
      .select("*")
      .eq("code", code)
      .single();
    return data;
  },

  async updateCardCode(code: string, updates) {
    return supabase.from("card_codes").update(updates).eq("code", code);
  },

  async deleteCardCode(code: string) {
    const { error } = await supabase
      .from("card_codes")
      .delete()
      .eq("code", code);
    return !error;
  },

  async getCardCodes(filter) {
    let query = supabase.from("card_codes").select("*");
    if (filter.status) query = query.eq("status", filter.status);
    if (filter.search)
      query = query.ilike("code", `%${filter.search}%`);
    return (await query).data;
  },

  async createActivity(log) {
    return supabase.from("activities").insert(log);
  },

  async getStats() {
    const { data: used } = await supabase
      .from("card_codes")
      .select("*", { count: "exact", head: true })
      .eq("status", "used");
    const { data: unused } = await supabase
      .from("card_codes")
      .select("*", { count: "exact", head: true })
      .eq("status", "unused");

    return {
      used: used?.length ?? 0,
      unused: unused?.length ?? 0,
    };
  },

  async getRecentActivities(limit = 10) {
    return (
      await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)
    ).data;
  },
};
