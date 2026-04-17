export type Card = "A" | "K" | "Q";
export type Player = "P1" | "P2";
export type Action = "check" | "bet" | "call" | "fold";

export type Phase =
  | "awaiting_p1_action"
  | "awaiting_p2_after_check"
  | "awaiting_p1_response_to_bet"
  | "awaiting_p2_response_to_bet"
  | "round_over";

export type RoundEndReason = "fold" | "showdown";
export type RoleMode = "P1" | "P2" | "alternate";

export interface ActionEntry {
  player: Player;
  action: Action;
}

export interface RoundResult {
  winner: Player;
  loser: Player;
  reason: RoundEndReason;
  payoff: number;
  cards: Record<Player, Card>;
}

export interface GameState {
  phase: Phase;
  round: number;
  currentPlayer: Player | null;
  pot: number;
  contributions: Record<Player, number>;
  cards: Record<Player, Card>;
  history: ActionEntry[];
  legalActions: Action[];
  result: RoundResult | null;
}

export interface MatchState {
  roleMode: RoleMode;
  configuredRounds: number;
  roundsPlayed: number;
  totalProfit: number;
  userSeat: Player;
}
