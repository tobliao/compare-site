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
        answer: "如果是每天通勤用，先看清爽度、SPF/PA 和每 ml 價格；如果是要去海邊或戶外玩，防水和補擦方便度會比省幾十元更重要。",
      },
      {
        question: "涼感寢具為什麼價差大？",
        answer: "涼感床包常常差在尺寸、件數和材質，建議先確認是不是同樣雙人/加大、是否含枕套，再看價格，才不會買到看起來便宜但其實少一件的組合。",
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
        answer: "不太建議。掃拖機器人、洗地機這類商品買回家後還會遇到耗材、重量、維修和收納問題，最低價可以先看，但最後最好搭配保固與使用情境一起決定。",
      },
      {
        question: "除濕機怎麼比較比較準？",
        answer: "先用家裡坪數抓除濕力，再看能源效率、噪音、保固和是否符合補助。價差很大時再點進通路確認活動，通常會比直接買最低價更穩。",
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
        answer: "回購型保健品最適合看每日成本。魚油看 EPA/DHA，葉黃素看每份劑量，益生菌看菌株和保存方式，這樣才知道哪個是真的划算。",
      },
      {
        question: "跨境保健品一定比較便宜嗎？",
        answer: "不一定。跨境常常標價漂亮，但要把折扣碼、運費、配送時間和報關限制一起算。如果只買一兩瓶，本地電商有時反而比較省事。",
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
        answer: "如果價差只有幾百元，高單價手機通常值得選官方或授權通路，保固、發票和退換貨會更安心；價差拉大時，再把最低價列入考慮。",
      },
      {
        question: "手機配件怎麼比價？",
        answer: "行動電源先看安全認證和容量，耳機要看版本、保固地區和是否平行輸入。配件雖然單價較低，但買錯規格其實更麻煩。",
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
