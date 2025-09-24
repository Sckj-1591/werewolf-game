"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React, { useState } from "react";

type Player = {
  _id: string;
  name: string;
};

export default function VotePhase({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");

  if (!game || !players) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;

  return (
    <div>
      <h1>投票だよ</h1>
      <button onClick={() => togglePhase({ roomId })}>フェーズ切替</button>

      <div>
        <label htmlFor="player-select">プレイヤーを選択: </label>
        <select
          id="player-select"
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
        >
          <option value="">選択してください</option>
          {players.map((p: Player) => (
            <option key={p._id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        {selectedPlayer && <p>選択中: {selectedPlayer}</p>}
      </div>
    </div>
  );
}
