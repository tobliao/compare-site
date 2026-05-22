export type SourceTier = "official" | "public-data" | "trusted-reference" | "future-api";

export interface WorldCupSource {
  id: string;
  name: string;
  url: string;
  tier: SourceTier;
  usage: string;
  lastChecked: string;
}

export interface HistoricalCycle {
  year: number;
  result: string;
  note: string;
}

export interface WorldCupTeam {
  slug: string;
  name: string;
  shortName: string;
  confederation: string;
  status: "qualified" | "host" | "watchlist";
  group?: string;
  fifaTitles: number;
  bestFinish: string;
  marketValueLabel?: string;
  averageAgeLabel?: string;
  style: string;
  strengths: string[];
  watchPoints: string[];
  historicalCycles: HistoricalCycle[];
  keyPlayerSlugs: string[];
  sourceIds: string[];
}

export interface WorldCupPlayer {
  slug: string;
  name: string;
  teamSlug: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  club: string;
  status: "watchlist" | "public-squad" | "final-squad-pending";
  role: string;
  summary: string;
  strengths: string[];
  matchupFocus: string;
  sourceIds: string[];
}

export interface WorldCupFixture {
  slug: string;
  stage: string;
  homeTeamSlug: string;
  awayTeamSlug: string;
  venue: string;
  kickoffLabel: string;
  note: string;
  sourceIds: string[];
}

export interface PositionDuel {
  label: string;
  summary: string;
}

export interface WorldCupMatchup {
  slug: string;
  title: string;
  teamSlugs: [string, string];
  stage: string;
  summary: string;
  tempoRead: string;
  watchSignals: string[];
  positionDuels: PositionDuel[];
  playerSlugs: string[];
  sourceIds: string[];
}

export interface WorldCupInsight {
  id: string;
  title: string;
  category: "team-form" | "player-watch" | "tactical-trend" | "schedule-risk" | "data-policy";
  body: string;
  sourceIds: string[];
}
