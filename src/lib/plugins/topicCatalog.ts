import type { Topic } from "../core/types";

export const topics: Topic[] = [
  {
    slug: "summer-sunscreen",
    title: "夏季防曬與涼感商品比價",
    description: "整理防曬乳、防曬外套、涼感床包與涼被，適合夏天出門、通勤與換季寢具採買。",
    categoryIds: ["summer"],
    productSlugs: ["face-sunscreen", "body-sunscreen", "uv-jacket", "cooling-bed-sheet", "cooling-blanket"],
    intent: "夏季防曬、涼感寢具與戶外機能商品推薦",
    audience: "想一次比較防曬與涼感商品的人",
    faq: [
      {
        question: "防曬商品比價要看什麼？",
        answer: "防曬乳建議看每 ml 價格、SPF/PA 標示、膚質與是否防水；防曬外套則要看 UPF、透氣性與尺寸退換貨。",
      },
      {
        question: "涼感寢具為什麼價差大？",
        answer: "涼感床包與涼被通常因尺寸、件數、材質與涼感標示不同而有價差，比價時要用同尺寸與同件數比較。",
      },
    ],
  },
  {
    slug: "home-cleaning",
    title: "居家清潔家電比價",
    description: "整理掃拖機器人、洗地機、除濕機、吸塵器與空氣清淨機，適合想升級居家清潔效率的人。",
    categoryIds: ["home-appliances"],
    productSlugs: ["robot-vacuum", "wet-dry-vacuum", "inverter-dehumidifier", "cordless-vacuum", "air-purifier"],
    intent: "清潔家電、除濕機與掃拖機器人購買決策",
    audience: "想用規格與價差快速挑家電的人",
    faq: [
      {
        question: "清潔家電只看最低價可以嗎？",
        answer: "不建議。掃拖機器人和洗地機要一起看耗材、重量、保固與維修據點；除濕機還要看坪數與能源效率。",
      },
      {
        question: "除濕機怎麼比較比較準？",
        answer: "先依坪數抓除濕力，再比較能源效率、保固與是否符合補助資格，最後才看最低價。",
      },
    ],
  },
  {
    slug: "health-supplements",
    title: "保健食品回購比價",
    description: "整理葉黃素、益生菌、魚油與維生素 D，適合用每日成本與有效成分比較長期回購品。",
    categoryIds: ["health"],
    productSlugs: ["lutein", "probiotics", "fish-oil", "vitamin-d", "iherb-supplements"],
    intent: "保健食品、葉黃素、魚油、益生菌單位成本比較",
    audience: "重視長期回購成本與跨境價格的人",
    faq: [
      {
        question: "保健食品比價要看瓶價還是每日成本？",
        answer: "建議看每日成本與有效成分含量。魚油看 EPA/DHA，葉黃素看每份劑量，益生菌則看菌株資訊與保存方式。",
      },
      {
        question: "跨境保健品一定比較便宜嗎？",
        answer: "不一定。跨境價格要把折扣碼、運費、配送時間與報關限制一起算，才是真正實付成本。",
      },
    ],
  },
  {
    slug: "iphone-buying-guide",
    title: "iPhone 與手機周邊比價",
    description: "整理 iPhone 17、iPhone 16、AirPods Pro 與 MagSafe 配件，快速比較空機價、官方價與通路價差。",
    categoryIds: ["phones"],
    productSlugs: ["iphone-17-256", "iphone-17-pro-256", "iphone-16-128", "airpods-pro", "magsafe-power-bank"],
    intent: "iPhone 空機、耳機與配件購買建議",
    audience: "想比較 Apple 相關商品通路價差的人",
    faq: [
      {
        question: "iPhone 買最低價就好嗎？",
        answer: "高單價手機建議同時確認公司貨、保固、發票與通路評價。若價差很小，官方或授權通路通常更穩。",
      },
      {
        question: "手機配件怎麼比價？",
        answer: "行動電源與耳機要注意安全認證、版本、保固地區與是否平行輸入，不應只看最低價。",
      },
    ],
  },
];

export function getTopic(slug: string): Topic {
  const topic = topics.find((item) => item.slug === slug);

  if (!topic) {
    throw new Error(`Unknown topic: ${slug}`);
  }

  return topic;
}
