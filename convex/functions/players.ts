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

// プレイヤーの生存状態を更新
export const updatePlayerStatus = mutation({
  args: { playerId: v.id("players"), alive: v.boolean() },
  handler: async (ctx, { playerId, alive }) => {
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");
    return await ctx.db.patch(playerId, { alive });
  },
});

// プレイヤーの役割を更新
export const updatePlayerRole = mutation({
  args: { playerId: v.id("players"), role: v.union(v.string(), v.null()) },
  handler: async (ctx, { playerId, role }) => {
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");
    return await ctx.db.patch(playerId, { role });
  },
});

// 生存しているプレイヤーを取得
export const getAlivePlayers = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .filter((q) => q.eq(q.field("alive"), true))
      .collect();
  },
});

// 死亡しているプレイヤーを取得
export const getDeadPlayers = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .filter((q) => q.eq(q.field("alive"), false))
      .collect();
  },
});

// プレイヤーの役割ごとの一覧を取得
export const getPlayersByRole = query({
  args: { roomId: v.string(), role: v.string() },
  handler: async (ctx, { roomId, role }) => {
    return await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .filter((q) => q.eq(q.field("role"), role))
      .collect();
  },
});

// プレイヤーの名前で検索
export const findPlayerByName = query({
  args: { roomId: v.string(), name: v.string() },
  handler: async (ctx, { roomId, name }) => {
    return await ctx.db
      .query("players")
      .filter((q) =>
        q.and(q.eq(q.field("roomId"), roomId), q.eq(q.field("name"), name))
      )
      .first();
  },
});
