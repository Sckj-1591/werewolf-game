import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// attackテーブルから指定された部屋IDのデータを取得
export const getAttack = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("attack")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
  },
});
