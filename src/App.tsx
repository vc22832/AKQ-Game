import { ActionControls } from "./components/ActionControls";
import { CardView } from "./components/CardView";
import { HistoryPanel } from "./components/HistoryPanel";
import { RoleSelector } from "./components/RoleSelector";
import { useAkqTrainer } from "./hooks/useAkqTrainer";
import { useState } from "react";
import type { RoleMode } from "./lib/types/game";

function formatCurrentAction(isUserTurn: boolean, phase: string, roundOver: boolean): string {
  if (roundOver) return "Round finished";
  if (isUserTurn) return "Your turn";
  if (phase.includes("p1")) return "Waiting for Player 1";
  return "Waiting for Player 2";
}

export default function App() {
  const { game, match, isUserTurn, validActions, isMatchComplete, act, startNextRound, resetMatch } = useAkqTrainer();
  const [screen, setScreen] = useState<"menu" | "session" | "game">("menu");

  const userCard = game.cards[match.userSeat];
  const botSeat = match.userSeat === "P1" ? "P2" : "P1";
  const botCardVisible = game.phase === "round_over";
  const botCard = botCardVisible ? game.cards[botSeat] : "?";
  const progress = `${Math.min(match.roundsPlayed + 1, match.configuredRounds)} / ${match.configuredRounds}`;

  if (screen === "menu") {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 text-slate-100">
        <section className="w-full rounded-2xl border border-aquaAccent/70 bg-aquaShade/75 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brandGold">AKQ Trainer</p>
          <h1 className="mt-3 text-4xl font-bold">Master simplified GTO decisions</h1>
          <p className="mt-4 max-w-2xl text-slate-200">
            Train as P1, P2, or alternating seats with round-by-round feedback in a clean AKQ poker engine.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setScreen("session")}
              className="rounded-md bg-brandGold px-5 py-3 font-semibold text-aquaShade hover:brightness-110"
            >
              New Session
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "session") {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 text-slate-100">
        <section className="w-full space-y-4 rounded-2xl border border-aquaAccent/70 bg-aquaShade/75 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Session Setup</h1>
            <button
              type="button"
              onClick={() => setScreen("menu")}
              className="rounded-md border border-aquaAccent px-3 py-2 text-sm text-slate-200 hover:bg-aquaMid"
            >
              Back to Menu
            </button>
          </div>
          <RoleSelector
            defaultMode={match.roleMode}
            defaultRounds={match.configuredRounds}
            onStart={(roleMode: RoleMode, rounds: number) => {
              resetMatch({ roleMode, rounds });
              setScreen("game");
            }}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 text-slate-100">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
        <h1 className="text-3xl font-bold">AKQ Poker Trainer</h1>
        <p className="mt-1 text-slate-200">Train GTO-style decisions in a simplified AKQ game.</p>
        </div>
        <button
          type="button"
          onClick={() => setScreen("menu")}
          className="rounded-md border border-aquaAccent bg-aquaShade/70 px-3 py-2 text-sm text-slate-100 hover:bg-aquaMid"
        >
          Main Menu
        </button>
      </header>

      <section className="mb-5 grid gap-4 rounded-xl border border-aquaAccent/70 bg-aquaShade/80 p-4 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-slate-300">Role this round</p>
          <p className="text-lg font-semibold">{match.userSeat}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-300">Round</p>
          <p className="text-lg font-semibold">{progress}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-300">Pot</p>
          <p className="text-lg font-semibold">{game.pot} chips</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-300">Total P/L</p>
          <p className={`text-lg font-semibold ${match.totalProfit >= 0 ? "text-brandGold" : "text-rose-300"}`}>
            {match.totalProfit >= 0 ? "+" : ""}
            {match.totalProfit}
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-aquaAccent/70 bg-aquaShade/80 p-4">
          <div className="mb-4 flex flex-wrap gap-4">
            <CardView label="Your Card" card={userCard} />
            <CardView label="Bot Card" card={botCard} revealed={botCardVisible} />
          </div>

          <p className="mb-1 text-sm text-slate-300">Current action</p>
          <p className="mb-4 text-base font-semibold">
            {formatCurrentAction(isUserTurn, game.phase, game.phase === "round_over")}
          </p>

          {game.phase !== "round_over" && (
            <ActionControls actions={validActions} onAction={act} disabled={!isUserTurn} />
          )}

          {game.result && (
            <div className="mt-4 rounded-lg border border-aquaAccent bg-aquaDeep p-3 text-sm">
              <p className="font-semibold text-slate-100">
                {game.result.winner === match.userSeat ? "You win" : "Bot wins"} ({game.result.reason})
              </p>
              <p className="text-slate-200">
                Round delta: {game.result.winner === match.userSeat ? "+" : "-"}
                {game.result.payoff}
              </p>
              <button
                type="button"
                onClick={startNextRound}
                disabled={isMatchComplete}
                className="mt-3 rounded-md bg-brandGold px-4 py-2 font-semibold text-aquaShade hover:brightness-110 disabled:opacity-40"
              >
                {isMatchComplete ? "Session complete" : "Next round"}
              </button>
              {isMatchComplete && (
                <button
                  type="button"
                  onClick={() => setScreen("session")}
                  className="ml-2 mt-3 rounded-md border border-aquaAccent px-4 py-2 font-semibold text-slate-100 hover:bg-aquaMid"
                >
                  Configure New Session
                </button>
              )}
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-aquaAccent/70 bg-aquaShade/80 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-brandGold">Session</p>
            <p className="mt-2 text-sm text-slate-200">
              Mode: {match.roleMode} | Rounds: {match.configuredRounds}
            </p>
          </section>
          <HistoryPanel history={game.history} userSeat={match.userSeat} />
        </div>
      </div>
    </main>
  );
}
