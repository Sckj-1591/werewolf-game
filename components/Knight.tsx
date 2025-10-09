"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import Chat from "./Chat";
import { useUser } from "@clerk/nextjs";

export default function Diviner({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const user = useUser();
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });

  // プルダウン式で占うプレイヤーを選択
  const [selectedPlayer, setSelectedPlayer] = React.useState<string>("");
  const [hasDefenced, setHasDefenced] = React.useState<boolean>(false);

  // roomId, selectedPlayerを受け取り、role.tsのDivinerActionを呼び出す
  const KnightAction = useMutation(api.functions.role.KnightAction);

  const handleDefence = () => {
    if (!selectedPlayer) return;
    KnightAction({ roomId, targetName: selectedPlayer });
    setHasDefenced(true);
  };

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;

  return (
    <div>
      <h2>騎士のアクション</h2>
      <p>護衛するプレイヤーを選択してください。</p>
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        disabled={hasDefenced}
      >
        <option value="">-- プレイヤーを選択 --</option>
        {alivePlayers?.map((p) => (
          <option key={p._id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          handleDefence();
        }}
        disabled={!selectedPlayer || hasDefenced}
      >
        護衛
      </button>
      {hasDefenced && <p>護衛を行いました。</p>}
    </div>
  );
}
