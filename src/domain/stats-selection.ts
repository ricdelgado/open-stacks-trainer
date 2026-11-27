import {
  MODES,
  type Mode,
  type ModeStats,
  type StackModes,
  type StatsSelection,
} from "./types";

export interface PracticedMode {
  mode: Mode;
  stats: ModeStats;
}

export interface PracticedStack {
  stackId: string;
  name: string;
  modes: PracticedMode[];
  lastPracticedAt: string;
}

export function practicedStacksFor(
  stats: Record<string, StackModes>,
  resolveName: (stackId: string) => string | null,
): PracticedStack[] {
  const result: PracticedStack[] = [];

  for (const [stackId, stackModes] of Object.entries(stats)) {
    if (!stackModes) continue;
    const name = resolveName(stackId);
    if (name === null) continue;

    const modes: PracticedMode[] = [];
    let lastPracticedAt = "";

    for (const mode of MODES) {
      const modeStats = stackModes[mode];
      if (!modeStats || modeStats.totalAnswered <= 0) continue;
      modes.push({ mode, stats: modeStats });
      if (modeStats.lastPracticedAt > lastPracticedAt) {
        lastPracticedAt = modeStats.lastPracticedAt;
      }
    }

    if (modes.length === 0) continue;
    result.push({ stackId, name, modes, lastPracticedAt });
  }

  result.sort(
    (left, right) =>
      right.lastPracticedAt.localeCompare(left.lastPracticedAt) ||
      left.name.localeCompare(right.name),
  );

  return result;
}

export function mostRecentMode(stack: PracticedStack): Mode {
  const first = stack.modes[0];
  if (!first) return "basic";

  let best = first;
  for (const entry of stack.modes) {
    if (entry.stats.lastPracticedAt > best.stats.lastPracticedAt) {
      best = entry;
    }
  }
  return best.mode;
}

export function defaultSelection(
  practiced: readonly PracticedStack[],
): { stackId: string; mode: Mode } | null {
  const first = practiced[0];
  if (!first) return null;
  return { stackId: first.stackId, mode: mostRecentMode(first) };
}

export function resolveStatsSelection(
  practiced: readonly PracticedStack[],
  persisted: StatsSelection | undefined,
): { stackId: string; mode: Mode } | null {
  if (persisted) {
    const stack = practiced.find(
      (entry) => entry.stackId === persisted.stackId,
    );
    if (stack) {
      const hasMode = stack.modes.some(
        (entry) => entry.mode === persisted.mode,
      );
      return {
        stackId: stack.stackId,
        mode: hasMode ? persisted.mode : mostRecentMode(stack),
      };
    }
  }

  return defaultSelection(practiced);
}

export function shouldShowStackSelector(
  practiced: readonly PracticedStack[],
): boolean {
  return practiced.length > 1;
}

export function shouldShowModeTabs(stack: PracticedStack | undefined): boolean {
  return (stack?.modes.length ?? 0) > 1;
}

export function withoutStackStats(
  stats: Record<string, StackModes>,
  stackId: string,
): Record<string, StackModes> {
  const next = { ...stats };
  delete next[stackId];
  return next;
}
