//convex/functions/role.ts
import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// 役職一覧取得
export const getRoles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roles").collect();
  },
});

//　役職名と人数と部屋ID を受け取り、playersテーブルのプレイヤーにランダムに役職を割り当てる
export const assignRoles = mutation({
  args: {
    roomId: v.string(),
    rolesWithCounts: v.array(v.object({ role: v.string(), count: v.number() })),
  },
  handler: async (ctx, { roomId, rolesWithCounts }) => {
    console.log("Assigning roles in room:", roomId);
    console.log("Roles with counts:", rolesWithCounts);
    // 役職と人数の配列を展開して、役職名のリストを作成
    const rolesList: string[] = [];
    rolesWithCounts.forEach(({ role, count }) => {
      for (let i = 0; i < count; i++) {
        rolesList.push(role);
      }
    });

    // プレイヤーを取得
    const players = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    if (players.length !== rolesList.length) {
      console.log("Players:", players.length, "Roles:", rolesList.length);
      throw new Error("プレイヤー数と役職数が一致しません");
    }
    // 役職リストをシャッフル
    for (let i = rolesList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesList[i], rolesList[j]] = [rolesList[j], rolesList[i]];
    }
    // プレイヤーに役職を割り当て
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const role = rolesList[i];
      await ctx.db.patch(player._id, { role });
    }
    return { success: true };
  },
});

//占い師の夜行動処理
export const DivinerAction = mutation({
  args: { roomId: v.string(), targetName: v.string() },
  handler: async (ctx, { roomId, targetName }) => {
    // ターゲットを取得
    const target = await ctx.db
      .query("players")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("name"), targetName)
        )
      )
      .first();
    if (!target) throw new Error("ターゲットが見つかりません");

    const isWolf = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("Name"), target.role))
      .first();
    if (!isWolf) throw new Error("役職が見つかりません");

    // isWolfを返す
    return { isWolf: isWolf.Name === "人狼" };
  },
});

//占い師 ランダムで白通知
export const DivinerRandomWhite = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    // roomIdのプレイヤー一覧を取得
    const players = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    if (players.length === 0) throw new Error("プレイヤーが見つかりません");

    //プレイヤー一覧から、roleが人狼または占い師でないプレイヤーをランダムで一人抽出
    const nonWolves = [];
    for (const player of players) {
      const role = await ctx.db
        .query("roles")
        .filter((q) => q.eq(q.field("Name"), player.role))
        .first();
      if (role && role.Name !== "人狼" && role.Name !== "占い師") {
        nonWolves.push(player);
      }
    }
    if (nonWolves.length === 0)
      throw new Error("白通知可能なプレイヤーが見つかりません");
    const randomIndex = Math.floor(Math.random() * nonWolves.length);
    const selectedPlayer = nonWolves[randomIndex];
    return { targetName: selectedPlayer.name };
  },
});

//霊媒師の夜行動処理
export const MediumAction = mutation({
  args: { roomId: v.string(), targetName: v.string() },
  handler: async (ctx, { roomId, targetName }) => {
    // ターゲットを取得
    const target = await ctx.db
      .query("players")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("name"), targetName)
        )
      )
      .first();
    if (!target) throw new Error("ターゲットが見つかりません");
    const isWolf = await ctx.db
      .query("roles")
      .filter((q) => q.eq(q.field("Name"), target.role))
      .first();
    if (!isWolf) throw new Error("役職が見つかりません");
    // isWolfを返す
    return { isWolf: isWolf.Name === "人狼" };
  },
});

//　騎士の夜行動処理
export const KnightAction = mutation({
  args: { roomId: v.string(), targetName: v.string() },
  handler: async (ctx, { roomId, targetName }) => {
    // ターゲットを取得
    const target = await ctx.db
      .query("players")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("name"), targetName)
        )
      )
      .first();
    if (!target) throw new Error("ターゲットが見つかりません");
    // attackテーブルにroomIDが一致するものがあれば、そのdefencedNameを更新、なければ新規作成
    const existing = await ctx.db
      .query("attack")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { defencedName: targetName });
    } else {
      await ctx.db.insert("attack", {
        roomId,
        targetName: "",
        power: 0,
        defencedName: targetName,
      });
    }
    // await ctx.db.patch(target._id, { alive: true });
    // return { success: true };
  },
});

// 人狼の夜行動処理
export const WolfAction = mutation({
  args: { roomId: v.string(), targetName: v.string(), power: v.number() },
  handler: async (ctx, { roomId, targetName, power }) => {
    // ターゲットを取得
    const target = await ctx.db
      .query("players")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("name"), targetName)
        )
      )
      .first();
    if (!target) throw new Error("ターゲットが見つかりません");
    // attackテーブルにroomIDが一致するものがあれば、そのtargetNameを更新、なければ新規作成
    const existing = await ctx.db
      .query("attack")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (existing) {
      if (existing.power <= power)
        await ctx.db.patch(existing._id, { targetName });
    } else {
      await ctx.db.insert("attack", {
        roomId,
        targetName,
        power: power,
        defencedName: null,
      });
    }
    // await ctx.db.patch(target._id, { alive: false });
    // return { success: true };
  },
});
