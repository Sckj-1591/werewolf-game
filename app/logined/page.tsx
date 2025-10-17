"use client";

import { use, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { SignOutButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const createGame = useMutation(api.functions.game.createGame);
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const addPlayer = useMutation(api.functions.players.addPlayer);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  const enterRoom = useMutation(api.functions.game.createOrJoinGame);

  if (isSignedIn) {
    return (
      <div style={{ padding: 20 }}>
        <h2>ようこそ！{isSignedIn ? user?.fullName : "ゲスト"}さん</h2>
        <h3>人狼 By BYOD へようこそ</h3>
        <input
          type="number"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room IDを入力"
          style={{ marginRight: 8 }}
        />
        <br />
        <button
          onClick={async () => {
            if (!roomId) {
              alert("Room IDを入力してください");
              return;
            }
            try {
              await enterRoom({
                roomId: roomId,
                playerName: user?.fullName || "名無しの参加者",
              });
            } catch (error) {
              alert("ゲームが進行中です。参加できません。");
              return;
            }
            router.push(`/room/${roomId}`);
          }}
        >
          ルームに参加
        </button>
        <br />
        <SignOutButton>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            ログアウト
          </button>
        </SignOutButton>
      </div>
    );
  }
  return <div>Loading...</div>;
}
