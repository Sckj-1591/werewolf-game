"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React, { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Player = {
  _id: string;
  name: string;
};

export default function VotePhase({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const vote = useMutation(api.functions.vote.castVote);
  const { user } = useUser();
  const voter = players?.find((p) => p.name === user?.fullName);
  const voteCount = useQuery(api.functions.vote.getVoteCountByDay, {
    roomId,
    day: game ? game.day : 0,
  });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });

  useEffect(() => {
    setSelectedPlayer("");
  }, [game?.day]);

  const handleVote = () => {
    if (!selectedPlayer) return;

    const target = players?.find((p) => p.name === selectedPlayer);
    if (voter && target && game) {
      vote({
        roomId,
        voterName: voter.name,
        targetName: target.name,
        day: game.day,
      });
      setSelectedPlayer("");
      alert(`You voted for ${selectedPlayer}`);
    }
  };

  //部屋の全員の投票が終わったらフェーズを進める
  useEffect(() => {
    if (players && game && alivePlayers && voteCount !== undefined) {
      if (players.length > 0 && alivePlayers.length === voteCount) {
        togglePhase({ roomId });
      }
    }
  }, [voteCount, players, game, alivePlayers, roomId, togglePhase]);

  if (!voter) return <div>Loading user...</div>;

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
          {alivePlayers &&
            alivePlayers.map((p: Player) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
        </select>

        {selectedPlayer && <p>選択中: {selectedPlayer}</p>}
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={!selectedPlayer}
        onClick={handleVote}
      >
        投票する
      </button>
    </div>
  );
}
