import type { Action, Card, GameState, Player } from "../types/game";

function sampleAction(weighted: Array<{ action: Action; weight: number }>): Action {
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.action;
  }
  return weighted[weighted.length - 1].action;
}

function getWeights(state: GameState, card: Card): Array<{ action: Action; weight: number }> {
  const key = `${state.phase}_${card}` as const;
  const strategyMap: Record<string, Array<{ action: Action; weight: number }>> = {
    awaiting_p1_action_A: [
      { action: "bet", weight: 0.8 },
      { action: "check", weight: 0.2 }
    ],
    awaiting_p1_action_K: [
      { action: "bet", weight: 0.4 },
      { action: "check", weight: 0.6 }
    ],
    awaiting_p1_action_Q: [
      { action: "bet", weight: 0.2 },
      { action: "check", weight: 0.8 }
    ],
    awaiting_p2_after_check_A: [
      { action: "bet", weight: 0.75 },
      { action: "check", weight: 0.25 }
    ],
    awaiting_p2_after_check_K: [
      { action: "bet", weight: 0.35 },
      { action: "check", weight: 0.65 }
    ],
    awaiting_p2_after_check_Q: [
      { action: "bet", weight: 0.1 },
      { action: "check", weight: 0.9 }
    ],
    awaiting_p1_response_to_bet_A: [{ action: "call", weight: 0.95 }, { action: "fold", weight: 0.05 }],
    awaiting_p1_response_to_bet_K: [{ action: "call", weight: 0.45 }, { action: "fold", weight: 0.55 }],
    awaiting_p1_response_to_bet_Q: [{ action: "call", weight: 0.15 }, { action: "fold", weight: 0.85 }],
    awaiting_p2_response_to_bet_A: [{ action: "call", weight: 0.95 }, { action: "fold", weight: 0.05 }],
    awaiting_p2_response_to_bet_K: [{ action: "call", weight: 0.4 }, { action: "fold", weight: 0.6 }],
    awaiting_p2_response_to_bet_Q: [{ action: "call", weight: 0.1 }, { action: "fold", weight: 0.9 }]
  };

  const options = strategyMap[key] ?? [];
  return options.filter(({ action }) => state.legalActions.includes(action));
}

export function getBotAction(state: GameState, privateCard: Card, player: Player): Action {
  if (state.currentPlayer !== player) {
    throw new Error("Bot asked for action out of turn.");
  }

  const weighted = getWeights(state, privateCard);
  if (weighted.length > 0) {
    return sampleAction(weighted);
  }

  // Fallback keeps strategy module robust as game variants grow.
  return state.legalActions[Math.floor(Math.random() * state.legalActions.length)];
}
