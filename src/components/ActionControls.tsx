import type { Action } from "../lib/types/game";

interface ActionControlsProps {
  actions: Action[];
  onAction: (action: Action) => void;
  disabled?: boolean;
}

const actionLabels: Record<Action, string> = {
  check: "Check",
  bet: "Bet (+1)",
  call: "Call (+1)",
  fold: "Fold"
};

export function ActionControls({ actions, onAction, disabled = false }: ActionControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          disabled={disabled}
          className="rounded-md border border-brandGold/70 bg-brandGold/20 px-4 py-2 text-sm font-semibold text-brandGold transition hover:bg-brandGold/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {actionLabels[action]}
        </button>
      ))}
    </div>
  );
}
