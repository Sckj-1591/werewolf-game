"use client";

import React, { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exec } from "child_process";

export default function VoteResultPhase({ roomId }: { roomId: string }) {
  const game = useQuery(api.functions.game.getGame, { roomId });
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const executedName = useQuery(api.functions.game.getExecutedName, { roomId });

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;

  if (!executedName) {
    return (
      <div>
        <h1>投票結果</h1>
        <p>誰も投票されませんでした。</p>
        <button onClick={() => togglePhase({ roomId: roomId as string })}>
          フェーズ切替
        </button>
      </div>
    );
  }

  if (executedName) {
    return (
      <div>
        <h1>投票結果</h1>
        <p>{executedName}さんが最多得票で処刑されました。</p>
        {/*
          eliminatedPlayerのaliveをfalseにするミューテーションを呼び出す
        */}
        <button onClick={() => togglePhase({ roomId: roomId as string })}>
          プレイヤーを処刑
        </button>
      </div>
    );
  }
  return <div>Loading...</div>;
}
