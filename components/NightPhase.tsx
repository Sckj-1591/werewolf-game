"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import Chat from "./Chat";
import { useUser } from "@clerk/nextjs";
import Diviner from "./Diviner";
import Medium from "./Medium";
import Knight from "./Knight";
import Wolf from "./Wolf";
import DeadChat from "./DeadChat";
import WolfChat from "./WolfChat";
import NoActionRole from "./NoActionRole";
import Dead from "./Dead";

export default function NightPhase({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const user = useUser();
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  // 自分が生存しているか確認
  const isAlive = players?.some(
    (p) =>
      p.name === user.user?.fullName &&
      alivePlayers?.some((ap) => ap.name === p.name)
  );
  // ここで自分の役職を取得
  // 役職に応じてチャットの表示やアクションを制御するため
  // 例えば、占い師なら占いチャットを表示、霊媒師なら霊媒チャットを表示など
  // 役職がない場合は一般チャットのみ表示
  const playerRole = useQuery(api.functions.players.getPlayerRole, {
    roomId,
    playerName: user.user?.fullName || "",
  });

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (game.phase !== "night") return <div>夜フェーズではありません</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;
  if (!user.user?.fullName) return <div>Loading user...</div>;

  // 役職に応じたアクションコンポーネントの表示
  let roleActionComponent = null;
  if (!isAlive) {
    roleActionComponent = <Dead roomId={roomId} />;
  } else if (playerRole === "占い師") {
    roleActionComponent = <Diviner roomId={roomId} />;
  } else if (playerRole === "霊媒師") {
    roleActionComponent = <Medium roomId={roomId} />;
  } else if (playerRole === "騎士") {
    roleActionComponent = <Knight roomId={roomId} />;
  } else if (playerRole === "人狼") {
    roleActionComponent = <Wolf roomId={roomId} />;
  } else {
    roleActionComponent = <NoActionRole roomId={roomId} />;
  }

  return (
    <div>
      <h1>夜だよ</h1>
      {roleActionComponent}
      <button onClick={() => togglePhase({ roomId: roomId as string })}>
        フェーズ切替
      </button>
    </div>
  );
}
