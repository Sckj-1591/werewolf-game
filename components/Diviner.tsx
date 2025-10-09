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
  const [hasDivined, setHasDivined] = React.useState<boolean>(false);

  // roomId, selectedPlayerを受け取り、role.tsのDivinerActionを呼び出す
  const divinerAction = useMutation(api.functions.role.DivinerAction);

  const handleDivine = async () => {
    if (!selectedPlayer) return;

    try {
      const result = await divinerAction({
        roomId,
        targetName: selectedPlayer,
      });
      if (result.isWolf) {
        alert(`${selectedPlayer}さんは人狼です`);
      } else {
        alert(`${selectedPlayer}さんは人間です`);
      }
      setHasDivined(true);
    } catch (err) {
      console.error(err);
      alert("占いに失敗しました");
    }
  };

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;

  return (
    <div>
      <h2>占い師のアクション</h2>
      <p>占うプレイヤーを選択してください。</p>
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        disabled={hasDivined}
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
          handleDivine();
        }}
        disabled={!selectedPlayer || hasDivined}
      >
        占う
      </button>
      {hasDivined && <p>占いを行いました。</p>}
    </div>
  );
}
