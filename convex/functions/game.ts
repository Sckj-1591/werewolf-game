// convex/functions/game.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// プレイヤーがルームに参加
export const join = mutation({
  args: { roomId: v.string(), playerName: v.string() },
  handler: async (ctx, { roomId, playerName }) => {
    // ゲームを取得
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();

    if (!game) throw new Error("Game not found");

    // プレイヤーを追加
    await ctx.db.insert("players", {
      roomId,
      name: playerName,
    });
  },
});

// ゲームの状態取得
export const getGame = query({
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

// ゲーム開始（夜からスタート）
export const startGame = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (!game) throw new Error("Game not found");

    await ctx.db.patch(game._id, {
      phase: "night",
    });
  },
});

// フェーズを切り替える（夜 ⇄ 朝）
export const togglePhase = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (!game) throw new Error("Game not found");

    const nextPhase = game.phase === "night" ? "day" : "night";
    await ctx.db.patch(game._id, { phase: nextPhase });
  },
});
