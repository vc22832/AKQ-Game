import type { Card } from "../lib/types/game";

interface CardViewProps {
  label: string;
  card: Card | "?";
  revealed?: boolean;
}

export function CardView({ label, card, revealed = true }: CardViewProps) {
  return (
    <div className="flex min-w-40 flex-col gap-2 rounded-xl border border-aquaAccent/80 bg-aquaShade/80 p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-slate-300">{label}</p>
      <div className="rounded-lg border border-aquaAccent bg-aquaDeep p-4 text-4xl font-bold text-brandGold">
        {revealed ? card : "?"}
      </div>
    </div>
  );
}
