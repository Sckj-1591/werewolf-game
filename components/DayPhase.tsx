"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Chat from "./Chat";
import DeadChat from "./DeadChat";
import Timer from "./Timer";

export default function DayPhase({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const router = useRouter();
  const user = useUser();
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  const removePlayer = useMutation(api.functions.players.removePlayer);
  const currentPlayer = useQuery(api.functions.players.findPlayerByName, {
    roomId,
    name: user.user?.fullName || "",
  });
  const isDead = currentPlayer ? !currentPlayer.alive : false;
  const deleteGame = useMutation(api.functions.game.deleteGame);
  const exitGame = async () => {
    if (!user.user?.fullName) {
      alert("ユーザー情報が取得できません。");
      return;
    }
    await removePlayer({ roomId, playerName: user.user.fullName });
    if (players && players.length === 1) {
      // 自分が最後の一人ならゲームを削除
      await deleteGame({ roomId });
    }
    router.push("/logined");
  };
  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;

  if (isDead) {
    return (
      <div>
        <h1>昼だよ</h1>
        <p>あなたは死亡しています。チャットを閲覧できます。</p>
        <DeadChat roomId={roomId} phase="day" />
        <button onClick={exitGame}>退出</button>
        <br />
        <button onClick={() => togglePhase({ roomId: roomId as string })}>
          フェーズ切替
        </button>
      </div>
    );
  } else
    return (
      <div>
        <h1>昼だよ</h1>
        <div>
          <h3>議論しよう！</h3>
        </div>
        <div className="chat-center">
          <Chat roomId={roomId} phase="day" />
        </div>
        <Timer phase="day" />
        <br />
        <button onClick={() => togglePhase({ roomId: roomId as string })}>
          投票に移る
        </button>
      </div>
    );
}
