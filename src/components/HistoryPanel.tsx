import type { ActionEntry, Player } from "../lib/types/game";

interface HistoryPanelProps {
  history: ActionEntry[];
  userSeat: Player;
}

export function HistoryPanel({ history, userSeat }: HistoryPanelProps) {
  return (
    <section className="rounded-xl border border-aquaAccent/70 bg-aquaShade/80 p-4">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brandGold">Action History</p>
      {history.length === 0 ? (
        <p className="text-sm text-slate-300">No actions yet.</p>
      ) : (
        <ul className="space-y-2 text-sm text-slate-200">
          {history.map((entry, index) => {
            const actor = entry.player === userSeat ? "You" : "Bot";
            return (
              <li key={`${entry.player}-${entry.action}-${index}`}>
                {index + 1}. {actor} ({entry.player}) {entry.action}s
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
