"use client";

import { useTransition } from "react";

type Props = {
  candidateId: string;
  onPass: (candidateId: string) => Promise<void>;
  onLike: (candidateId: string) => Promise<void>;
};

export default function SwipeActions({ candidateId, onPass, onLike }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => onPass(candidateId))}
      >
        {isPending ? "..." : "Pass"}
      </button>

      <button
        disabled={isPending}
        onClick={() => startTransition(() => onLike(candidateId))}
      >
        {isPending ? "..." : "Like"}
      </button>
    </div>
  );
}
