"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function WolfWin({ roomId }: { roomId: string }) {
  const game = useQuery(api.functions.game.getGame, { roomId });
  const resetGame = useMutation(api.functions.game.resetGame);
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <h1>村人陣営の勝利！</h1>
      <br />
      <h2>役職</h2>
      <ul className="player-list">
        {players &&
          players.map((player) => (
            <li key={player._id}>
              {player.name}（{player.role}）
            </li>
          ))}
      </ul>
      <br />
      <button
        onClick={async () => {
          await resetGame({ roomId });
        }}
      >
        次のゲームをプレイ
      </button>
    </div>
  );
}
