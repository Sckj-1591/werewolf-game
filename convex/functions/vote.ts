import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { query } from "../_generated/server";

//投票内容をテーブルに保存
export const castVote = mutation({
  args: {
    roomId: v.string(),
    voterName: v.string(),
    targetName: v.string(),
    day: v.number(),
  },
  handler: async (ctx, { roomId, voterName, targetName, day }) => {
    // 既に投票している場合は更新、していない場合は新規作成
    const existingVote = await ctx.db
      .query("votes")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("voterName"), voterName)
        )
      )
      .first();
    if (existingVote) {
      return await ctx.db.patch(existingVote._id, {
        targetName,
        day,
        createdAt: Date.now(),
      });
    }
    return await ctx.db.insert("votes", {
      roomId,
      voterName,
      targetName,
      day,
      createdAt: Date.now(),
    });
  },
});

//特定の部屋の投票内容を取得
export const getVotes = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
  },
});

//特定のプレイヤーに投票した人を取得
export const getVotersForTarget = query({
  args: { roomId: v.string(), targetName: v.string() },
  handler: async (ctx, { roomId, targetName }) => {
    return await ctx.db
      .query("votes")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("targetName"), targetName)
        )
      )
      .collect();
  },
});

//特定のプレイヤーが投票した内容を取得
export const getVoteByVoter = query({
  args: { roomId: v.string(), voterName: v.string() },
  handler: async (ctx, { roomId, voterName }) => {
    return await ctx.db
      .query("votes")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("voterName"), voterName)
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
  args: { voteId: v.id("votes"), targetName: v.string() },
  handler: async (ctx, { voteId, targetName }) => {
    const vote = await ctx.db.get(voteId);
    if (!vote) throw new Error("Vote not found");
    return await ctx.db.patch(voteId, { targetName, createdAt: Date.now() });
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
export const getAllVotes = query({
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
export const tallyVotes = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    const tally: Record<string, number> = {};
    for (const vote of votes) {
      const targetName = vote.targetName.toString();
      if (!tally[targetName]) {
        tally[targetName] = 0;
      }
      tally[targetName]++;
    }
    return tally; // { targetName: voteCount }
  },
});

//特定の部屋の特定の日の総投票数を取得
export const getVoteCountByDay = query({
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

//特定の部屋の最も得票数の多いプレイヤーを配列で取得
export const getTopVotedPlayers = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    const tally: Record<string, number> = {};
    for (const vote of votes) {
      const targetName = vote.targetName.toString();
      if (!tally[targetName]) {
        tally[targetName] = 0;
      }
      tally[targetName]++;
    }
    const maxVotes = Math.max(...Object.values(tally), 0);
    const topVotedPlayers = Object.entries(tally)
      .filter(([_, count]) => count === maxVotes)
      .map(([playerId, _]) => playerId);
    return topVotedPlayers; // [playerId, playerId, ...]
  },
});

//複数のプレイヤーの名前が入った配列を受け取り、ランダムに一人の名前を返す
export const getRandomPlayerFromList = query({
  args: { playerNames: v.array(v.string()) },
  handler: async (ctx, { playerNames }) => {
    if (playerNames.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * playerNames.length);
    return playerNames[randomIndex];
  },
});
