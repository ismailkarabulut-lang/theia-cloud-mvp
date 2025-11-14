// lib/patterns.ts
// Theia Cloud Mini – NPM Pattern Reader v0

export type LogRow = {
  id: string;
  created_at: string;
  mood: string | null;
  state_of_mind: string | null;
  content: string;
  tags: string[] | null;
};

export type PatternSummary = {
  timePattern: Record<string, number>;
  moodPattern: Record<string, number>;
  quickAddCount: number;
  totalLogs: number;
};

export function extractPatterns(logs: LogRow[]): PatternSummary {
  const timePattern: Record<string, number> = {};
  const moodPattern: Record<string, number> = {};
  let quickAddCount = 0;

  logs.forEach((log) => {
    // Saat pattern'i
    const hour = new Date(log.created_at).getHours();
    const hourKey = hour.toString().padStart(2, "0");
    timePattern[hourKey] = (timePattern[hourKey] || 0) + 1;

    // Mood pattern'i
    const mood = (log.mood || "unknown").toLowerCase();
    moodPattern[mood] = (moodPattern[mood] || 0) + 1;

    // Quick add intent pattern'i
    const state = log.state_of_mind?.toLowerCase() || "";
    if (state.includes("quick")) {
      quickAddCount += 1;
    }
  });

  return {
    timePattern,
    moodPattern,
    quickAddCount,
    totalLogs: logs.length,
  };
}
