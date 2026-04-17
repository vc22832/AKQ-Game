import { useState } from "react";
import type { RoleMode } from "../lib/types/game";

interface RoleSelectorProps {
  defaultMode: RoleMode;
  defaultRounds: number;
  onStart: (mode: RoleMode, rounds: number) => void;
}

export function RoleSelector({ defaultMode, defaultRounds, onStart }: RoleSelectorProps) {
  const [roleMode, setRoleMode] = useState<RoleMode>(defaultMode);
  const [rounds, setRounds] = useState(defaultRounds);

  return (
    <section className="rounded-xl border border-aquaAccent/70 bg-aquaShade/80 p-5">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brandGold">Session Setup</p>
      <div className="flex flex-wrap gap-2">
        {(["P1", "P2", "alternate"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setRoleMode(mode)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              roleMode === mode
                ? "bg-brandGold text-aquaShade"
                : "border border-aquaAccent bg-aquaDeep text-slate-200 hover:bg-aquaMid"
            }`}
          >
            {mode === "alternate" ? "Alternate Roles" : `Play as ${mode}`}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm text-slate-200">
        Rounds
        <input
          className="mt-1 w-28 rounded border border-aquaAccent bg-aquaDeep px-3 py-2 text-slate-100 outline-none ring-brandGold/40 focus:ring"
          type="number"
          min={1}
          max={100}
          value={rounds}
          onChange={(event) => setRounds(Number(event.target.value))}
        />
      </label>

      <button
        type="button"
        onClick={() => onStart(roleMode, Math.max(1, rounds))}
        className="mt-4 rounded-md bg-brandGold px-4 py-2 text-sm font-semibold text-aquaShade hover:brightness-110"
      >
        Begin Training
      </button>
    </section>
  );
}
