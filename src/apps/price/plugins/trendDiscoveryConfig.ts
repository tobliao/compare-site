import type { CategoryId } from "../core/types";

export interface DiscoverySeed {
  query: string;
  requiredTerms: string[];
}

export interface CategoryDiscoveryConfig {
  categoryId: CategoryId;
  image: string;
  seeds: DiscoverySeed[];
  excludeTerms: string[];
  summaryTemplate: string;
  buyingAdvice: string;
  specs: Record<string, string>;
}

const commonExcluded = ["保護貼", "手機殼", "保護殼", "保護膜", "殼", "線材", "充電線", "筆電包", "防震包", "收納包", "展示機", "福利品", "二手", "中古", "租賃", "訂閱", "清潔組", "替換用"];

export const MIN_PRODUCTS_PER_CATEGORY = 20;

export const categoryDiscoveryConfigs: CategoryDiscoveryConfig[] = [
  {
    categoryId: "phones",
    image: "phones",
    seeds: [
      seed("iPhone 17 256G", ["iphone", "17"]),
      seed("iPhone 17 Pro 256G", ["iphone", "17", "pro"]),
      seed("iPhone 16 128G", ["iphone", "16"]),
      seed("iPhone 16 Pro 128G", ["iphone", "16", "pro"]),
      seed("Samsung S26 Ultra", ["samsung", "s26", "ultra"]),
      seed("Samsung S25 Ultra", ["samsung", "s25", "ultra"]),
      seed("Google Pixel 10 Pro", ["pixel", "10", "pro"]),
      seed("ASUS Zenfone", ["asus", "zenfone"]),
      seed("AirPods Pro", ["airpods", "pro"]),
      seed("Sony WH-1000XM6", ["sony", "1000xm"]),
      seed("Sony WF-1000XM5", ["sony", "1000xm"]),
      seed("MagSafe 行動電源", ["magsafe"]),
      seed("Anker 行動電源", ["anker"]),
      seed("Belkin MagSafe", ["belkin", "magsafe"]),
      seed("Apple Watch Series", ["apple", "watch"]),
      seed("iPad Air", ["ipad", "air"]),
      seed("iPad Pro", ["ipad", "pro"]),
      seed("Switch 2", ["switch"]),
      seed("PS5", ["ps5"]),
      seed("ROG Ally", ["rog", "ally"]),
      seed("MacBook Air M4", ["macbook", "air"]),
      seed("MacBook Pro M4", ["macbook", "pro"]),
    ],
    excludeTerms: ["清潔組", "耳機套", "保護套", "維修", ...commonExcluded],
    summaryTemplate: "由 Google Trends 熱度排序後，再從台灣通路商品頁驗證的 3C 熱門品項。",
    buyingAdvice: "高單價 3C 要確認是否為台灣公司貨、保固來源與活動回饋門檻。",
    specs: { 類型: "3C/手機", 重點: "商品頁價格與保固來源", 更新: "每 6 小時重新抓取" },
  },
  {
    categoryId: "summer",
    image: "summer",
    seeds: [
      seed("安耐曬 防曬", ["安耐曬"]),
      seed("理膚寶水 防曬", ["理膚寶水", "防曬"]),
      seed("Biore 防曬", ["biore", "防曬"]),
      seed("ALLIE 防曬", ["allie", "防曬"]),
      seed("Curél 防曬", ["curel", "防曬"]),
      seed("妮維雅 防曬", ["妮維雅", "防曬"]),
      seed("防曬噴霧", ["防曬", "噴霧"]),
      seed("兒童防曬", ["兒童", "防曬"]),
      seed("涼感床包", ["涼感", "床包"]),
      seed("涼感被", ["涼感", "被"]),
      seed("涼感枕套", ["涼感", "枕"]),
      seed("防曬外套", ["防曬", "外套"]),
      seed("抗 UV 外套", ["uv", "外套"]),
      seed("冰霸杯", ["杯"]),
      seed("隨身風扇", ["風扇"]),
      seed("手持風扇", ["風扇"]),
      seed("循環扇", ["循環扇"]),
      seed("除濕盒", ["除濕盒"]),
      seed("涼鞋", ["涼鞋"]),
      seed("冰絲衣", ["冰絲"]),
      seed("面膜 保濕", ["面膜"]),
      seed("曬後修護", ["曬後"]),
    ],
    excludeTerms: ["補充包", "空瓶", "試用包", ...commonExcluded],
    summaryTemplate: "由台灣熱門搜尋與季節需求篩出的夏季生活商品。",
    buyingAdvice: "夏季品類常有容量、尺寸或組合差異，建議換算單位價格後再比。",
    specs: { 類型: "夏季生活", 重點: "容量/尺寸/組合包", 更新: "每 6 小時重新抓取" },
  },
  {
    categoryId: "home-appliances",
    image: "home",
    seeds: [
      seed("Dyson V10", ["dyson", "v10"]),
      seed("Dyson V12", ["dyson", "v12"]),
      seed("Dyson V15", ["dyson", "v15"]),
      seed("Dyson Gen5", ["dyson", "gen5"]),
      seed("Roborock S8", ["roborock", "s8"]),
      seed("Roborock S9", ["roborock", "s9"]),
      seed("Dreame X50", ["dreame", "x50"]),
      seed("Dreame L40", ["dreame", "l40"]),
      seed("ECOVACS X8", ["ecovacs", "x8"]),
      seed("iRobot Roomba", ["roomba"]),
      seed("Tineco 洗地機", ["tineco"]),
      seed("追覓 洗地機", ["追覓"]),
      seed("Bissell 洗地機", ["bissell"]),
      seed("LG 除濕機", ["lg", "除濕"]),
      seed("Panasonic 除濕機", ["panasonic", "除濕"]),
      seed("日立 除濕機", ["日立", "除濕"]),
      seed("三菱 除濕機", ["三菱", "除濕"]),
      seed("Coway 空氣清淨機", ["coway"]),
      seed("Blueair 空氣清淨機", ["blueair"]),
      seed("小米 空氣清淨機", ["小米", "清淨"]),
      seed("BALMUDA 風扇", ["balmuda"]),
      seed("象印 電鍋", ["象印"]),
    ],
    excludeTerms: ["耗材", "濾網", "配件", "刷頭", "滾輪", "清潔劑", "電池", "充電器", "副廠", "適用", ...commonExcluded],
    summaryTemplate: "依 Google Trends 熱度排序並從台灣通路驗證的居家清潔家電。",
    buyingAdvice: "家電要把保固、耗材、維修據點與配送方式納入總成本。",
    specs: { 類型: "居家清潔家電", 重點: "型號與保固", 更新: "每 6 小時重新抓取" },
  },
  {
    categoryId: "health",
    image: "health",
    seeds: [
      seed("葉黃素", ["葉黃素"]),
      seed("魚油", ["魚油"]),
      seed("益生菌", ["益生菌"]),
      seed("維生素 D", ["維生素", "d"]),
      seed("B 群", ["b群"]),
      seed("膠原蛋白", ["膠原"]),
      seed("UC2", ["uc2"]),
      seed("葡萄糖胺", ["葡萄糖胺"]),
      seed("蔓越莓", ["蔓越莓"]),
      seed("鎂", ["鎂"]),
      seed("鋅", ["鋅"]),
      seed("鈣", ["鈣"]),
      seed("鐵", ["鐵"]),
      seed("瑪卡", ["瑪卡"]),
      seed("Q10", ["q10"]),
      seed("NMN", ["nmn"]),
      seed("肌酸", ["肌酸"]),
      seed("乳清蛋白", ["乳清"]),
      seed("電解質", ["電解質"]),
      seed("膳食纖維", ["纖維"]),
      seed("酵素", ["酵素"]),
      seed("蜂膠", ["蜂膠"]),
    ],
    excludeTerms: ["贈品", "試吃", "分裝", ...commonExcluded],
    summaryTemplate: "依搜尋熱度與通路商品頁驗證整理的保健回購品項。",
    buyingAdvice: "保健品要換算每日成本與有效成分，不只看瓶價。",
    specs: { 類型: "保健食品", 重點: "成分/劑量/每日成本", 更新: "每 6 小時重新抓取" },
  },
  {
    categoryId: "ip-goods",
    image: "ip",
    seeds: [
      seed("Labubu", ["labubu"]),
      seed("POP MART", ["pop", "mart"]),
      seed("吉伊卡哇", ["吉伊卡哇"]),
      seed("Chiikawa", ["chiikawa"]),
      seed("寶可夢 卡牌", ["寶可夢"]),
      seed("Pokemon 卡牌", ["pokemon"]),
      seed("排球少年 周邊", ["排球少年"]),
      seed("航海王 公仔", ["航海王"]),
      seed("One Piece 公仔", ["one", "piece"]),
      seed("鬼滅之刃 公仔", ["鬼滅"]),
      seed("咒術迴戰 公仔", ["咒術"]),
      seed("三麗鷗", ["三麗鷗"]),
      seed("Hello Kitty", ["hello", "kitty"]),
      seed("庫洛米", ["庫洛米"]),
      seed("迪士尼 公仔", ["迪士尼"]),
      seed("LEGO Icons", ["lego"]),
      seed("LEGO Star Wars", ["lego", "star"]),
      seed("鋼彈模型", ["鋼彈"]),
      seed("模型 公仔", ["公仔"]),
      seed("盲盒", ["盲盒"]),
      seed("黏土人", ["黏土人"]),
      seed("一番賞", ["一番賞"]),
    ],
    excludeTerms: ["貼紙", "手機殼", "保護套", "同人", "盜版", "娃衣", "不含娃娃", "痛包", "收納包", "吊飾包"],
    summaryTemplate: "以 Google Trends 話題度排序後，從通路頁驗證的 IP 熱潮商品。",
    buyingAdvice: "IP 商品要優先確認授權、版本、現貨/預購與是否有仿品風險。",
    specs: { 類型: "IP 周邊", 重點: "授權與版本", 更新: "每 6 小時重新抓取" },
  },
  {
    categoryId: "cross-border",
    image: "cross-border",
    seeds: [
      seed("日本 防曬", ["日本", "防曬"]),
      seed("日本 面膜", ["日本", "面膜"]),
      seed("日本 藥妝", ["日本"]),
      seed("韓國 面膜", ["韓國", "面膜"]),
      seed("韓國 保養品", ["韓國"]),
      seed("韓國 零食", ["韓國"]),
      seed("日本 零食", ["日本"]),
      seed("日本 洗髮精", ["日本"]),
      seed("日本 眼藥水", ["日本"]),
      seed("日本 酵素", ["日本"]),
      seed("韓國 泡麵", ["韓國"]),
      seed("韓國 洗髮精", ["韓國"]),
      seed("日本 代購 寶可夢", ["寶可夢"]),
      seed("日本 代購 吉伊卡哇", ["吉伊卡哇"]),
      seed("日本 LEGO", ["lego"]),
      seed("日本 Dyson", ["dyson"]),
      seed("美國 保健食品", ["保健"]),
      seed("澳洲 保健食品", ["保健"]),
      seed("歐洲 保養品", ["保養"]),
      seed("進口 收納", ["進口", "收納"]),
      seed("進口 露營", ["進口", "露營"]),
      seed("海外直送", ["海外"]),
    ],
    excludeTerms: ["代購教學", "運費說明", "空箱"],
    summaryTemplate: "以跨境平台相關熱度排序，整理可比價與需注意成本的跨境品項。",
    buyingAdvice: "跨境商品要拆出商品價、運費、稅費、代購費與退換貨風險。",
    specs: { 類型: "跨境/代購", 重點: "總成本與配送風險", 更新: "每 6 小時重新抓取" },
  },
];

export function getDiscoveryConfig(categoryId: CategoryId): CategoryDiscoveryConfig {
  const config = categoryDiscoveryConfigs.find((item) => item.categoryId === categoryId);

  if (!config) {
    throw new Error(`Missing discovery config for ${categoryId}`);
  }

  return config;
}

function seed(query: string, requiredTerms: string[]): DiscoverySeed {
  return {
    query,
    requiredTerms,
  };
}
