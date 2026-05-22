export type FreshnessSection = "price" | "worldcup" | "chisha" | "global";

export interface FreshnessProfile {
  section: FreshnessSection;
  title: string;
  summary: string;
  automation: string;
  liveSources: string[];
  curatedSources: string[];
  notYetAutomated: string[];
}

export const freshnessProfiles: Record<FreshnessSection, FreshnessProfile> = {
  price: {
    section: "price",
    title: "比價資料更新透明度",
    summary: "比價區會以 Google Trends 作為熱度排序訊號，再從台灣通路商品頁抓取可驗證價格。",
    automation: "GitHub Actions 每 6 小時重新執行 Google Trends、商品候選搜尋、價格抓取、build 與 GitHub Pages 部署。",
    liveSources: ["Google Trends Taiwan RSS：用於熱門搜尋與趨勢題材。", "momo、PChome、BigGo、Feebee：用於候選商品搜尋與商品頁價格解析。"],
    curatedSources: ["通路清單與類別意圖 seed：用於定義台灣使用者常見比價範圍，不直接作為價格。"],
    notYetAutomated: ["抓不到精準商品頁、缺貨、福利品、二手機或價格落差過大的來源不會納入比價區間。", "蝦皮等需要登入或頁面無法穩定解析的來源暫不作為有效價格。"],
  },
  worldcup: {
    section: "worldcup",
    title: "世界盃資料更新透明度",
    summary: "賽事分析區會跟著網站定時部署，但 MVP 階段內容主要是靜態 curated data。",
    automation: "GitHub Actions 每 6 小時重新 build 與部署頁面；目前尚未自動抓取 FIFA、Sofascore、FotMob 等來源內容。",
    liveSources: [],
    curatedSources: ["隊伍、球員、對位、圖表指標、長尾主題頁：目前為官方/公開資料基礎上的 curated static data。"],
    notYetAutomated: ["正式名單、fixture、傷病、場地、天氣與賽前即時狀態尚未接入自動資料 pipeline。"],
  },
  chisha: {
    section: "chisha",
    title: "吃啥資料更新透明度",
    summary: "吃啥會使用 Google Places API 取得臺中市西屯區店家、照片與 Google 回傳評論；沒有 API 資料時不以假資料填充。",
    automation: "吃啥有獨立 GitHub Actions cron，每天更新一次；設定 GOOGLE_MAPS_API_KEY 後會輸出 data/chisha/site.json 與 crawl report，並優先沿用已抓過的店家與照片快取。",
    liveSources: ["Google Places API：店家名稱、地址、評分、評論摘要與 Google Maps 連結。", "Google Places Photos API：店家照片會在 build 時下載為靜態圖片，不把 API key 暴露到前端。"],
    curatedSources: ["臺中市西屯區搜尋 seed 與熱門分類，用於決定搜尋範圍，不作為評論或店家資料。"],
    notYetAutomated: ["Threads、Apple Maps 與其他社群來源尚未接入；目前 Google Places API 回傳評論數量有限，不代表完整 Google Maps 評論庫。"],
  },
  global: {
    section: "global",
    title: "全站資料更新透明度",
    summary: "全站會定時重新部署；目前只有部分趨勢資料是 live 抓取，其餘內容需看各分區說明。",
    automation: "GitHub Actions 每 6 小時重新整理、build 與部署。",
    liveSources: ["Google Trends Taiwan RSS。", "比價區商品候選與價格來源會在 build 時重新抓取。"],
    curatedSources: ["比價類別意圖 seed、World Cup 隊伍/球員/對位分析資料。"],
    notYetAutomated: ["World Cup 即時賽程、正式名單、傷病與天氣尚未完全自動化。"],
  },
};
