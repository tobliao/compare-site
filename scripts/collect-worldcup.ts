import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { worldCupMatchups, worldCupPlayers, worldCupTeams } from "@worldcup/lib/data";
import { worldCupTopicPages } from "@worldcup/lib/topics";

const outputPath = resolve("data/worldcup/crawl-report.json");
const generatedAt = new Date().toISOString();
const report = {
  generatedAt,
  status: "curated-static",
  sourceMode: "Static curated public-data MVP",
  automation: "This job validates and reports World Cup static data freshness independently from Price and Chisha refresh jobs.",
  counts: {
    teams: worldCupTeams.length,
    players: worldCupPlayers.length,
    matchups: worldCupMatchups.length,
    topics: worldCupTopicPages.length,
  },
  warnings: [
    "World Cup live fixtures, official final squads, injuries, weather, and match events are not connected to a live API yet.",
    "This report exists so the World Cup workflow has an independent scheduled refresh and artifact.",
  ],
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(
  `Collected World Cup report: ${report.counts.teams} teams, ${report.counts.players} players, ${report.counts.matchups} matchups, ${report.counts.topics} topics.`,
);
