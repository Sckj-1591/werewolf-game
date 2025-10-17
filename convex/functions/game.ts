// convex/functions/game.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "../_generated/server";

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
      joinedAt: Date.now(),
      alive: true,
      role: null,
      isCompleted: false,
    });
  },
});

//部屋作成または入室処理
export const createOrJoinGame = mutation({
  args: { roomId: v.string(), playerName: v.string() },
  handler: async (ctx, { roomId, playerName }) => {
    // すでにゲームが存在するか確認
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (!game) {
      // ゲームが存在しない場合は作成
      await ctx.db.insert("games", {
        roomId,
        phase: "ready",
        day: 0,
        createdAt: Date.now(),
        executedName: null,
      });
    }

    // ゲームのフェーズがready以外の場合、参加を拒否
    if (game && game.phase !== "ready") {
      throw new Error();
    }
    // プレイヤーを追加
    // 重複参加を防ぐため、同じ名前のプレイヤーがいないか確認
    const existingPlayer = await ctx.db
      .query("players")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("name"), playerName)
        )
      )
      .first();
    if (!existingPlayer) {
      await ctx.db.insert("players", {
        roomId,
        name: playerName,
        joinedAt: Date.now(),
        alive: true,
        role: null,
        isCompleted: false,
      });
    }
  },
});

//部屋作成
export const createGame = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    // すでに存在する場合は作らない（競合回避）
    const existing = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (existing) return existing;

    // ゲームを初期化
    const newGame = {
      roomId,
      phase: "ready",
      day: 0,
      createdAt: Date.now(),
      executedName: null,
    };

    return await ctx.db.insert("games", newGame);
  },
});

// ゲームの削除
export const deleteGame = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (!game) throw new Error("Game not found");
    await ctx.db.delete(game._id);
    // 関連するプレイヤーも削除
    const players = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const player of players) {
      await ctx.db.delete(player._id);
    }
    // 関連するメッセージも削除
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    // 関連する投票も削除
    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    // 関連する襲撃情報も削除
    const attacks = await ctx.db
      .query("attack")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const attack of attacks) {
      await ctx.db.delete(attack._id);
    }
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

    // functions/game.ts
    return { ...game }; // players: { _id, name, joinedAt }[]
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
      phase: "notify",
    });
  },
});

type Phase =
  | "ready"
  | "notify"
  | "morning"
  | "day"
  | "vote"
  | "voteresult"
  | "night"
  | "checkvictoryMorning"
  | "checkvictoryNight"
  | "villgersWin"
  | "wolfWin"
  | null;

//フェーズを切り替えるexport関数
export const togglePhase = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    await dotogglePhase(ctx, { roomId });
  },
});

// フェーズを切り替える関数
async function dotogglePhase(ctx: MutationCtx, { roomId }: { roomId: string }) {
  const game = await ctx.db
    .query("games")
    .filter((q) => q.eq(q.field("roomId"), roomId))
    .first();
  if (!game) throw new Error("Game not found");

  const nextPhase = (phase: string | null): Phase => {
    switch (phase) {
      case "night":
        return "morning";
      case "morning":
        return "checkvictoryMorning";
      case "checkvictoryMorning":
        return "day";
      case "day":
        return "vote";
      case "vote":
        return "voteresult";
      case "voteresult":
        return "checkvictoryNight";
      case "checkvictoryNight":
        return "night"; // 日付更新は外でやる
      case null:
        return "ready";
      case "villgersWin":
        return "ready"; // ゲーム終了後はフェーズ変更しない
      case "wolfWin":
        return "ready"; // ゲーム終了後はフェーズ変更しない
      case "ready":
        return "notify";
      case "notify":
        return "night";
      default:
        return null;
    }
  };

  const newPhase = nextPhase(game.phase);

  //voteから切り替わるときだけ処刑者決定処理を行う
  if (game.phase === "vote") {
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
    // topVotedPlayersが1人ならその人を処刑、複数人ならランダムで1人を処刑
    let executedName: string | null = null;
    if (topVotedPlayers.length === 1) {
      executedName = topVotedPlayers[0];
    } else if (topVotedPlayers.length > 1) {
      const randomIndex = Math.floor(Math.random() * topVotedPlayers.length);
      executedName = topVotedPlayers[randomIndex];
    }

    // executedPlayerが存在すれば死亡にする
    const executedPlayer = await ctx.db
      .query("players")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), roomId),
          q.eq(q.field("name"), executedName)
        )
      )
      .first();
    if (executedPlayer) {
      await ctx.db.patch(executedPlayer._id, { alive: false });
    }
    // executedNameをgameテーブルに保存
    await ctx.db.patch(game._id, { executedName });
  }

  //checkvictoryNightから切り替わるときだけvoteテーブルをクリアする
  if (game.phase === "checkvictoryNight") {
    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    // executedNameをnullにリセット
    await ctx.db.patch(game._id, { executedName: null });
  }

  // checkvictoryNight → night に切り替わるときだけ日付を進める

  // night → morningのときに襲撃成功判定して犠牲者を死亡にする
  if (game.phase === "night") {
    const attack = await ctx.db
      .query("attack")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (
      attack &&
      attack.targetName &&
      attack.targetName !== attack.defencedName
    ) {
      // 襲撃成功
      const targetPlayer = await ctx.db
        .query("players")
        .filter((q) =>
          q.and(
            q.eq(q.field("roomId"), roomId),
            q.eq(q.field("name"), attack.targetName)
          )
        )
        .first();
      if (targetPlayer) {
        await ctx.db.patch(targetPlayer._id, { alive: false });
      }
    }
  }

  // morning → dayのときにattackテーブルをクリアする
  if (game.phase === "morning") {
    const attack = await ctx.db
      .query("attack")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (attack) {
      await ctx.db.delete(attack._id);
    }
  }

  await ctx.db.patch(game._id, { phase: newPhase });

  // 全員の行動完了状態をリセット
  const players = await ctx.db
    .query("players")
    .filter((q) => q.eq(q.field("roomId"), roomId))
    .collect();
  for (const player of players) {
    await ctx.db.patch(player._id, { isCompleted: false });
  }

  //勝利判定を行う
  if (newPhase === "checkvictoryMorning" || newPhase === "checkvictoryNight") {
    const alivePlayers = players.filter((p) => p.alive);
    const aliveWolves = alivePlayers.filter((p) => p.role === "人狼");
    const aliveNonWolves = alivePlayers.filter((p) => p.role !== "人狼");

    if (aliveWolves.length === 0) {
      // 村人陣営の勝利
      const game = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("roomId"), roomId))
        .first();
      if (game) {
        await ctx.db.patch(game._id, { phase: "villgersWin" });
      }
      return "villagers";
    }
    if (aliveWolves.length >= aliveNonWolves.length) {
      // 人狼陣営の勝利
      const game = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("roomId"), roomId))
        .first();
      if (game) {
        await ctx.db.patch(game._id, { phase: "wolfWin" });
      }
      return "wolves";
    }

    // 勝利条件未達成
    if (newPhase === "checkvictoryMorning")
      //Phaseをdayに変更
      await ctx.db.patch(game._id, { phase: "day" });
    if (newPhase === "checkvictoryNight") {
      //日付を1日進める
      await ctx.db.patch(game._id, { day: game.day + 1 });
      //Phaseをnightに変更
      await ctx.db.patch(game._id, { phase: "night" });
    }

    return null;
  }
  return newPhase;
}

// ゲームの状態をリセット
export const resetGame = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (!game) throw new Error("Game not found");
    await ctx.db.patch(game._id, {
      phase: "ready",
      day: 0,
      executedName: null,
    });

    // プレイヤーの状態をリセット
    const players = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const player of players) {
      await ctx.db.patch(player._id, {
        alive: true,
        role: null,
        isCompleted: false,
      });
    }
    // attackテーブルをクリア
    const attacks = await ctx.db
      .query("attack")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const attack of attacks) {
      await ctx.db.delete(attack._id);
    }
    // votesテーブルをクリア
    const votes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    //messageテーブルをクリア
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});

// 勝利判定
export const checkVictory = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const players = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    const alivePlayers = players.filter((p) => p.alive);
    const aliveWolves = alivePlayers.filter((p) => p.role === "wolf");
    const aliveNonWolves = alivePlayers.filter((p) => p.role !== "wolf");
    if (aliveWolves.length === 0) {
      return "villagers"; // 村人陣営の勝利
    }
    if (aliveWolves.length >= aliveNonWolves.length) {
      return "wolves"; // 人狼陣営の勝利
    }
    return null; // 勝利条件未達成
  },
});

//処刑者の名前を取得
export const getExecutedName = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .first();
    if (!game) throw new Error("Game not found");
    return game.executedName;
  },
});

//全員が行動完了していればフェーズを進める
export const checkAllCompletedAndAdvancePhase = mutation({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    const players = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .collect();
    const incompletePlayer = players.find((p) => !p.isCompleted && p.alive);
    if (!incompletePlayer) {
      // 全員完了しているのでフェーズを進める
      await dotogglePhase(ctx, { roomId });
    }
  },
});
