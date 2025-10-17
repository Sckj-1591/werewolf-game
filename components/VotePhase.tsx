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
  const currentPlayer = useQuery(api.functions.players.findPlayerByName, {
    roomId,
    name: user?.fullName || "",
  });
  const voter = players?.find((p) => p.name === user?.fullName);
  const voteCount = useQuery(api.functions.vote.getVoteCountByDay, {
    roomId,
    day: game ? game.day : 0,
  });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  const togglePhaseMutation = useMutation(api.functions.game.togglePhase);
  const updatePlayerMoveComplete = useMutation(
    api.functions.players.updatePlayerMoveComplete
  );
  const checkAllCompleted = useMutation(
    api.functions.game.checkAllCompletedAndAdvancePhase
  );

  useEffect(() => {
    setSelectedPlayer("");
  }, [game?.day]);

  const handleVote = () => {
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
      if (currentPlayer && currentPlayer._id) {
        updatePlayerMoveComplete({
          playerId: currentPlayer._id,
          isCompleted: true,
        });
      }
    }
  };

  if (!voter) return <div>Loading user...</div>;

  if (!game || !players) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;

  if (currentPlayer && !currentPlayer.alive) {
    return <div>あなたは死亡しています。投票できません。</div>;
  }

  return (
    <div>
      <h1>投票</h1>
      {!currentPlayer?.isCompleted ? (
        <div>
          <label htmlFor="player-select">プレイヤーを選択 </label>
          <br />
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
          <br />

          {selectedPlayer && <p>選択中: {selectedPlayer}</p>}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={!selectedPlayer}
            onClick={async () => {
              await handleVote();
              await checkAllCompleted({ roomId });
            }}
          >
            投票する
          </button>
        </div>
      ) : (
        <div> {<p>あなたは行動完了しています。</p>}</div>
      )}
      <button
        className="togglePhase"
        onClick={() => togglePhaseMutation({ roomId })}
      >
        フェーズ切替
      </button>
    </div>
  );
}
