"use client";

import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { addPlayer } from "@/convex/functions/players";
import ConvexClientProvider from "./ConvexClientProvider";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const createGame = useMutation(api.functions.game.createGame);
  const addPlayer = useMutation(api.functions.players.addPlayer);
  const { isSignedIn, user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/logined");
    }
  }, [isSignedIn, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div>
        <div style={{ padding: 20 }}>
          <h1 className="text-xl font-semibold">ようこそ!ゲストさん</h1>
          <div className="flex gap-4">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  ログイン
                </button>
              </SignInButton>
            ) : (
              <SignOutButton>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  ログアウト
                </button>
              </SignOutButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <div>Redirecting...</div>;
}
