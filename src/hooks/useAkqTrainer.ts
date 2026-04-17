import { useCallback, useEffect, useMemo, useState } from "react";
import { createInitialRound, stepRound } from "../lib/game/engine";
import { getBotAction } from "../lib/strategy/botStrategy";
import type { Action, GameState, MatchState, Player, RoleMode } from "../lib/types/game";

function deriveSeat(mode: RoleMode, roundsPlayed: number): Player {
  if (mode === "P1") return "P1";
  if (mode === "P2") return "P2";
  return roundsPlayed % 2 === 0 ? "P1" : "P2";
}

interface Config {
  roleMode: RoleMode;
  rounds: number;
}

export function useAkqTrainer() {
  const [config, setConfig] = useState<Config>({ roleMode: "P1", rounds: 10 });
  const [match, setMatch] = useState<MatchState>({
    roleMode: "P1",
    configuredRounds: 10,
    roundsPlayed: 0,
    totalProfit: 0,
    userSeat: "P1"
  });
  const [game, setGame] = useState<GameState>(() => createInitialRound(1));

  const applyStep = useCallback((actingPlayer: Player, action: Action) => {
    setGame((previous) => {
      const next = stepRound(previous, actingPlayer, action);
      if (next.result && !previous.result) {
        setMatch((currentMatch) => {
          const delta = next.result!.winner === currentMatch.userSeat ? next.result!.payoff : -next.result!.payoff;
          return { ...currentMatch, totalProfit: currentMatch.totalProfit + delta };
        });
      }
      return next;
    });
  }, []);

  const resetMatch = useCallback((next: Config) => {
    const userSeat = deriveSeat(next.roleMode, 0);
    setConfig(next);
    setMatch({
      roleMode: next.roleMode,
      configuredRounds: next.rounds,
      roundsPlayed: 0,
      totalProfit: 0,
      userSeat
    });
    setGame(createInitialRound(1));
  }, []);

  const startNextRound = useCallback(() => {
    setMatch((previous) => {
      const nextRoundsPlayed = previous.roundsPlayed + 1;
      const isComplete = nextRoundsPlayed >= previous.configuredRounds;
      const userSeat = deriveSeat(previous.roleMode, nextRoundsPlayed);
      if (!isComplete) {
        setGame(createInitialRound(nextRoundsPlayed + 1));
      }
      return {
        ...previous,
        roundsPlayed: nextRoundsPlayed,
        userSeat
      };
    });
  }, []);

  const act = useCallback((action: Action) => {
    if (!game.currentPlayer) return;
    applyStep(game.currentPlayer, action);
  }, [applyStep, game.currentPlayer]);

  useEffect(() => {
    if (!game.currentPlayer || game.phase === "round_over") return;
    if (game.currentPlayer === match.userSeat) return;

    const timer = window.setTimeout(() => {
      const botCard = game.cards[game.currentPlayer!];
      const action = getBotAction(game, botCard, game.currentPlayer!);
      applyStep(game.currentPlayer!, action);
    }, 550);

    return () => window.clearTimeout(timer);
  }, [applyStep, game, match.userSeat]);

  const isUserTurn = game.currentPlayer === match.userSeat;
  const validActions = useMemo(() => (isUserTurn ? game.legalActions : []), [game.legalActions, isUserTurn]);
  const isMatchComplete = match.roundsPlayed >= match.configuredRounds;

  return useMemo(
    () => ({
      config,
      match,
      game,
      isUserTurn,
      validActions,
      isMatchComplete,
      resetMatch,
      startNextRound,
      act
    }),
    [config, match, game, isUserTurn, validActions, isMatchComplete, resetMatch, startNextRound, act]
  );
}
