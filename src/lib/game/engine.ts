import type { Action, Card, GameState, Player, RoundResult } from "../types/game";

const CARD_STRENGTH: Record<Card, number> = { A: 3, K: 2, Q: 1 };
const DECK: Card[] = ["A", "K", "Q"];

const legalActionsByPhase: Record<GameState["phase"], Action[]> = {
  awaiting_p1_action: ["check", "bet"],
  awaiting_p2_after_check: ["check", "bet"],
  awaiting_p1_response_to_bet: ["call", "fold"],
  awaiting_p2_response_to_bet: ["call", "fold"],
  round_over: []
};

function shuffledDeck(): Card[] {
  const cards = [...DECK];
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function createInitialRound(round: number): GameState {
  const cards = shuffledDeck();
  return {
    phase: "awaiting_p1_action",
    round,
    currentPlayer: "P1",
    pot: 2,
    contributions: { P1: 1, P2: 1 },
    cards: { P1: cards[0], P2: cards[1] },
    history: [],
    legalActions: legalActionsByPhase.awaiting_p1_action,
    result: null
  };
}

function getShowdownWinner(cards: Record<Player, Card>): Player {
  return CARD_STRENGTH[cards.P1] > CARD_STRENGTH[cards.P2] ? "P1" : "P2";
}

function resolveRound(state: GameState, winner: Player, reason: RoundResult["reason"]): GameState {
  const loser: Player = winner === "P1" ? "P2" : "P1";
  const payoff = state.pot - state.contributions[winner];
  return {
    ...state,
    phase: "round_over",
    currentPlayer: null,
    legalActions: [],
    result: {
      winner,
      loser,
      reason,
      payoff,
      cards: state.cards
    }
  };
}

function assertLegal(state: GameState, player: Player, action: Action): void {
  if (state.currentPlayer !== player) {
    throw new Error(`It is not ${player}'s turn.`);
  }
  if (!state.legalActions.includes(action)) {
    throw new Error(`Action "${action}" is not legal in phase "${state.phase}".`);
  }
}

export function stepRound(state: GameState, player: Player, action: Action): GameState {
  if (state.phase === "round_over") {
    throw new Error("Round is already finished.");
  }
  assertLegal(state, player, action);

  const baseState: GameState = {
    ...state,
    history: [...state.history, { player, action }]
  };

  switch (state.phase) {
    case "awaiting_p1_action":
      if (action === "check") {
        return {
          ...baseState,
          phase: "awaiting_p2_after_check",
          currentPlayer: "P2",
          legalActions: legalActionsByPhase.awaiting_p2_after_check
        };
      }
      return {
        ...baseState,
        phase: "awaiting_p2_response_to_bet",
        currentPlayer: "P2",
        pot: state.pot + 1,
        contributions: { ...state.contributions, P1: state.contributions.P1 + 1 },
        legalActions: legalActionsByPhase.awaiting_p2_response_to_bet
      };

    case "awaiting_p2_after_check":
      if (action === "check") {
        return resolveRound(baseState, getShowdownWinner(baseState.cards), "showdown");
      }
      return {
        ...baseState,
        phase: "awaiting_p1_response_to_bet",
        currentPlayer: "P1",
        pot: state.pot + 1,
        contributions: { ...state.contributions, P2: state.contributions.P2 + 1 },
        legalActions: legalActionsByPhase.awaiting_p1_response_to_bet
      };

    case "awaiting_p1_response_to_bet":
      if (action === "fold") {
        return resolveRound(baseState, "P2", "fold");
      }
      return resolveRound(
        {
          ...baseState,
          pot: state.pot + 1,
          contributions: { ...state.contributions, P1: state.contributions.P1 + 1 }
        },
        getShowdownWinner(baseState.cards),
        "showdown"
      );

    case "awaiting_p2_response_to_bet":
      if (action === "fold") {
        return resolveRound(baseState, "P1", "fold");
      }
      return resolveRound(
        {
          ...baseState,
          pot: state.pot + 1,
          contributions: { ...state.contributions, P2: state.contributions.P2 + 1 }
        },
        getShowdownWinner(baseState.cards),
        "showdown"
      );

    default:
      return state;
  }
}
