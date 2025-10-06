"use client";

import React, { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function VoteResultPhase({ roomId }: { roomId: string }) {
  const game = useQuery(api.functions.game.getGame, { roomId });
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const topVotedPlayers = useQuery(api.functions.vote.getTopVotedPlayers, {
    roomId,
  });
  const killPlayer = useMutation(api.functions.players.markPlayerAsDead);
  const randomPlayer = useQuery(api.functions.vote.getRandomPlayerFromList, {
    playerNames: topVotedPlayers ? topVotedPlayers : [],
  });

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!topVotedPlayers) return <div>Loading vote results...</div>;

  if (topVotedPlayers.length === 0) {
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

  if (topVotedPlayers.length === 1) {
    const eliminatedPlayer = topVotedPlayers[0];
    return (
      <div>
        <h1>投票結果</h1>
        <p>{eliminatedPlayer}さんが最多得票で処刑されました。</p>
        {/*
          eliminatedPlayerのaliveをfalseにするミューテーションを呼び出す
        */}
        <button
          onClick={async () => {
            // プレイヤーの生存状態を更新
            await killPlayer({ roomId, playerName: eliminatedPlayer });
            await togglePhase({ roomId: roomId as string });
          }}
        >
          プレイヤーを処刑
        </button>
      </div>
    );
  }

  if (topVotedPlayers.length > 1) {
    return (
      <div>
        <h1>投票結果</h1>
        <p>{randomPlayer}さんが最多得票で処刑されました。</p>
        {/*
          eliminatedPlayerのaliveをfalseにするミューテーションを呼び出す
        */}
        <button
          onClick={async () => {
            // プレイヤーの生存状態を更新
            await killPlayer({ roomId, playerName: randomPlayer as string });
            await togglePhase({ roomId: roomId as string });
          }}
        >
          プレイヤーを処刑
        </button>
      </div>
    );
  }
  return <div>Unexpected state</div>;
}
