import type {
  Category,
  CategoryId,
  Offer,
  OfferSummary,
  Product,
  ProductDecision,
  ProductPageData,
  SiteData,
  Store,
  Topic,
  Trend,
} from "./types";

export const categories: Category[] = [
  {
    id: "phones",
    name: "手機與 3C",
    description: "高單價、高搜尋量的換機與配件比價入口。",
  },
  {
    id: "summer",
    name: "夏季生活",
    description: "防曬、涼感寢具與夏季機能服飾的季節性熱搜。",
  },
  {
    id: "home-appliances",
    name: "居家清潔家電",
    description: "掃拖機器人、洗地機、除濕機等規格導向商品。",
  },
  {
    id: "health",
    name: "保健回購",
    description: "葉黃素、益生菌等適合用單位價格比較的長尾品類。",
  },
  {
    id: "ip-goods",
    name: "IP 熱潮",
    description: "吉伊卡哇、Labubu 等話題商品，適合內容流量與真假貨提醒。",
  },
  {
    id: "cross-border",
    name: "跨境平台",
    description: "iHerb、Mercari、1688 等平台攻略與價格觀察。",
  },
];

export function getCategory(categoryId: CategoryId): Category {
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }

  return category;
}

export function getStore(stores: Store[], storeId: string): Store | undefined {
  return stores.find((store) => store.id === storeId);
}

export function getBestOffer(offers: Offer[]): Offer | undefined {
  return [...offers].sort((a, b) => a.price - b.price)[0];
}

export function getHighestOffer(offers: Offer[]): Offer | undefined {
  return [...offers].sort((a, b) => b.price - a.price)[0];
}

export function getDiscountSpread(offers: Offer[]): number {
  if (offers.length < 2) {
    return 0;
  }

  const prices = offers.map((offer) => offer.price);
  return Math.max(...prices) - Math.min(...prices);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatUpdatedDate(value: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function getUpdateLabel(value: string): string {
  return `每日更新 - 最後更新 ${formatUpdatedDate(value)}`;
}

export function getOfferSummary(offers: Offer[]): OfferSummary {
  const bestOffer = getBestOffer(offers);
  const highestOffer = getHighestOffer(offers);
  const officialOffer = offers.find((offer) => offer.badges?.includes("official"));
  const crossBorderOffers = offers.filter((offer) => offer.badges?.includes("cross-border"));

  return {
    bestOffer,
    highestOffer,
    officialOffer,
    crossBorderOffers,
    spread: getDiscountSpread(offers),
    storeCount: new Set(offers.map((offer) => offer.storeId)).size,
  };
}

export function getProductDecision(product: Product, offers: Offer[], stores: Store[]): ProductDecision {
  const summary = getOfferSummary(offers);
  const bestStore = summary.bestOffer ? getStore(stores, summary.bestOffer.storeId) : undefined;
  const officialStore = summary.officialOffer ? getStore(stores, summary.officialOffer.storeId) : undefined;
  const spreadText = summary.spread > 0 ? `，與最高價差 ${formatPrice(summary.spread)}` : "";
  const category = getCategory(product.categoryId);

  return {
    verdict: summary.bestOffer
      ? `目前最低價在 ${bestStore?.name ?? summary.bestOffer.storeId}，價格 ${formatPrice(summary.bestOffer.price)}${spreadText}。`
      : "目前尚無可比較價格，建議稍後再回來查看。",
    bestFor: [`想快速比較${category.name}價格的人`, "希望先看最低價與通路差異的人", product.specs["場景"] ?? product.specs["族群"] ?? "正在評估是否入手的人"],
    notBestFor: [
      summary.officialOffer ? "只接受實體門市現場服務的人" : "只想購買官方通路的人",
      summary.crossBorderOffers.length > 0 ? "不想處理跨境運費或報關的人" : "需要即時到貨且無法等待的人",
    ],
    channelTip: summary.officialOffer
      ? `重視官方/授權與保固可優先看 ${officialStore?.name ?? summary.officialOffer.storeId}；只看價格則先看最低價通路。`
      : "目前沒有官方通路標記，建議點進來源頁確認保固、庫存與活動條件。",
  };
}

export function getProductsByTopic(siteData: SiteData, topic: Topic): Product[] {
  const productSet = new Set(topic.productSlugs);

  return siteData.products.filter((product) => productSet.has(product.slug) || topic.categoryIds.includes(product.categoryId));
}

export function trafficToNumber(traffic: string): number {
  const normalized = traffic.replaceAll(",", "").trim().toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(k)?\+?$/);

  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  return match[2] === "k" ? value * 1000 : value;
}

export function scoreTrend(trend: Trend): number {
  const trafficScore = Math.min(trafficToNumber(trend.approxTraffic) / 1000, 10);
  const relevanceScore = trend.relatedProductSlugs.length * 2;
  return Math.round((trafficScore + relevanceScore) * 10) / 10;
}

export function buildProductPageData(siteData: SiteData, product: Product): ProductPageData {
  const offers = siteData.offers.filter((offer) => offer.productSlug === product.slug);
  const relatedTrends = siteData.trends.filter((trend) => trend.relatedProductSlugs.includes(product.slug));

  return {
    product,
    category: getCategory(product.categoryId),
    offers,
    bestOffer: getBestOffer(offers),
    relatedTrends,
  };
}
