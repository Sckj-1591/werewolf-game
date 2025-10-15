"use client";

import React, { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";

type TimerProps = {
  phase: string;
};

export default function Timer({ phase }: TimerProps) {
  const [startPhase, setStartPhase] = useState(phase);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setStartPhase(phase);
    setElapsed(0);
  }, [phase]);

  useInterval(() => {
    setElapsed((prev) => prev + 1);
  }, 1000);

  return <h3>{elapsed}秒経過</h3>;
}
