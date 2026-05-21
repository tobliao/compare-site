import type { Category, CategoryId, Offer, Product, ProductPageData, SiteData, Store, Trend } from "./types";

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
