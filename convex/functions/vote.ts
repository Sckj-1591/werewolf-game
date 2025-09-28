import { mutation } from "../_generated/server";
import { v } from "convex/values";

//投票内容をテーブルに保存
export const castVote = mutation({
  args: {
    roomId: v.string(),
    voterId: v.id("players"),
    targetId: v.id("players"),
    day: v.number(),
  },
  handler: async (ctx, { roomId, voterId, targetId, day }) => {
    // 既に投票している場合は更新、していない場合は新規作成
    const existingVote = await ctx.db
      .query("votes")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("voterId"), voterId)
        )
      )
      .first();
    if (existingVote) {
      return await ctx.db.patch(existingVote._id, {
        targetId,
        day,
        createdAt: Date.now(),
      });
    }
    return await ctx.db.insert("votes", {
      roomId,
      voterId,
      targetId,
      day,
      createdAt: Date.now(),
    });
  },
});

//特定の部屋の投票内容を取得
export const getVotes = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
  },
});

//特定のプレイヤーに投票した人を取得
export const getVotersForTarget = mutation({
  args: { roomId: v.string(), targetId: v.id("players") },
  handler: async (ctx, { roomId, targetId }) => {
    return await ctx.db
      .query("votes")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("targetId"), targetId)
        )
      )
      .collect();
  },
});

//特定のプレイヤーが投票した内容を取得
export const getVoteByVoter = mutation({
  args: { roomId: v.string(), voterId: v.id("players") },
  handler: async (ctx, { roomId, voterId }) => {
    return await ctx.db
      .query("votes")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("voterId"), voterId)
        )
      )
      .first();
  },
});

//特定の部屋の投票内容を全て削除
export const clearVotes = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    return;
  },
});

//投票内容を更新
export const updateVote = mutation({
  args: { voteId: v.id("votes"), targetId: v.id("players") },
  handler: async (ctx, { voteId, targetId }) => {
    const vote = await ctx.db.get(voteId);
    if (!vote) throw new Error("Vote not found");
    return await ctx.db.patch(voteId, { targetId, createdAt: Date.now() });
  },
});

//投票内容を削除
export const deleteVote = mutation({
  args: { voteId: v.id("votes") },
  handler: async (ctx, { voteId }) => {
    await ctx.db.delete(voteId);
  },
});

//全ての投票内容を取得（デバッグ用）
export const getAllVotes = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("votes").collect();
  },
});

//全ての投票内容を削除（デバッグ用）
export const deleteAllVotes = mutation({
  args: {},
  handler: async (ctx) => {
    const votes = await ctx.db.query("votes").collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    return;
  },
});

//投票数を集計
export const tallyVotes = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    const tally: Record<string, number> = {};
    for (const vote of votes) {
      const targetId = vote.targetId.toString();
      if (!tally[targetId]) {
        tally[targetId] = 0;
      }
      tally[targetId]++;
    }
    return tally; // { targetId: voteCount }
  },
});

//特定の部屋の特定の日の総投票数を取得
export const getVoteCountByDay = mutation({
  args: { roomId: v.string(), day: v.number() },
  handler: async (ctx, { roomId, day }) => {
    const votes = await ctx.db
      .query("votes")
      .filter((q) =>
        q.and(q.eq(q.field("roomId"), roomId), q.eq(q.field("day"), day))
      )
      .collect();
    return votes.length;
  },
});
