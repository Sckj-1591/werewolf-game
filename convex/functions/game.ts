import { query, mutation } from "convex/_generated/server";
import { v } from "convex/values";

// ゲームに参加
export const join = mutation({
  args: { roomId: v.string(), playerName: v.string() },
  handler: async (ctx, { roomId, playerName }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();

    if (!game) {
      // 新規ゲーム作成
      await ctx.db.insert("games", { roomId, phase: "waiting" });
    }

    await ctx.db.insert("players", { roomId, name: playerName });
  },
});

// ゲーム状態取得
export const getState = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();

    if (!game) return null;

    const players = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();

    return { ...game, players: players.map((p) => p.name) };
  },
});

// ゲーム開始
export const start = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();

    if (!game) throw new Error("Game not found");

    await ctx.db.patch(game._id, { phase: "night", day: 1 });
  },
});

// フェーズ切り替え（夜⇄朝）
export const nextPhase = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();

    if (!game) throw new Error("Game not found");

    const nextPhase = game.phase === "night" ? "day" : "night";
    const nextDay = nextPhase === "day" ? (game.day || 1) + 1 : game.day;

    await ctx.db.patch(game._id, { phase: nextPhase, day: nextDay });
  },
});
