import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { chishaArea, chishaPopularCategories, chishaSearchSeeds } from "@chisha/data/xitunFeed";
import type { ChishaDataStatus, ChishaPhoto, ChishaPlace, ChishaReview, ChishaSiteData } from "@chisha/core/types";

const outputPath = resolve("data/chisha/site.json");
const crawlReportPath = resolve("data/chisha/crawl-report.json");
const photoOutputDir = resolve("public/chisha/photos");
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const requireLiveData = process.env.REQUIRE_CHISHA_LIVE_DATA === "true";
const targetPlaces = readIntEnv("CHISHA_TARGET_PLACES", process.env.CHISHA_MAX_PLACES ?? "24");
const maxNewPlacesPerRun = readIntEnv("CHISHA_MAX_NEW_PLACES_PER_RUN", "4");
const maxPhotosPerPlace = readIntEnv("CHISHA_MAX_PHOTOS_PER_PLACE", "1");
const maxSearchResultsPerQuery = readIntEnv("CHISHA_SEARCH_RESULTS_PER_QUERY", "10");
const maxSearchRequestsPerRun = readIntEnv("CHISHA_MAX_SEARCH_REQUESTS_PER_RUN", String(chishaSearchSeeds.length));
const maxPlaceDetailRequestsPerRun = readIntEnv("CHISHA_MAX_PLACE_DETAILS_PER_RUN", String(maxNewPlacesPerRun));
const maxExistingRefreshesPerRun = readIntEnv("CHISHA_MAX_EXISTING_REFRESHES_PER_RUN", "4");
const maxChangedPlaceDetailsPerRun = readIntEnv("CHISHA_MAX_CHANGED_PLACE_DETAILS_PER_RUN", "2");
const maxPhotoDownloadRequestsPerRun = readIntEnv("CHISHA_MAX_PHOTO_DOWNLOADS_PER_RUN", "2");
const refreshExistingAfterDays = readIntEnv("CHISHA_REFRESH_EXISTING_AFTER_DAYS", "7");
const forceRefreshExisting = process.env.CHISHA_FORCE_REFRESH_EXISTING === "true";
const placesBaseUrl = "https://places.googleapis.com/v1";

interface GoogleTextSearchResponse {
  places?: GooglePlace[];
}

interface GooglePlace {
  id?: string;
  name?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  types?: string[];
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  photos?: GooglePhoto[];
  reviews?: GoogleReview[];
}

interface GooglePlaceSummary {
  id?: string;
  rating?: number;
  userRatingCount?: number;
}

interface GooglePhoto {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{
    displayName?: string;
  }>;
  photo_reference?: string;
  html_attributions?: string[];
}

interface GoogleReview {
  name?: string;
  rating?: number;
  text?: {
    text?: string;
  };
  originalText?: {
    text?: string;
  };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

interface CollectionResult {
  status: ChishaDataStatus;
  places: ChishaPlace[];
  warnings: string[];
  errors: string[];
  queryCount: number;
  reusedPlaceCount: number;
  newPlaceCount: number;
  refreshedPlaceCount: number;
  changedPlaceCount: number;
  searchRequestCount: number;
  summaryRequestCount: number;
  detailRequestCount: number;
  photoDownloadRequestCount: number;
  skippedByBudgetCount: number;
}

interface RunBudget {
  searchRequests: number;
  summaryRequests: number;
  detailRequests: number;
  changedPlaceDetails: number;
  photoDownloadRequests: number;
  skippedByBudget: number;
  refreshedPlaces: number;
  changedPlaces: number;
}

async function collectChishaData(): Promise<ChishaSiteData> {
  const generatedAt = new Date().toISOString();
  const existingData = await readExistingChishaData();
  const result = await collectPlaces(generatedAt, existingData);
  const stats = buildStats(result.places, generatedAt);

  return {
    generatedAt,
    status: result.status,
    area: chishaArea,
    sources: result.places.length > 0 ? ["Google Places API", "Google Places Photos API"] : [],
    places: result.places,
    stats,
    crawlReport: {
      generatedAt,
      status: result.status,
      area: chishaArea.label,
      queryCount: result.queryCount,
      placeCount: result.places.length,
      reusedPlaceCount: result.reusedPlaceCount,
      newPlaceCount: result.newPlaceCount,
      refreshedPlaceCount: result.refreshedPlaceCount,
      changedPlaceCount: result.changedPlaceCount,
      searchRequestCount: result.searchRequestCount,
      summaryRequestCount: result.summaryRequestCount,
      detailRequestCount: result.detailRequestCount,
      photoDownloadRequestCount: result.photoDownloadRequestCount,
      skippedByBudgetCount: result.skippedByBudgetCount,
      reviewCount: stats.reviewCount,
      photoCount: stats.photoCount,
      warnings: result.warnings,
      errors: result.errors,
    },
  };
}

async function readExistingChishaData(): Promise<ChishaSiteData | undefined> {
  try {
    const raw = await readFile(outputPath, "utf-8");
    return JSON.parse(raw) as ChishaSiteData;
  } catch {
    return undefined;
  }
}

async function collectPlaces(generatedAt: string, existingData: ChishaSiteData | undefined): Promise<CollectionResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const existingPlaces = existingData?.places ?? [];
  const places = existingPlaces.slice(0, targetPlaces);
  const existingByPlaceId = new Map(existingPlaces.map((place) => [place.googlePlaceId, place]));
  const seen = new Set(places.map((place) => place.googlePlaceId));
  const budget = createRunBudget();
  let queryCount = 0;
  let newPlaceCount = 0;

  if (!apiKey) {
    warnings.push("GOOGLE_MAPS_API_KEY is not configured; live Google Places data was not collected.");

    if (places.length > 0) {
      warnings.push("Existing cached Chisha Places data was reused without refreshing Google APIs.");
    }

    return {
      status: "missing-api-key",
      places,
      warnings,
      errors,
      queryCount,
      reusedPlaceCount: places.length,
      newPlaceCount,
      ...budgetResult(budget),
    };
  }

  await mkdir(photoOutputDir, { recursive: true });
  await backfillCachedPhotoFiles(places, budget, warnings);

  if (places.length >= targetPlaces) {
    const refreshedPlaces = await refreshExistingPlaces(places, generatedAt, budget, warnings, errors);

    if (refreshedPlaces === 0) {
      warnings.push(`Reused ${places.length} cached places and skipped Google Places search because the ${targetPlaces}-place target is already met.`);
    }

    return {
      status: errors.length > 0 ? "error" : budget.changedPlaces > 0 ? "live" : "cached",
      places,
      warnings,
      errors,
      queryCount,
      reusedPlaceCount: places.length,
      newPlaceCount,
      ...budgetResult(budget),
    };
  }

  for (const query of chishaSearchSeeds) {
    if (
      places.length >= targetPlaces ||
      newPlaceCount >= maxNewPlacesPerRun ||
      budget.searchRequests >= maxSearchRequestsPerRun ||
      budget.detailRequests >= maxPlaceDetailRequestsPerRun
    ) {
      break;
    }

    try {
      budget.searchRequests += 1;
      const searchResult = await searchPlaces(query);
      queryCount += 1;
      const candidates = searchResult.places ?? [];

      for (const candidate of candidates) {
        const placeId = candidate.id;

        if (!placeId || seen.has(placeId) || places.length >= targetPlaces || newPlaceCount >= maxNewPlacesPerRun) {
          continue;
        }

        seen.add(placeId);
        const cachedPlace = existingByPlaceId.get(placeId);

        if (cachedPlace) {
          places.push(cachedPlace);
          continue;
        }

        if (budget.detailRequests >= maxPlaceDetailRequestsPerRun) {
          budget.skippedByBudget += 1;
          break;
        }

        budget.detailRequests += 1;
        const detail = await getPlaceDetails(placeId);
        const normalized = await normalizePlace(detail, generatedAt, undefined, budget);

        if (normalized) {
          places.push(normalized);
          newPlaceCount += 1;
        }
      }
    } catch (error) {
      errors.push(`${query}: ${formatError(error)}`);
    }

    if (
      places.length >= targetPlaces ||
      newPlaceCount >= maxNewPlacesPerRun ||
      budget.searchRequests >= maxSearchRequestsPerRun ||
      budget.detailRequests >= maxPlaceDetailRequestsPerRun
    ) {
      break;
    }
  }

  if (budget.searchRequests >= maxSearchRequestsPerRun && places.length < targetPlaces && newPlaceCount < maxNewPlacesPerRun) {
    warnings.push(`Stopped Google Places search after ${budget.searchRequests}/${maxSearchRequestsPerRun} budgeted search requests.`);
  }

  if (budget.detailRequests >= maxPlaceDetailRequestsPerRun && places.length < targetPlaces && newPlaceCount < maxNewPlacesPerRun) {
    warnings.push(`Stopped full place detail calls after ${budget.detailRequests}/${maxPlaceDetailRequestsPerRun} budgeted requests.`);
  }

  if (places.length < targetPlaces) {
    warnings.push(`Collected ${places.length}/${targetPlaces} target places; future daily refreshes will keep looking for additional unique places.`);
  }

  if (newPlaceCount === 0 && places.length > 0) {
    warnings.push("No new places were added in this run; cached real Places data was reused.");
  }

  if (places.length === 0) {
    warnings.push("Google Places collection completed but returned no usable places.");
    return {
      status: "no-results",
      places: [],
      warnings,
      errors,
      queryCount,
      reusedPlaceCount: 0,
      newPlaceCount,
      ...budgetResult(budget),
    };
  }

  return {
    status: errors.length > 0 ? "error" : newPlaceCount > 0 || budget.changedPlaces > 0 ? "live" : "cached",
    places,
    warnings,
    errors,
    queryCount,
    reusedPlaceCount: Math.min(existingPlaces.length, places.length - newPlaceCount),
    newPlaceCount,
    ...budgetResult(budget),
  };
}

function createRunBudget(): RunBudget {
  return {
    searchRequests: 0,
    summaryRequests: 0,
    detailRequests: 0,
    changedPlaceDetails: 0,
    photoDownloadRequests: 0,
    skippedByBudget: 0,
    refreshedPlaces: 0,
    changedPlaces: 0,
  };
}

function budgetResult(budget: RunBudget): Pick<
  CollectionResult,
  | "refreshedPlaceCount"
  | "changedPlaceCount"
  | "searchRequestCount"
  | "summaryRequestCount"
  | "detailRequestCount"
  | "photoDownloadRequestCount"
  | "skippedByBudgetCount"
> {
  return {
    refreshedPlaceCount: budget.refreshedPlaces,
    changedPlaceCount: budget.changedPlaces,
    searchRequestCount: budget.searchRequests,
    summaryRequestCount: budget.summaryRequests,
    detailRequestCount: budget.detailRequests,
    photoDownloadRequestCount: budget.photoDownloadRequests,
    skippedByBudgetCount: budget.skippedByBudget,
  };
}

async function refreshExistingPlaces(
  places: ChishaPlace[],
  generatedAt: string,
  budget: RunBudget,
  warnings: string[],
  errors: string[],
): Promise<number> {
  const candidates = places
    .map((place, index) => ({ place, index }))
    .filter(({ place }) => shouldRefreshPlace(place, generatedAt))
    .sort((left, right) => lastCheckedTime(left.place) - lastCheckedTime(right.place));

  if (candidates.length === 0) {
    return 0;
  }

  for (const { place, index } of candidates) {
    if (budget.summaryRequests >= maxExistingRefreshesPerRun) {
      budget.skippedByBudget += candidates.length - budget.refreshedPlaces;
      warnings.push(
        `Deferred ${candidates.length - budget.refreshedPlaces} existing-place checks because CHISHA_MAX_EXISTING_REFRESHES_PER_RUN=${maxExistingRefreshesPerRun}.`,
      );
      break;
    }

    try {
      budget.summaryRequests += 1;
      const summary = await getPlaceSummary(place.googlePlaceId);
      budget.refreshedPlaces += 1;

      if (!placeSummaryChanged(place, summary)) {
        places[index] = {
          ...place,
          lastCheckedAt: generatedAt,
        };
        continue;
      }

      if (budget.detailRequests >= maxPlaceDetailRequestsPerRun || budget.changedPlaceDetails >= maxChangedPlaceDetailsPerRun) {
        budget.skippedByBudget += 1;
        places[index] = applyPlaceSummary(place, summary, generatedAt);
        warnings.push(`${place.name}: rating/review count changed, but full review refresh was deferred by the per-run detail budget.`);
        continue;
      }

      budget.detailRequests += 1;
      budget.changedPlaceDetails += 1;
      const detail = await getPlaceDetails(place.googlePlaceId);
      const normalized = await normalizePlace(detail, generatedAt, place, budget);

      if (normalized) {
        places[index] = normalized;
        budget.changedPlaces += 1;
      } else {
        places[index] = applyPlaceSummary(place, summary, generatedAt);
      }
    } catch (error) {
      errors.push(`${place.name}: ${formatError(error)}`);
    }
  }

  return budget.refreshedPlaces;
}

async function backfillCachedPhotoFiles(places: ChishaPlace[], budget: RunBudget, warnings: string[]): Promise<void> {
  for (const place of places) {
    if (budget.photoDownloadRequests >= maxPhotoDownloadRequestsPerRun) {
      return;
    }

    for (const photo of place.photos) {
      if (budget.photoDownloadRequests >= maxPhotoDownloadRequestsPerRun) {
        return;
      }

      if (!photo.googlePhotoName || (photo.localUrl && await localPhotoExists(photo.localUrl))) {
        continue;
      }

      budget.photoDownloadRequests += 1;
      const localUrl = await downloadPhoto(photo.googlePhotoName, photo.id);

      if (localUrl) {
        photo.localUrl = localUrl;
      } else {
        warnings.push(`${place.name}: cached Google photo ${photo.id} could not be restored this run.`);
      }
    }
  }
}

async function searchPlaces(query: string): Promise<GoogleTextSearchResponse> {
  return fetchJson<GoogleTextSearchResponse>(`${placesBaseUrl}/places:searchText`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey ?? "",
      "x-goog-fieldmask": "places.id",
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "zh-TW",
      regionCode: "TW",
      maxResultCount: maxSearchResultsPerQuery,
      locationBias: {
        circle: {
          center: {
            latitude: chishaArea.center.lat,
            longitude: chishaArea.center.lng,
          },
          radius: chishaArea.radiusMeters,
        },
      },
    }),
  });
}

async function getPlaceDetails(placeId: string): Promise<GooglePlace> {
  const encodedPlaceId = encodeURIComponent(placeId);

  return fetchJson<GooglePlace>(`${placesBaseUrl}/places/${encodedPlaceId}?languageCode=zh-TW&regionCode=TW`, {
    headers: {
      "x-goog-api-key": apiKey ?? "",
      "x-goog-fieldmask": [
        "id",
        "name",
        "displayName",
        "formattedAddress",
        "location",
        "rating",
        "userRatingCount",
        "primaryType",
        "types",
        "googleMapsUri",
        "websiteUri",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "photos",
        "reviews",
      ].join(","),
    },
  });
}

async function getPlaceSummary(placeId: string): Promise<GooglePlaceSummary> {
  const encodedPlaceId = encodeURIComponent(placeId);

  return fetchJson<GooglePlaceSummary>(`${placesBaseUrl}/places/${encodedPlaceId}?languageCode=zh-TW&regionCode=TW`, {
    headers: {
      "x-goog-api-key": apiKey ?? "",
      "x-goog-fieldmask": [
        "id",
        "rating",
        "userRatingCount",
      ].join(","),
    },
  });
}

async function normalizePlace(
  place: GooglePlace,
  collectedAt: string,
  existingPlace: ChishaPlace | undefined,
  budget: RunBudget,
): Promise<ChishaPlace | undefined> {
  const googlePlaceId = place.id;
  const name = place.displayName?.text;

  if (!googlePlaceId || !name) {
    return undefined;
  }

  const photos = await normalizePhotos(googlePlaceId, place.photos ?? [], existingPlace, budget);
  const reviews = normalizeReviews(place.reviews ?? [], googlePlaceId);
  const distanceMeters = place.location?.latitude && place.location.longitude
    ? Math.round(distanceBetween(chishaArea.center.lat, chishaArea.center.lng, place.location.latitude, place.location.longitude))
    : undefined;

  return {
    id: slugify(`${name}-${googlePlaceId}`),
    googlePlaceId,
    name,
    address: place.formattedAddress ?? "地址待 Google Places 回傳",
    googleMapsUri: place.googleMapsUri,
    websiteUri: place.websiteUri,
    phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber,
    primaryType: place.primaryType,
    categories: inferCategories(place.types ?? [], name),
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    distanceMeters,
    latestReviewAt: latestReviewTime(reviews) ?? existingPlace?.latestReviewAt,
    collectedAt,
    lastCheckedAt: collectedAt,
    photos,
    reviews: reviews.length > 0 ? reviews : existingPlace?.reviews ?? [],
  };
}

async function normalizePhotos(
  placeId: string,
  photos: GooglePhoto[],
  existingPlace: ChishaPlace | undefined,
  budget: RunBudget,
): Promise<ChishaPhoto[]> {
  const existingPhotos = existingPlace?.photos ?? [];

  if (maxPhotosPerPlace <= 0) {
    return existingPhotos;
  }

  const normalized: ChishaPhoto[] = [];
  const existingByGoogleName = new Map(existingPhotos.filter((photo) => photo.googlePhotoName).map((photo) => [photo.googlePhotoName, photo]));
  const selectedPhotos = photos.filter((photo) => photo.name).slice(0, maxPhotosPerPlace);

  if (selectedPhotos.length === 0) {
    return existingPhotos.slice(0, maxPhotosPerPlace);
  }

  for (const [index, photo] of selectedPhotos.entries()) {
    const googlePhotoName = photo.name;
    const existingPhoto = googlePhotoName ? existingByGoogleName.get(googlePhotoName) : undefined;
    const id = existingPhoto?.id ?? `${slugify(placeId)}-${index + 1}`;
    let localUrl = existingPhoto?.localUrl;

    if (!localUrl && googlePhotoName && budget.photoDownloadRequests < maxPhotoDownloadRequestsPerRun) {
      budget.photoDownloadRequests += 1;
      localUrl = await downloadPhoto(googlePhotoName, id);
    } else if (!localUrl && googlePhotoName) {
      budget.skippedByBudget += 1;
    }

    normalized.push({
      id,
      localUrl,
      googlePhotoName,
      widthPx: photo.widthPx ?? existingPhoto?.widthPx,
      heightPx: photo.heightPx ?? existingPhoto?.heightPx,
      authorAttributions: photo.authorAttributions
        ?.map((item) => item.displayName)
        .filter((value): value is string => Boolean(value)) ?? existingPhoto?.authorAttributions,
    });
  }

  return normalized;
}

async function downloadPhoto(photoName: string, id: string): Promise<string | undefined> {
  if (!apiKey) {
    return undefined;
  }

  const mediaUrl = `${placesBaseUrl}/${photoName}/media?maxWidthPx=900&key=${encodeURIComponent(apiKey)}`;
  const response = await fetchWithTimeout(mediaUrl, { redirect: "follow" }, 10000);

  if (!response.ok) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const extension = extensionFromContentType(contentType);
  const fileName = `${id}${extension}`;
  const filePath = resolve(photoOutputDir, fileName);
  const buffer = Buffer.from(await response.arrayBuffer());

  await writeFile(filePath, buffer);

  return `/chisha/photos/${fileName}`;
}

function normalizeReviews(reviews: GoogleReview[], placeId: string): ChishaReview[] {
  return reviews
    .filter((review) => typeof review.rating === "number")
    .map((review, index) => ({
      id: slugify(review.name ?? `${placeId}-review-${index + 1}`),
      authorName: review.authorAttribution?.displayName ?? "Google Maps 使用者",
      authorPhotoUrl: review.authorAttribution?.photoUri,
      rating: Math.round(review.rating ?? 0),
      text: review.text?.text ?? review.originalText?.text ?? "此評論沒有文字內容。",
      relativePublishTime: review.relativePublishTimeDescription,
      publishTime: review.publishTime,
      sourceUrl: review.authorAttribution?.uri,
    }));
}

function shouldRefreshPlace(place: ChishaPlace, generatedAt: string): boolean {
  if (maxExistingRefreshesPerRun <= 0) {
    return false;
  }

  if (forceRefreshExisting) {
    return true;
  }

  return daysBetween(lastCheckedDate(place), new Date(generatedAt)) >= refreshExistingAfterDays;
}

function lastCheckedTime(place: ChishaPlace): number {
  return lastCheckedDate(place).getTime();
}

function lastCheckedDate(place: ChishaPlace): Date {
  const value = place.lastCheckedAt ?? place.collectedAt;
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function daysBetween(earlier: Date, later: Date): number {
  return Math.floor((startOfTaipeiDay(later).getTime() - startOfTaipeiDay(earlier).getTime()) / 86_400_000);
}

function placeSummaryChanged(place: ChishaPlace, summary: GooglePlaceSummary): boolean {
  const ratingChanged = typeof summary.rating === "number" && summary.rating !== place.rating;
  const reviewCountChanged = typeof summary.userRatingCount === "number" && summary.userRatingCount !== place.userRatingCount;

  return ratingChanged || reviewCountChanged;
}

function applyPlaceSummary(place: ChishaPlace, summary: GooglePlaceSummary, checkedAt: string): ChishaPlace {
  return {
    ...place,
    rating: typeof summary.rating === "number" ? summary.rating : place.rating,
    userRatingCount: typeof summary.userRatingCount === "number" ? summary.userRatingCount : place.userRatingCount,
    lastCheckedAt: checkedAt,
  };
}

async function localPhotoExists(localUrl: string): Promise<boolean> {
  const photoPath = resolve("public", localUrl.replace(/^\/+/, "").replace(/^compare-site\//, ""));

  try {
    await access(photoPath);
    return true;
  } catch {
    return false;
  }
}

function buildStats(places: ChishaPlace[], generatedAt: string): ChishaSiteData["stats"] {
  const reviews = places.flatMap((place) => place.reviews);
  const ratingBuckets = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  for (const review of reviews) {
    const key = String(Math.min(5, Math.max(1, Math.round(review.rating)))) as keyof typeof ratingBuckets;
    ratingBuckets[key] += 1;
  }

  return {
    placeCount: places.length,
    reviewCount: reviews.length,
    photoCount: places.reduce((sum, place) => sum + place.photos.filter((photo) => photo.localUrl).length, 0),
    sourceCount: places.length > 0 ? 1 : 0,
    todayReviewCount: reviews.filter((review) => isSameTaipeiDate(review.publishTime, generatedAt)).length,
    ratingBuckets,
    activitySeries: buildActivitySeries(reviews, generatedAt),
  };
}

function buildActivitySeries(reviews: ChishaReview[], generatedAt: string): number[] {
  const anchor = new Date(generatedAt);
  const buckets = Array.from({ length: 7 }, () => 0);

  for (const review of reviews) {
    if (!review.publishTime) {
      continue;
    }

    const published = new Date(review.publishTime);
    const diffDays = Math.floor((startOfTaipeiDay(anchor).getTime() - startOfTaipeiDay(published).getTime()) / 86_400_000);

    if (diffDays >= 0 && diffDays < buckets.length) {
      buckets[buckets.length - 1 - diffDays] += 1;
    }
  }

  return buckets;
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(url, init, 10000);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 180)}` : ""}`);
  }

  return response.json() as Promise<T>;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function inferCategories(types: string[], name: string): string[] {
  const values = new Set<string>();
  const normalizedName = name.toLowerCase();

  for (const category of chishaPopularCategories) {
    if (name.includes(category.replace("廳", ""))) {
      values.add(category);
    }
  }

  if (types.some((type) => type.includes("cafe")) || normalizedName.includes("coffee")) {
    values.add("咖啡廳");
  }

  if (types.some((type) => type.includes("bakery"))) {
    values.add("甜點");
  }

  if (types.some((type) => type.includes("restaurant"))) {
    values.add("餐廳");
  }

  return values.size > 0 ? [...values] : ["餐廳"];
}

function latestReviewTime(reviews: ChishaReview[]): string | undefined {
  return reviews
    .map((review) => review.publishTime)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

function isSameTaipeiDate(value: string | undefined, generatedAt: string): boolean {
  if (!value) {
    return false;
  }

  return formatTaipeiDate(new Date(value)) === formatTaipeiDate(new Date(generatedAt));
}

function formatTaipeiDate(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function startOfTaipeiDay(value: Date): Date {
  return new Date(`${formatTaipeiDate(value)}T00:00:00+08:00`);
}

function distanceBetween(latA: number, lngA: number, latB: number, lngB: number): number {
  const earthRadiusMeters = 6_371_000;
  const phiA = toRadians(latA);
  const phiB = toRadians(latB);
  const deltaPhi = toRadians(latB - latA);
  const deltaLambda = toRadians(lngB - lngA);
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phiA) * Math.cos(phiB) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function slugify(value: string): string {
  const ascii = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-")
    .slice(0, 72);

  return ascii || `place-${hashString(value)}`;
}

function hashString(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function extensionFromContentType(contentType: string): string {
  if (contentType.includes("png")) {
    return ".png";
  }

  if (contentType.includes("webp")) {
    return ".webp";
  }

  if (contentType.includes("gif")) {
    return ".gif";
  }

  const extension = extname(contentType);
  return extension || ".jpg";
}

function readIntEnv(name: string, fallback: string): number {
  const rawValue = process.env[name] ?? fallback;
  const parsed = Number.parseInt(rawValue, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const siteData = await collectChishaData();

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(siteData, null, 2)}\n`);
await writeFile(crawlReportPath, `${JSON.stringify(siteData.crawlReport, null, 2)}\n`);

console.log(
  `Collected Chisha data: ${siteData.places.length} places, ${siteData.stats.reviewCount} reviews, ${siteData.stats.photoCount} photos (${siteData.status}).`,
);

if (siteData.crawlReport.warnings.length > 0) {
  for (const warning of siteData.crawlReport.warnings) {
    console.warn(`Chisha warning: ${warning}`);
  }
}

if (siteData.crawlReport.errors.length > 0) {
  for (const error of siteData.crawlReport.errors) {
    console.error(`Chisha error: ${error}`);
  }
}

if (requireLiveData && siteData.places.length === 0) {
  throw new Error(
    `Chisha live data collection returned no Google Places results. Report written to ${crawlReportPath}; status=${siteData.status}; errors=${siteData.crawlReport.errors.length}.`,
  );
}
