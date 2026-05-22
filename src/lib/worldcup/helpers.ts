import {
  worldCupGeneratedAt,
  worldCupMatchups,
  worldCupPlayers,
  worldCupSources,
  worldCupTeams,
} from "./data";
import type { WorldCupMatchup, WorldCupPlayer, WorldCupSource, WorldCupTeam } from "./types";

export function getWorldCupTeam(slug: string): WorldCupTeam | undefined {
  return worldCupTeams.find((team) => team.slug === slug);
}

export function getWorldCupPlayer(slug: string): WorldCupPlayer | undefined {
  return worldCupPlayers.find((player) => player.slug === slug);
}

export function getWorldCupMatchup(slug: string): WorldCupMatchup | undefined {
  return worldCupMatchups.find((matchup) => matchup.slug === slug);
}

export function getPlayersForTeam(teamSlug: string): WorldCupPlayer[] {
  return worldCupPlayers.filter((player) => player.teamSlug === teamSlug);
}

export function getMatchupsForTeam(teamSlug: string): WorldCupMatchup[] {
  return worldCupMatchups.filter((matchup) => matchup.teamSlugs.includes(teamSlug));
}

export function getSources(sourceIds: string[]): WorldCupSource[] {
  const uniqueIds = new Set(sourceIds);
  return worldCupSources.filter((source) => uniqueIds.has(source.id));
}

export function getTeamLabel(teamSlug: string): string {
  return getWorldCupTeam(teamSlug)?.name ?? teamSlug;
}

export function getPlayerLabel(playerSlug: string): string {
  return getWorldCupPlayer(playerSlug)?.name ?? playerSlug;
}

export function formatWorldCupUpdatedDate(): string {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    dateStyle: "medium",
    timeZone: "Asia/Taipei",
  }).format(new Date(worldCupGeneratedAt));
}

export function sourceTierLabel(source: WorldCupSource): string {
  switch (source.tier) {
    case "official":
      return "官方";
    case "public-data":
      return "公開資料";
    case "trusted-reference":
      return "可信資料站";
    case "future-api":
      return "未使用付費 API";
  }
}

export function teamStatusLabel(team: WorldCupTeam): string {
  switch (team.status) {
    case "host":
      return "主辦國";
    case "qualified":
      return "已列入 MVP 追蹤";
    case "watchlist":
      return "觀察名單";
  }
}

export function playerStatusLabel(player: WorldCupPlayer): string {
  switch (player.status) {
    case "public-squad":
      return "公開名單";
    case "final-squad-pending":
      return "等待最終名單";
    case "watchlist":
      return "觀察名單";
  }
}
