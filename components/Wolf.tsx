"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import Chat from "./Chat";
import { useUser } from "@clerk/nextjs";

export default function Wolf({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const user = useUser();
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });

  // プルダウン式で占うプレイヤーを選択
  const [selectedPlayer, setSelectedPlayer] = React.useState<string>("");
  const [hasAttacked, setHasAttacked] = React.useState<boolean>(false);

  // roomId, selectedPlayerを受け取り、role.tsのDivinerActionを呼び出す
  const WolfAction = useMutation(api.functions.role.WolfAction);

  const handleAttack = () => {
    if (!selectedPlayer) return;
    WolfAction({ roomId, targetName: selectedPlayer });
    setHasAttacked(true);
  };

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;

  return (
    <div>
      <h2>人狼のアクション</h2>
      <p>襲撃するプレイヤーを選択してください。</p>
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        disabled={hasAttacked}
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
          handleAttack();
        }}
        disabled={!selectedPlayer || hasAttacked}
      >
        襲撃
      </button>
      {hasAttacked && <p>襲撃を行いました。</p>}
    </div>
  );
}
