export interface WorldCupTopicSection {
  title: string;
  body: string;
}

export interface WorldCupTopicFaq {
  question: string;
  answer: string;
}

export interface WorldCupTopicPage {
  slug: string;
  title: string;
  intent: string;
  description: string;
  heroTakeaway: string;
  tags: string[];
  relatedTeamSlugs: string[];
  relatedPlayerSlugs: string[];
  relatedMatchupSlugs: string[];
  sections: WorldCupTopicSection[];
  faqs: WorldCupTopicFaq[];
  sourceIds: string[];
}

export const worldCupTopicPages: WorldCupTopicPage[] = [
  {
    slug: "2026-world-cup-dark-horses",
    title: "2026 世界盃黑馬觀察",
    intent: "黑馬與低估球隊",
    description: "用陣容完整度、戰術成熟度與近三屆大賽脈絡，整理 2026 世界盃可能被低估的隊伍。",
    heroTakeaway: "黑馬不是冷門預測，而是找出外界名氣與實際戰力之間的落差。",
    tags: ["黑馬", "陣容深度", "戰術成熟度"],
    relatedTeamSlugs: ["japan", "usa", "mexico"],
    relatedPlayerSlugs: ["takefusa-kubo", "kaoru-mitoma", "christian-pulisic"],
    relatedMatchupSlugs: ["japan-vs-usa-transition-duel"],
    sections: [
      {
        title: "先看戰術可複製性",
        body: "黑馬最怕只靠情緒或單場爆發。比較可靠的黑馬通常有穩定防守結構、清楚的反擊出口，以及至少一名能在壓力下把球帶出去的球員。",
      },
      {
        title: "再看賽程與旅行成本",
        body: "2026 橫跨三個國家，休息天數與移動距離會放大陣容深度差距。主辦國與熟悉環境的隊伍更容易在小組賽前段建立節奏。",
      },
    ],
    faqs: [
      {
        question: "黑馬分析是不是下注建議？",
        answer: "不是。這裡只整理資訊面與戰術面，幫使用者理解哪些隊伍可能被低估，不提供投注方向或賠率解讀。",
      },
      {
        question: "為什麼日本常被列入觀察？",
        answer: "日本近年旅歐球員深度提升，且 2022 對德國、西班牙的表現證明他們能執行高紀律比賽計畫。",
      },
    ],
    sourceIds: ["fifa-worldcup", "fifa-training", "transfermarkt"],
  },
  {
    slug: "golden-boot-watchlist",
    title: "2026 世界盃金靴候選觀察",
    intent: "明星前鋒與進球敘事",
    description: "整理 2026 世界盃值得追蹤的前鋒與邊鋒，重點放在角色、出手機會與球隊供應線。",
    heroTakeaway: "金靴不是只看誰最會射門，而是看球隊能不能穩定把球送到他的高價值區域。",
    tags: ["金靴", "前鋒", "明星球員"],
    relatedTeamSlugs: ["france", "england", "brazil"],
    relatedPlayerSlugs: ["kylian-mbappe", "harry-kane", "vinicius-junior"],
    relatedMatchupSlugs: ["france-vs-brazil-wide-threats", "england-vs-spain-midfield-control"],
    sections: [
      {
        title: "角色比名氣更重要",
        body: "同樣是明星球員，有人負責終結，有人負責牽制，有人負責最後一傳。真正容易累積進球的人，通常同時擁有穩定出場、固定戰術角色與定位球或點球權重。",
      },
      {
        title: "供應線決定上限",
        body: "Kane 的優勢在於英格蘭有多個傳球點；Mbappe 的優勢在於法國能把比賽拉成速度戰；Vinicius 的威脅則來自左路一對一與弱側接應。",
      },
    ],
    faqs: [
      {
        question: "金靴候選會隨正式名單改變嗎？",
        answer: "會。MVP 階段先用 watchlist，正式名單與小組賽賽程公布後，才適合調整優先級。",
      },
      {
        question: "為什麼不放賠率排名？",
        answer: "本站定位是資訊分析，不呈現 odds 或市場價格，避免把內容轉成下注導流。",
      },
    ],
    sourceIds: ["opta-analyst", "transfermarkt", "fotmob"],
  },
  {
    slug: "host-nation-advantage",
    title: "2026 世界盃主辦國優勢怎麼看",
    intent: "主辦國與賽程因素",
    description: "分析美國、墨西哥、加拿大主辦國環境如何影響賽程、球迷聲量與比賽節奏。",
    heroTakeaway: "主場優勢不是玄學，而是旅行、氣候、球迷、熟悉場地與壓力管理的總和。",
    tags: ["主辦國", "賽程", "旅程距離"],
    relatedTeamSlugs: ["usa", "mexico"],
    relatedPlayerSlugs: ["christian-pulisic", "santiago-gimenez"],
    relatedMatchupSlugs: ["japan-vs-usa-transition-duel"],
    sections: [
      {
        title: "主場會放大情緒，也會放大壓力",
        body: "美國與墨西哥都會得到現場能量，但這不等於自動轉成勝勢。真正要看的是開局 20 分鐘能否把情緒變成有效壓迫與禁區觸球。",
      },
      {
        title: "旅行距離會讓陣容深度更重要",
        body: "2026 賽事範圍大，若球隊在短時間內跨城市移動，輪換品質與恢復管理會影響後段比賽表現。",
      },
    ],
    faqs: [
      {
        question: "主辦國一定比較有利嗎？",
        answer: "通常有環境與球迷優勢，但壓力也更大。本站會把它拆成可觀察因素，而不是簡單寫成必然優勢。",
      },
      {
        question: "什麼時候會補城市資料？",
        answer: "當官方賽程與場地細節更完整後，會把城市、氣候、旅行距離加入 fixture watch。",
      },
    ],
    sourceIds: ["fifa-worldcup", "sofascore", "fotmob"],
  },
  {
    slug: "japan-tactical-preview",
    title: "日本隊 2026 世界盃戰術觀察",
    intent: "亞洲球隊深度分析",
    description: "從旅歐球員、弱側轉移、反擊節奏與邊路創造力，看日本隊 2026 世界盃的競爭力。",
    heroTakeaway: "日本隊最值得看的不是激情，而是他們能不能把紀律變成穩定的高品質反擊。",
    tags: ["日本隊", "戰術分析", "亞洲足球"],
    relatedTeamSlugs: ["japan"],
    relatedPlayerSlugs: ["takefusa-kubo", "kaoru-mitoma"],
    relatedMatchupSlugs: ["japan-vs-usa-transition-duel"],
    sections: [
      {
        title: "弱側轉移是關鍵",
        body: "日本不一定長時間控球，但他們很擅長在奪回球權後快速找到弱側。Kubo 與 Mitoma 的存在，讓兩側都能成為出口。",
      },
      {
        title: "定位球與身體對抗仍是風險",
        body: "面對更高大或更直接的隊伍，日本需要保護第二點與禁區前沿，不然會被長球與定位球拖入不舒服的比賽。",
      },
    ],
    faqs: [
      {
        question: "日本隊是黑馬嗎？",
        answer: "更精準的說法是高紀律、高執行力的危險對手。是否是黑馬，要看分組與淘汰賽路徑。",
      },
      {
        question: "三笘薰和久保建英誰更重要？",
        answer: "兩人影響區域不同。Kubo 更像半空間創造者，Mitoma 更像邊路變速器。",
      },
    ],
    sourceIds: ["fifa-training", "transfermarkt", "fotmob"],
  },
  {
    slug: "france-squad-depth",
    title: "法國隊陣容深度與速度轉換",
    intent: "冠軍熱門隊伍分析",
    description: "從 Mbappe、邊路速度、中後場身體條件與替補深度，看法國隊為什麼仍是 2026 高關注隊伍。",
    heroTakeaway: "法國不是只靠球星，而是能把防守、速度與替補深度組成完整比賽方案。",
    tags: ["法國隊", "Mbappe", "陣容深度"],
    relatedTeamSlugs: ["france"],
    relatedPlayerSlugs: ["kylian-mbappe"],
    relatedMatchupSlugs: ["france-vs-brazil-wide-threats"],
    sections: [
      {
        title: "速度會改變對手防線高度",
        body: "只要 Mbappe 在場，對手高位壓迫前就必須先想身後空間。這會讓法國即使控球不多，也能讓比賽保持威脅。",
      },
      {
        title: "深度是長賽制的優勢",
        body: "48 隊賽制拉長後，替補與輪換品質會更重要。法國過去在傷病情況下仍能打進決賽，正是陣容深度的證據。",
      },
    ],
    faqs: [
      {
        question: "法國最怕什麼型態的對手？",
        answer: "能穩定控球、降低轉換次數，又能在邊路保護到位的隊伍，會讓法國最舒服的速度戰變少。",
      },
      {
        question: "這是奪冠預測嗎？",
        answer: "不是。這是隊伍結構分析，不提供勝負或下注方向。",
      },
    ],
    sourceIds: ["fifa-training", "opta-analyst", "transfermarkt"],
  },
  {
    slug: "argentina-post-champion-era",
    title: "阿根廷冠軍後時代觀察",
    intent: "衛冕冠軍敘事",
    description: "從 2022 冠軍班底、Messi 狀態、Alvarez 無球價值與中場平衡，看阿根廷 2026 的核心問題。",
    heroTakeaway: "阿根廷的重點不是有沒有故事，而是冠軍班底如何管理體能與節奏。",
    tags: ["阿根廷", "Messi", "衛冕冠軍"],
    relatedTeamSlugs: ["argentina"],
    relatedPlayerSlugs: ["lionel-messi", "julian-alvarez"],
    relatedMatchupSlugs: ["france-vs-brazil-wide-threats"],
    sections: [
      {
        title: "冠軍班底帶來經驗，也帶來體能問題",
        body: "阿根廷 2022 的平衡來自中場保護、前場壓迫與 Messi 的最後一傳。2026 要看的不是名氣，而是這套結構還能維持多少強度。",
      },
      {
        title: "Alvarez 的無球價值會被放大",
        body: "如果 Messi 進入最終名單，Alvarez 的跑動與壓迫能幫阿根廷補上強度；如果不進，阿根廷需要重新分配創造責任。",
      },
    ],
    faqs: [
      {
        question: "Messi 一定會參加 2026 嗎？",
        answer: "目前本站不把觀察名單寫成最終名單，會等官方或可靠公開資訊更新。",
      },
      {
        question: "阿根廷還是熱門嗎？",
        answer: "他們有冠軍經驗與成熟結構，但 2026 的關鍵會是核心球員體能與輪換。",
      },
    ],
    sourceIds: ["fifa-worldcup", "fifa-training", "transfermarkt"],
  },
  {
    slug: "world-cup-48-team-format",
    title: "2026 世界盃 48 隊賽制怎麼看",
    intent: "賽制解釋與新手入口",
    description: "用簡單方式整理 2026 世界盃擴軍後，為什麼賽程、輪換與淘汰賽路徑會更重要。",
    heroTakeaway: "48 隊不是只代表比賽變多，也代表內容、冷門、輪換與長尾搜尋都會變多。",
    tags: ["48 隊", "賽制", "新手指南"],
    relatedTeamSlugs: ["usa", "mexico", "japan"],
    relatedPlayerSlugs: ["christian-pulisic", "takefusa-kubo"],
    relatedMatchupSlugs: ["japan-vs-usa-transition-duel"],
    sections: [
      {
        title: "更多隊伍，更多長尾故事",
        body: "擴軍讓非傳統強隊有更多曝光，球迷也會搜尋更多區域型故事，例如亞洲隊、主辦國、黑馬與新星。",
      },
      {
        title: "輪換比以往更重要",
        body: "比賽變多、路徑變長，陣容深度與恢復管理會影響後段比賽。這也是為什麼隊伍頁需要加入 depth 與 schedule risk。",
      },
    ],
    faqs: [
      {
        question: "48 隊賽制會讓冷門變多嗎？",
        answer: "可能讓更多類型的對戰出現，但冷門仍取決於對位、賽程與臨場狀態，不能只用賽制判斷。",
      },
      {
        question: "這類頁面為什麼能帶流量？",
        answer: "它能承接新手搜尋意圖，並把使用者導到隊伍、球員與對位頁。",
      },
    ],
    sourceIds: ["fifa-worldcup"],
  },
  {
    slug: "why-wide-duels-matter",
    title: "為什麼世界盃邊路對位越來越重要",
    intent: "戰術 explainer",
    description: "用容易理解的方式說明邊鋒、邊後衛與半空間，為什麼會決定現代世界盃比賽內容。",
    heroTakeaway: "邊路不是只負責傳中，而是現代足球拉開防線、製造禁區觸球與創造錯位的核心入口。",
    tags: ["戰術", "邊路", "對位分析"],
    relatedTeamSlugs: ["france", "brazil", "spain", "japan"],
    relatedPlayerSlugs: ["kylian-mbappe", "vinicius-junior", "lamine-yamal", "kaoru-mitoma"],
    relatedMatchupSlugs: ["france-vs-brazil-wide-threats", "england-vs-spain-midfield-control"],
    sections: [
      {
        title: "邊路會迫使防線做選擇",
        body: "如果邊鋒有一對一能力，對手就要決定是否派第二名球員協防。一旦協防，禁區或中路就會露出新的空間。",
      },
      {
        title: "半空間是新手最容易忽略的區域",
        body: "很多真正危險的球不是從底線來，而是從邊路內側的半空間送進禁區。這也是 Yamal、Kubo 這類球員的重要性。",
      },
    ],
    faqs: [
      {
        question: "邊路強就一定比較強嗎？",
        answer: "不一定。邊路優勢必須轉成禁區觸球、射門或二次進攻，不然只是漂亮但沒有成果。",
      },
      {
        question: "這和下注有關嗎？",
        answer: "沒有。這是戰術理解，目的是幫使用者看懂比賽如何被某個位置改變。",
      },
    ],
    sourceIds: ["fifa-training", "statsbomb-open"],
  },
];
