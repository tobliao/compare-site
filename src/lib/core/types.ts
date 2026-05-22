export type CategoryId =
  | "phones"
  | "summer"
  | "home-appliances"
  | "health"
  | "ip-goods"
  | "cross-border";

export type OfferBadge =
  | "lowest"
  | "free-shipping"
  | "fast-delivery"
  | "official"
  | "cross-border"
  | "coupon";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
}

export interface Store {
  id: string;
  name: string;
  kind: "marketplace" | "brand" | "retailer" | "comparison" | "cross-border";
  url: string;
}

export interface Offer {
  id: string;
  productSlug: string;
  storeId: string;
  title: string;
  price: number;
  currency: "TWD";
  url: string;
  fetchedAt: string;
  sourceName: string;
  sourceUrl: string;
  shippingLabel?: string;
  badges?: OfferBadge[];
}

export interface Product {
  slug: string;
  name: string;
  categoryId: CategoryId;
  summary: string;
  keywords: string[];
  image: string;
  specs: Record<string, string>;
  buyingAdvice: string;
}

export interface Trend {
  id: string;
  keyword: string;
  approxTraffic: string;
  sourceName: string;
  sourceUrl: string;
  observedAt: string;
  relatedProductSlugs: string[];
}

export interface Topic {
  slug: string;
  title: string;
  description: string;
  categoryIds: CategoryId[];
  productSlugs: string[];
  intent: string;
  audience: string;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export interface OfferSummary {
  bestOffer?: Offer;
  highestOffer?: Offer;
  officialOffer?: Offer;
  crossBorderOffers: Offer[];
  spread: number;
  storeCount: number;
}

export interface ProductDecision {
  verdict: string;
  bestFor: string[];
  notBestFor: string[];
  channelTip: string;
}

export interface PriceTrendPoint {
  label: string;
  price: number;
}

export interface ProductPageData {
  product: Product;
  category: Category;
  offers: Offer[];
  bestOffer?: Offer;
  relatedTrends: Trend[];
}

export interface SiteData {
  generatedAt: string;
  categories: Category[];
  stores: Store[];
  products: Product[];
  offers: Offer[];
  trends: Trend[];
}

export interface DataPlugin<T> {
  id: string;
  collect(): Promise<T[]>;
}
