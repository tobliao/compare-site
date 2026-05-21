# Taiwan Price Radar

台灣靜態比價網站 MVP。這個專案用 Astro + TypeScript 建立，目標是用「Google Trends / 熱搜題材 / curated 商品 seed」先驗證 SEO、RWD 體驗與可插拔資料來源架構。

第一版沒有後台、沒有資料庫，也不需要使用者登入。資料會在 build-time 收集成靜態 JSON，前台只讀靜態資料並產生可被搜尋引擎索引的商品比價頁。

## 環境需求

- Node.js 20 或更新版本
- npm

可以先確認版本：

```bash
node -v
npm -v
```

## 安裝

第一次打開專案後，在專案根目錄執行：

```bash
npm install
```

## 怎麼跑

### 1. 收集 / 產生靜態資料

```bash
npm run collect
```

這個指令會執行 `scripts/collect.ts`，把 Google Trends Taiwan RSS 與 seed catalog 整理成：

```text
data/site.json
```

如果 Google Trends RSS 暫時失敗，程式會自動 fallback 到 curated seed trends，讓開發與 build 不會中斷。

### 2. 啟動開發伺服器

```bash
npm run dev
```

啟動後，終端機會顯示本機網址，通常是：

```text
http://localhost:4321
```

打開這個網址就可以看到首頁、熱搜入口、分類入口與商品比價頁。

### 3. 型別檢查

```bash
npm run check
```

這會執行：

```bash
astro sync && tsc --noEmit
```

用來檢查 Astro 型別與 TypeScript 型別是否正確。

### 4. 建立正式靜態網站

```bash
npm run build
```

這個指令會先執行 `npm run collect`，再執行 `astro build`。完成後會輸出靜態檔案到：

```text
dist/
```

`dist/` 可以部署到 GitHub Pages、Cloudflare Pages、Netlify、Vercel Static 或任何靜態網站主機。

### 5. 本機預覽正式 build

```bash
npm run preview
```

這會用 Astro 預覽 `dist/` 裡的正式 build 結果。

## 常用開發流程

日常開發可以照這個順序：

```bash
npm install
npm run collect
npm run dev
```

準備提交或部署前建議跑：

```bash
npm run check
npm run build
npm audit
```

## 自動更新與部署

GitHub Actions 會在兩種情況自動部署：

- 推送到 `main`
- 每 6 小時定時重新抓取 Google Trends Taiwan RSS，重新 build 並部署 GitHub Pages

部署 workflow 位於：

```text
.github/workflows/deploy.yml
```

正式部署時會設定：

```text
SITE_URL=https://tobliao.github.io
BASE_PATH=/compare-site
REQUIRE_LIVE_TRENDS=true
```

`REQUIRE_LIVE_TRENDS=true` 代表正式部署必須成功抓到即時 Google Trends 資料；如果 Google Trends 暫時無法取得，workflow 會失敗而不是靜默使用 fallback seed，方便及早發現資料更新問題。

## 專案架構

```text
.
├── scripts/
│   └── collect.ts
├── src/
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   │   ├── core/
│   │   └── plugins/
│   ├── pages/
│   │   ├── compare/[slug].astro
│   │   ├── data/site.json.ts
│   │   ├── index.astro
│   │   ├── robots.txt.ts
│   │   └── sitemap.xml.ts
│   └── styles/
├── public/
├── data/
└── dist/
```

重點檔案：

- `scripts/collect.ts`：build-time 資料收集器，執行 plugins 並產生 `data/site.json`。
- `src/lib/core/`：商品、價格、通路、趨勢、分類與 scoring helper。
- `src/lib/plugins/`：可插拔資料來源，目前包含 Google Trends Taiwan RSS 與 curated seed catalog。
- `src/pages/index.astro`：首頁，包含熱搜、分類與精選商品卡。
- `src/pages/compare/[slug].astro`：每個商品的靜態 SEO 比價頁。
- `src/pages/sitemap.xml.ts`：自動產生 sitemap。
- `src/pages/robots.txt.ts`：自動產生 robots.txt。
- `src/pages/data/site.json.ts`：提供前台可讀的靜態 JSON endpoint。

## 資料來源與注意事項

目前 MVP 使用 curated seed 價格，目的是先驗證 UX、SEO 與 plugin 架構，不代表正式價格資料。

正式上線時，商品價格建議優先使用：

- 授權資料 feed
- affiliate feed
- 公開 API
- 商家合作資料
- 合法且允許使用的公開資料

HTML scraping 應該作為最後手段，並且必須遵守來源網站的 robots.txt、使用條款與合理速率限制。

## SEO 內容

目前 build 會產生：

- 首頁：`/`
- 商品頁：`/compare/[slug]/`
- 靜態資料：`/data/site.json`
- sitemap：`/sitemap.xml`
- robots：`/robots.txt`

每個商品頁都有獨立 metadata 與 structured data，方便搜尋引擎理解商品與 offer 資訊。
