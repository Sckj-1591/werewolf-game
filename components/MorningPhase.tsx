"use client";

import { useMutation, useQuery } from "convex/react";
import { use, useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Chat from "./Chat";
import { get } from "http";

export default function MorningPhase({ roomId }: { roomId: string }) {
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  const game = useQuery(api.functions.game.getGame, { roomId });
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const router = useRouter();
  const [votedPlayer, setVotedPlayer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const user = useUser();
  const currentPlayer = players?.find((p) => p.name === user.user?.fullName);
  const Today = game ? game.day : 0;
  const updatePlayerMoveComplete = useMutation(
    api.functions.players.updatePlayerMoveComplete
  );

  const getAttack = useQuery(api.functions.morning.getAttack, { roomId });

  // 生存している全員が行動完了しているか確認
  const checkAllCompleted = useMutation(
    api.functions.game.checkAllCompletedAndAdvancePhase
  );

  if (!game) return <div>Loading...</div>;
  if (game.phase !== "morning") return <div>朝フェーズではありません</div>;
  if (!currentPlayer) return <div>プレイヤー情報が見つかりません</div>;

  if (game.day === 0) {
    return (
      <div>
        <h1>朝だよ</h1>
        <h3>
          <span className="underline">初日 絶対死ぬ太郎さん</span>
          <br />
          が死体で発見されました。
        </h3>
        <h2>生存者一覧</h2>
        <ul className="player-list">
          {alivePlayers?.map((player) => (
            <li key={player._id}>{player.name}</li>
          ))}
        </ul>
        {/* 行動完了した際に押すボタン */}
        {!currentPlayer.isCompleted ? (
          <button
            onClick={async () => {
              if (currentPlayer) {
                // プレイヤーのisCompletedをtrueに更新
                await updatePlayerMoveComplete({
                  playerId: currentPlayer._id,
                  isCompleted: true,
                });
                await checkAllCompleted(
                  { roomId } // roomIdを渡す
                );
              }
            }}
          >
            確認
          </button>
        ) : (
          <p>あなたは行動完了しています。</p>
        )}
        <br />
        <button onClick={() => togglePhase({ roomId })}>フェーズ切替</button>
      </div>
    );
  }

  return (
    <div>
      <h1>朝</h1>
      {getAttack && getAttack.targetName !== getAttack.defencedName && (
        <p>
          <span className="underline">{getAttack.targetName}さん</span>
          が死体で発見されました。
        </p>
      )}
      {getAttack && getAttack.targetName === getAttack.defencedName && (
        <p className="underline">犠牲者は出ませんでした。</p>
      )}
      {!getAttack && <p className="underline">犠牲者は出ませんでした。</p>}
      <h3>生存者一覧</h3>
      <ul className="player-list">
        {alivePlayers?.map((player) => (
          <li key={player._id}>{player.name}</li>
        ))}
      </ul>
      {/* 行動完了した際に押すボタン */}
      {!currentPlayer.isCompleted ? (
        <button
          onClick={async () => {
            if (currentPlayer) {
              // プレイヤーのisCompletedをtrueに更新
              await updatePlayerMoveComplete({
                playerId: currentPlayer._id,
                isCompleted: true,
              });
              await checkAllCompleted(
                { roomId } // roomIdを渡す
              );
            }
          }}
        >
          確認
        </button>
      ) : (
        <p>あなたは行動完了しています。</p>
      )}
      <br />
      <button onClick={() => togglePhase({ roomId })}>フェーズ切替</button>
    </div>
  );
}
