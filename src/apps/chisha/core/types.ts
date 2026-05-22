export type ChishaDataStatus = "live" | "cached" | "missing-api-key" | "no-results" | "error" | "not-collected";

export interface ChishaReview {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativePublishTime?: string;
  publishTime?: string;
  sourceUrl?: string;
}

export interface ChishaPhoto {
  id: string;
  localUrl?: string;
  googlePhotoName?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: string[];
}

export interface ChishaPlace {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  googleMapsUri?: string;
  websiteUri?: string;
  phone?: string;
  primaryType?: string;
  categories: string[];
  rating?: number;
  userRatingCount?: number;
  distanceMeters?: number;
  latestReviewAt?: string;
  collectedAt: string;
  lastCheckedAt?: string;
  photos: ChishaPhoto[];
  reviews: ChishaReview[];
}

export interface ChishaStats {
  placeCount: number;
  reviewCount: number;
  photoCount: number;
  sourceCount: number;
  todayReviewCount: number;
  ratingBuckets: Record<"1" | "2" | "3" | "4" | "5", number>;
  activitySeries: number[];
}

export interface ChishaCrawlReport {
  generatedAt: string;
  status: ChishaDataStatus;
  area: string;
  queryCount: number;
  placeCount: number;
  reusedPlaceCount?: number;
  newPlaceCount?: number;
  refreshedPlaceCount?: number;
  changedPlaceCount?: number;
  searchRequestCount?: number;
  summaryRequestCount?: number;
  detailRequestCount?: number;
  photoDownloadRequestCount?: number;
  skippedByBudgetCount?: number;
  reviewCount: number;
  photoCount: number;
  warnings: string[];
  errors: string[];
}

export interface ChishaSiteData {
  generatedAt: string;
  status: ChishaDataStatus;
  area: {
    label: string;
    city: string;
    district: string;
    center: {
      lat: number;
      lng: number;
    };
    radiusMeters: number;
  };
  sources: string[];
  places: ChishaPlace[];
  stats: ChishaStats;
  crawlReport: ChishaCrawlReport;
}
