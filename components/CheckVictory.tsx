"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import React, { useEffect } from "react";
import { useMutation } from "convex/react";
import loadConfig from "next/dist/server/config";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";

export default function CheckVictory({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  return (
    <div>
      Loading...
      <button onClick={() => togglePhase({ roomId: roomId as string })}>
        フェーズ切替
      </button>
    </div>
  );
}
