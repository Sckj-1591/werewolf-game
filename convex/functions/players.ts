import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// プレイヤー一覧取得
export const getPlayers = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
  },
});

// プレイヤー追加
export const addPlayer = mutation({
  args: { roomId: v.string(), name: v.string() },
  handler: async (ctx, { roomId, name }) => {
    return await ctx.db.insert("players", {
      roomId,
      name,
      joinedAt: Date.now(),
      alive: true,
      role: null,
    });
  },
});

// プレイヤー削除
export const removePlayer = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    await ctx.db.delete(playerId);
  },
});
