import { worldCupMatchups, worldCupPlayers, worldCupTeams } from "./data";
import type { HistoricalCycle } from "./types";

export type ConfidenceLevel = "official" | "open-data" | "curated" | "watchlist";

export interface MetricPoint {
  label: string;
  value: number;
  note: string;
}

export interface TeamMetricProfile {
  teamSlug: string;
  headline: string;
  oneNumber: {
    label: string;
    value: string;
    note: string;
  };
  radar: MetricPoint[];
  editorialRead: string;
  trafficHook: string;
  confidence: ConfidenceLevel;
}

export interface PlayerRoleProfile {
  playerSlug: string;
  roleType: string;
  impactZone: string;
  oneNumber: {
    label: string;
    value: string;
    note: string;
  };
  traits: MetricPoint[];
  editorialRead: string;
  confidence: ConfidenceLevel;
}

export interface MatchupMetricProfile {
  matchupSlug: string;
  leftTeamSlug: string;
  rightTeamSlug: string;
  meters: Array<{
    label: string;
    leftValue: number;
    rightValue: number;
    read: string;
  }>;
  decisiveQuestion: string;
  confidence: ConfidenceLevel;
}

export interface SignalItem {
  category: string;
  label: string;
  detail: string;
  confidence: ConfidenceLevel;
}

export interface RelatedLink {
  label: string;
  href: string;
  meta: string;
}

const teamMetricProfiles: TeamMetricProfile[] = [
  makeTeamProfile("argentina", "冠軍班底的問題不是能不能控球，而是核心體能如何分配。", "淘汰賽管理", "3 屆連續具競爭力", "大賽經驗仍是阿根廷最大資產，但 2026 的重點會是節奏管理。", [86, 82, 76, 79, 94], "Messi 是否進入最終名單，會決定這頁的搜尋與回訪高峰。"),
  makeTeamProfile("france", "法國最可怕的是讓比賽變成大片空間的速度戰。", "轉換速度", "93/100", "如果對手把防線推高，法國能用一次傳球把局面打穿。", [91, 84, 96, 91, 88], "Mbappe 對位、法國陣容深度與冠軍熱門會是長尾流量核心。"),
  makeTeamProfile("england", "英格蘭的天花板在前場，但流量會集中在關鍵場是否又變保守。", "陣容深度", "92/100", "Kane、Bellingham 與 Saka 讓英格蘭擁有多種解法。", [88, 80, 84, 92, 82], "英格蘭隊分析、Bellingham、Kane 與奪冠熱門關鍵字會長期有量。"),
  makeTeamProfile("brazil", "巴西的問題不是缺少天才，而是淘汰賽能否把天才變成穩定輸出。", "邊路爆破", "95/100", "Vinicius 會讓對手防線傾斜，但中場控制仍是關鍵。", [90, 78, 92, 86, 90], "巴西歷史底蘊與明星邊鋒是最容易被分享的內容。"),
  makeTeamProfile("spain", "西班牙能控制球，但真正要看的是能不能把控球變成禁區威脅。", "控球穩定", "94/100", "年輕邊路提升了速度，但終結效率仍要追蹤。", [84, 83, 80, 84, 84], "Yamal、Pedri 與西班牙戰術分析適合做 explainer 與球員導流。"),
  makeTeamProfile("usa", "美國的主場紅利會帶來聲量，但進攻細節仍需要被驗證。", "主場能量", "90/100", "年輕速度與主場氣氛足以製造高強度比賽。", [76, 74, 88, 78, 70], "主辦國、城市、觀賽文化與 Pulisic 會承接非核心足球迷流量。"),
  makeTeamProfile("mexico", "墨西哥最值得追的是壓力：主場期待會變成推力還是負擔。", "主場壓力", "88/100", "若中鋒能把邊路傳中轉成進球，墨西哥會很有話題。", [74, 75, 78, 76, 82], "開幕戰、主辦國與墨西哥隊搜尋會在賽程公布後升溫。"),
  makeTeamProfile("japan", "日本是最適合做深度分析的亞洲隊，因為戰術紀律與旅歐深度都能講清楚。", "戰術紀律", "91/100", "日本真正的亮點是弱側轉移與反擊第一拍。", [80, 84, 86, 82, 76], "日本隊戰術、三笘薰、久保建英是繁中流量很好的切入點。"),
];

const playerRoleProfiles: PlayerRoleProfile[] = [
  makePlayerRole("kylian-mbappe", "Vertical Breaker", "左側肋部與防線身後", "防線後退壓力", "頂級", [97, 92, 87, 90], "看 Mbappe 不是只看射門，而是看他讓對手防線願不願意往前站。"),
  makePlayerRole("jude-bellingham", "Box Crasher", "中路禁區前與第二波", "後插上威脅", "高", [90, 89, 86, 88], "Bellingham 的價值在於把中場控球變成禁區觸球。"),
  makePlayerRole("harry-kane", "Linking Finisher", "中鋒回撤與禁區中央", "串聯 + 終結", "雙核心", [88, 82, 92, 90], "Kane 回撤會逼中衛做選擇，這比單純射門數更重要。"),
  makePlayerRole("vinicius-junior", "Wide Isolator", "左路一對一", "邊路爆破", "頂級", [96, 88, 86, 84], "Vinicius 會把比賽變成邊後衛與協防中場的壓力測試。"),
  makePlayerRole("lamine-yamal", "Creative Winger", "右路內切與最後一傳", "創造力", "高", [88, 86, 82, 79], "Yamal 的流量不只來自年齡，而是他已經能改變防線重心。"),
  makePlayerRole("lionel-messi", "Zone Solver", "右肋與禁區前", "低節奏解題", "待確認", [84, 78, 96, 86], "若進最終名單，Messi 仍會是阿根廷最能吸引搜尋的名字。"),
  makePlayerRole("julian-alvarez", "Pressing Forward", "前場第一線壓迫", "無球價值", "高", [84, 90, 82, 86], "Alvarez 讓阿根廷不只靠靈光，也能靠壓迫製造二次進攻。"),
  makePlayerRole("christian-pulisic", "Transition Carrier", "左路推進與反擊出口", "主場出口", "高", [86, 84, 82, 82], "Pulisic 是美國把主場能量變成實際威脅的核心。"),
  makePlayerRole("takefusa-kubo", "Half-Space Creator", "右側半空間", "小空間處理", "高", [82, 86, 84, 80], "Kubo 讓日本不只能防反，也能在控球局找到下一腳。"),
  makePlayerRole("kaoru-mitoma", "Tempo Changer", "左路變速與替補衝擊", "節奏變化", "高", [88, 82, 80, 78], "Mitoma 的價值常常在下半場，他能讓疲勞防線變得不安。"),
  makePlayerRole("santiago-gimenez", "Penalty-Box Finisher", "禁區中央與第一點", "終結轉換率", "待觀察", [80, 76, 84, 78], "墨西哥需要他把主場氣勢轉成禁區裡的真正成果。"),
  makePlayerRole("pedri", "Tempo Controller", "中場轉向與前場連接", "節奏控制", "高", [82, 88, 86, 84], "Pedri 決定西班牙的控球是橫向循環，還是能往前推進。"),
];

const matchupMetricProfiles: MatchupMetricProfile[] = [
  {
    matchupSlug: "france-vs-brazil-wide-threats",
    leftTeamSlug: "france",
    rightTeamSlug: "brazil",
    meters: [
      { label: "轉換速度", leftValue: 94, rightValue: 89, read: "開放局面更接近法國想要的比賽。" },
      { label: "邊路單挑", leftValue: 90, rightValue: 96, read: "巴西的單點爆破更純粹，法國更吃轉換空間。" },
      { label: "中場控制", leftValue: 82, rightValue: 76, read: "誰能少丟中路球權，誰就能減少被反擊。" },
      { label: "淘汰賽經驗", leftValue: 90, rightValue: 88, read: "兩邊都有歷史底蘊，差距在臨場穩定性。" },
    ],
    decisiveQuestion: "比賽會被拉成速度戰，還是被壓成邊路單點攻防？",
    confidence: "curated",
  },
  {
    matchupSlug: "england-vs-spain-midfield-control",
    leftTeamSlug: "england",
    rightTeamSlug: "spain",
    meters: [
      { label: "控球穩定", leftValue: 80, rightValue: 94, read: "慢節奏更像西班牙的比賽。" },
      { label: "禁區前插", leftValue: 91, rightValue: 82, read: "英格蘭的後上會測試西班牙防守中場。" },
      { label: "邊路創造", leftValue: 86, rightValue: 88, read: "兩隊都有右路爆點，但使用方式不同。" },
      { label: "終結效率", leftValue: 90, rightValue: 78, read: "Kane 讓英格蘭在小樣本機會裡更有把握。" },
    ],
    decisiveQuestion: "西班牙能否把控球變成機會，還是英格蘭用一次前插改變比賽？",
    confidence: "curated",
  },
  {
    matchupSlug: "japan-vs-usa-transition-duel",
    leftTeamSlug: "japan",
    rightTeamSlug: "usa",
    meters: [
      { label: "戰術紀律", leftValue: 91, rightValue: 78, read: "日本更擅長把比賽切成可控段落。" },
      { label: "主場能量", leftValue: 72, rightValue: 91, read: "美國會吃到主場與速度帶來的情緒紅利。" },
      { label: "反擊質量", leftValue: 86, rightValue: 84, read: "兩隊都能反擊，差別在日本更講究弱側選擇。" },
      { label: "定位球風險", leftValue: 74, rightValue: 82, read: "身體條件與第二點保護會是日本的壓力。" },
    ],
    decisiveQuestion: "美國能否把速度變成禁區成果，還是日本用紀律拖住節奏？",
    confidence: "curated",
  },
];

export const globalSignalBoard: SignalItem[] = [
  { category: "名單", label: "最終 26 人名單", detail: "所有球員頁先用 watchlist，不把未公告資訊寫成最終名單。", confidence: "official" },
  { category: "賽程", label: "休息天數與旅行距離", detail: "2026 橫跨三國，移動成本會成為賽前情報的重要欄位。", confidence: "curated" },
  { category: "場地", label: "主辦城市與草皮條件", detail: "比賽地點公布後，可把天氣、海拔、草皮與旅行距離接到 fixture cards。", confidence: "watchlist" },
  { category: "戰術", label: "邊路與禁區觸球", detail: "FIFA Training Centre 已把 wide areas 列為 2022 後的重要趨勢之一。", confidence: "open-data" },
];

export function getTeamMetricProfile(teamSlug: string): TeamMetricProfile {
  return teamMetricProfiles.find((profile) => profile.teamSlug === teamSlug) ?? fallbackTeamProfile(teamSlug);
}

export function getPlayerRoleProfile(playerSlug: string): PlayerRoleProfile {
  return playerRoleProfiles.find((profile) => profile.playerSlug === playerSlug) ?? fallbackPlayerProfile(playerSlug);
}

export function getMatchupMetricProfile(matchupSlug: string): MatchupMetricProfile {
  return matchupMetricProfiles.find((profile) => profile.matchupSlug === matchupSlug) ?? fallbackMatchupProfile(matchupSlug);
}

export function getTeamSignals(teamSlug: string): SignalItem[] {
  const profile = getTeamMetricProfile(teamSlug);
  return [
    { category: "一句話", label: profile.oneNumber.label, detail: `${profile.oneNumber.value}：${profile.oneNumber.note}`, confidence: profile.confidence },
    { category: "流量鉤子", label: "使用者會搜尋什麼", detail: profile.trafficHook, confidence: "curated" },
    ...globalSignalBoard.slice(0, 2),
  ];
}

export function getMatchupSignals(matchupSlug: string): SignalItem[] {
  const profile = getMatchupMetricProfile(matchupSlug);
  return [
    { category: "決定性問題", label: profile.decisiveQuestion, detail: "這不是勝負預測，而是使用者看比賽前最該追蹤的戰術問題。", confidence: profile.confidence },
    ...globalSignalBoard.slice(1, 4),
  ];
}

export function getRelatedLinksForTeam(teamSlug: string): RelatedLink[] {
  const team = worldCupTeams.find((item) => item.slug === teamSlug);
  const players = worldCupPlayers.filter((player) => player.teamSlug === teamSlug).slice(0, 3);
  const matchups = worldCupMatchups.filter((matchup) => matchup.teamSlugs.includes(teamSlug)).slice(0, 2);
  return [
    ...players.map((player) => ({
      label: player.name,
      href: `/worldcup/players/${player.slug}/`,
      meta: `${team?.name ?? "隊伍"} 球員觀察`,
    })),
    ...matchups.map((matchup) => ({
      label: matchup.title,
      href: `/worldcup/matchups/${matchup.slug}/`,
      meta: "相關對位分析",
    })),
    {
      label: "世界盃資料來源與使用聲明",
      href: "/worldcup/sources/",
      meta: "資料可信度與合規邊界",
    },
  ];
}

export function getRelatedLinksForPlayer(playerSlug: string): RelatedLink[] {
  const player = worldCupPlayers.find((item) => item.slug === playerSlug);
  const team = player ? worldCupTeams.find((item) => item.slug === player.teamSlug) : undefined;
  const matchups = player
    ? worldCupMatchups.filter((matchup) => matchup.playerSlugs.includes(player.slug)).slice(0, 2)
    : [];
  return [
    ...(team
      ? [
          {
            label: `${team.name} 隊伍分析`,
            href: `/worldcup/teams/${team.slug}/`,
            meta: "放回隊伍戰術脈絡",
          },
        ]
      : []),
    ...matchups.map((matchup) => ({
      label: matchup.title,
      href: `/worldcup/matchups/${matchup.slug}/`,
      meta: "球員相關對位",
    })),
    {
      label: "2026 World Cup Hub",
      href: "/worldcup/",
      meta: "回到賽事情報中心",
    },
  ];
}

export function getRelatedLinksForMatchup(matchupSlug: string): RelatedLink[] {
  const matchup = worldCupMatchups.find((item) => item.slug === matchupSlug);
  if (!matchup) {
    return [];
  }

  return [
    ...matchup.teamSlugs.map((teamSlug) => {
      const team = worldCupTeams.find((item) => item.slug === teamSlug);
      return {
        label: team?.name ?? teamSlug,
        href: `/worldcup/teams/${teamSlug}/`,
        meta: "隊伍情報頁",
      };
    }),
    ...matchup.playerSlugs.slice(0, 2).map((playerSlug) => {
      const player = worldCupPlayers.find((item) => item.slug === playerSlug);
      return {
        label: player?.name ?? playerSlug,
        href: `/worldcup/players/${playerSlug}/`,
        meta: "關鍵球員頁",
      };
    }),
  ];
}

export function getTimelineScore(cycle: HistoricalCycle): number {
  if (cycle.result.includes("冠軍")) return 100;
  if (cycle.result.includes("亞軍")) return 88;
  if (cycle.result.includes("4 強")) return 76;
  if (cycle.result.includes("8 強")) return 64;
  if (cycle.result.includes("16 強")) return 48;
  if (cycle.result.includes("小組")) return 28;
  return 16;
}

function makeTeamProfile(
  teamSlug: string,
  headline: string,
  oneNumberLabel: string,
  oneNumberValue: string,
  oneNumberNote: string,
  values: [number, number, number, number, number],
  trafficHook: string,
): TeamMetricProfile {
  return {
    teamSlug,
    headline,
    oneNumber: {
      label: oneNumberLabel,
      value: oneNumberValue,
      note: oneNumberNote,
    },
    radar: [
      { label: "攻擊火力", value: values[0], note: "以明星球員、創造力與終結點綜合人工評估。" },
      { label: "防守穩定", value: values[1], note: "以近年大賽印象、結構與防線保護評估。" },
      { label: "轉換速度", value: values[2], note: "看由守轉攻、邊路速度與前場衝刺能力。" },
      { label: "陣容深度", value: values[3], note: "看替補品質與多位置解法。" },
      { label: "大賽經驗", value: values[4], note: "看近三屆世界盃與淘汰賽履歷。" },
    ],
    editorialRead: oneNumberNote,
    trafficHook,
    confidence: "curated",
  };
}

function makePlayerRole(
  playerSlug: string,
  roleType: string,
  impactZone: string,
  oneNumberLabel: string,
  oneNumberValue: string,
  values: [number, number, number, number],
  editorialRead: string,
): PlayerRoleProfile {
  return {
    playerSlug,
    roleType,
    impactZone,
    oneNumber: {
      label: oneNumberLabel,
      value: oneNumberValue,
      note: editorialRead,
    },
    traits: [
      { label: "直接威脅", value: values[0], note: "能否直接改變防線與禁區威脅。" },
      { label: "無球影響", value: values[1], note: "跑動、牽制與壓迫帶來的價值。" },
      { label: "創造能力", value: values[2], note: "最後一傳、節奏與空間創造。" },
      { label: "大賽敘事", value: values[3], note: "搜尋熱度與故事性潛力。" },
    ],
    editorialRead,
    confidence: "curated",
  };
}

function fallbackTeamProfile(teamSlug: string): TeamMetricProfile {
  return makeTeamProfile(teamSlug, "這支隊伍需要更多可驗證資料補強。", "資料完整度", "待補", "目前先用 curated data 呈現 MVP。", [60, 60, 60, 60, 60], "後續可依官方名單與賽程補強。");
}

function fallbackPlayerProfile(playerSlug: string): PlayerRoleProfile {
  return makePlayerRole(playerSlug, "Watchlist", "待補影響區域", "資料完整度", "待補", [60, 60, 60, 60], "目前先用觀察名單方式呈現。");
}

function fallbackMatchupProfile(matchupSlug: string): MatchupMetricProfile {
  return {
    matchupSlug,
    leftTeamSlug: "team-a",
    rightTeamSlug: "team-b",
    meters: [],
    decisiveQuestion: "這組對位仍待補更多公開資料。",
    confidence: "watchlist",
  };
}
