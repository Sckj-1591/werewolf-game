"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function WolfWin({ roomId }: { roomId: string }) {
  const game = useQuery(api.functions.game.getGame, { roomId });
  const resetGame = useMutation(api.functions.game.resetGame);
  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h1>村人陣営の勝利！</h1>
      <p>おめでとうございます！村人陣営が勝利しました。</p>
      <p>最終日数: {game ? game.day : 0}日目</p>
      <p>ゲームをリセットして新しいゲームを始めましょう。</p>
      <button
        onClick={async () => {
          await resetGame({ roomId });
        }}
      >
        ゲームをリセット
      </button>
    </div>
  );
}
