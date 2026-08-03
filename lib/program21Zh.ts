import type { Program21Day } from "./program21";

// Chinese copy for the 21-Day Challenge.
//
// Unlike lib/sevenStepsZh.ts, this has no published counterpart on
// proageing.org to draw from — the programme is app-original, so this is a
// fresh translation and should get a native read before the paid
// programme is promoted to Chinese-speaking users. The study figures,
// named researchers and dosages are carried across unchanged; those are
// claims about evidence and must not drift in translation.
//
// Structure mirrors PROGRAM21_DAYS exactly: same 21 days, same flags, same
// assessment links.
export const PROGRAM21_DAYS_ZH: Program21Day[] = [
  {
    day: 1,
    pillar: "步骤 1 — 明确你理想的未来",
    learn:
      "目标感强的成年人，全因死亡率低 20%（美国拉什大学，6,985 位参与者）——目标感保护的是你的心脏、大脑与免疫系统。",
    assessments: [{ label: "做你的人生目标感检测", href: "/assess/purpose" }],
    action:
      "花 3 分钟写下你的三个目标来源：谁让你的人生有意义（关系）、你能贡献或传授什么（贡献），以及什么事你做起来觉得值得（体验）。",
    reflect: "看看你写下的内容，哪一个来源是你想多花点心思的？",
  },
  {
    day: 2,
    pillar: "步骤 2 — 了解你的个人健康风险",
    learn:
      "了解家族病史，能告诉你最该盯紧哪些风险——直系亲属若在 60 岁前发病，会大幅提高你自己的风险。",
    assessments: [
      { label: "做你的家族病史检测", href: "/assess/family-history" },
      { label: "做你的认知衰退风险检测", href: "/assess/cognitive-decline" },
    ],
    action:
      "挑一项生物标记，下次体检时问问医生——糖化血红蛋白（HbA1c）、载脂蛋白 B（ApoB）、高敏 C 反应蛋白（hsCRP）、维生素 D，或空腹胰岛素。",
    reflect: "你的检测结果里，哪一项最出乎你意料？",
  },
  {
    day: 3,
    pillar: "步骤 3 — 坚持日常运动",
    learn:
      "一项涵盖超过 122,000 名成年人的研究显示，体能最好的一组，死亡风险比最差的一组低 80%——最大摄氧量是健康长寿最有力的预测指标之一。",
    assessments: [{ label: "做你的最大摄氧量与静息心率检测", href: "/assess/vo2max" }],
    action: "今天就开始：快走 10 分钟。速度控制在还能说话、但唱不了歌（第二区）。",
    reflect: "这趟走下来感觉如何？全程都还能和人聊天吗？",
  },
  {
    day: 4,
    pillar: "步骤 4 — 增强力量与平衡能力",
    learn: "下肢力量和平衡，是任何年纪都最练得起来的两项能力——持续练 8 到 12 周，就能看到实在的进步。",
    assessments: [
      { label: "做你的坐立测试", href: "/assess/sit-to-stand" },
      { label: "做你的平衡检测", href: "/assess/balance" },
    ],
    action: "今天就开始：5 分钟的力量小练习——扶椅深蹲、弹力带划船，或靠墙俯卧撑。",
    reflect: "哪个动作最吃力？通常那一个，就是最值得继续练的。",
  },
  {
    day: 5,
    pillar: "步骤 5 — 健康饮食，滋养身体",
    learn:
      "50 岁以后，肌肉对蛋白质的反应变差，所以要吃得更多、而不是更少——每餐 25 到 40 克，分散在一天当中，早餐尤其别漏。",
    assessments: [{ label: "做你的营养与蛋白质检测", href: "/assess/nutrition-protein" }],
    action: "今天早餐加上 25 到 40 克蛋白质——鸡蛋、豆腐、希腊酸奶或鱼都可以。",
    reflect: "你加了什么？整个上午的状态和平常有什么不一样？",
  },
  {
    day: 6,
    pillar: "步骤 6 — 恢复睡眠与压力节奏",
    learn: "身体在睡眠中修复，大脑也在这时候「重新校准」——时长（7 到 9 小时）和质量，两者一样重要。",
    assessments: [{ label: "做你的睡眠质量检测", href: "/assess/sleep-quality" }],
    action: "今晚定下固定的上床与起床时间，并在睡前 30 分钟把屏幕收起来。",
    reflect: "今晚的睡前时光，和你平常的习惯有什么不同？",
  },
  {
    day: 7,
    pillar: "步骤 7 — 加强社交与情感联系",
    learn:
      "社交孤立对寿命的伤害，相当于每天抽 15 支烟（Holt-Lunstad，340 万人）——比肥胖或缺乏运动更严重。",
    assessments: [{ label: "做你的社交联系检测", href: "/assess/connection" }],
    action: "今天联系一个人——打通电话，不要只是发讯息。",
    reflect: "这一周里，你有什么小小的收获？",
    reflectExamples: ["我走了 4 天。", "我睡得比较早了。", "我做了第一次扶椅深蹲。"],
    isProfileReveal: true,
  },
  {
    day: 8,
    pillar: "运动",
    learn: "第二区训练——能完整对话、但明显感觉在用力的强度——是提升最大摄氧量的基础。",
    action:
      "今天走路时试试「说话测试」：能不能说出完整句子、呼吸明显变重但撑得住？那就是你的第二区。",
    reflect: "什么样的速度能让你进入这个区间？",
  },
  {
    day: 9,
    pillar: "力量与平衡",
    learn: "平衡是任何年纪都最练得起来的身体能力之一——每天简单练一下，几周内就能有明显进步。",
    action: "今天在流理台旁练几次单脚站立，每次 10 到 20 秒。",
    reflect: "哪一只脚站得比较稳？",
  },
  {
    day: 10,
    pillar: "运动",
    learn: "减少久坐、在一天当中多加些零碎的活动，和有计划的运动一样重要。",
    action: "今天的散步多走 5 分钟，或另外再走一趟短的。",
    reflect: "这多出来的 5 分钟，你是从哪里挤出来的？",
  },
  {
    day: 11,
    pillar: "力量与平衡",
    learn: "每周做 2 次力量训练，每个大肌群 2 组、每组 10 下，就足以开始看到真正的变化。",
    action: "今天的力量小练习，多做一下，或试试加上弹力带。",
    reflect: "和第 4 天比起来，是变难了还是变容易了？",
  },
  {
    day: 12,
    pillar: "营养",
    learn: "新加坡长寿餐盘：一半蔬菜水果、四分之一蛋白质、四分之一全谷物——每一餐都能套用的简单模板。",
    action: "今天挑一餐，照着新加坡长寿餐盘来配。",
    reflect: "你的餐盘长什么样子？",
  },
  {
    day: 13,
    pillar: "运动",
    learn: "生活中的活动——爬楼梯、通勤、做家务——是在有计划的运动之外累加，而不是拿来取代它。",
    action: "今天走楼梯，或再养成一个生活中的活动习惯。",
    reflect: "有哪一个活动习惯，是你可以一直保持下去的？",
  },
  {
    day: 14,
    pillar: "力量与平衡",
    learn: "持续比强度更重要——目标是规律地做你的力量小练习，而不是练到恢复不过来。",
    action: "今天把力量小练习往前推一点——同样的动作，多做几下。",
    reflect: "两周过去了——到目前为止，哪一件事最容易坚持？",
  },
  {
    day: 15,
    pillar: "睡眠与压力",
    learn: "不同的情绪，对应着不同的呼吸模式——改变呼吸的方式，就能直接改变压力水平。",
    action: "今天试试手指呼吸法或深呼吸（吸气 4 秒、吐气 6 秒），做 90 秒。",
    reflect: "做完之后，你有感觉到什么变化吗？",
  },
  {
    day: 16,
    pillar: "运动",
    learn:
      "60 到 80 岁的成年人，只要持续训练 3 到 6 个月，最大摄氧量可以提升 15% 到 25%——你现在走的每一步，都在往那里累积。",
    action: "今天继续保持你的走路连续记录。",
    reflect: "到今天为止，你已经连续走了几天？",
  },
  {
    day: 17,
    pillar: "力量与平衡",
    learn: "90 岁以上的人，肌肉一样还能长——什么时候开始都不算晚，持续比年纪更要紧。",
    action: "今天的力量小练习，多做一下、多做一组。",
    reflect: "和第 4 天相比，有什么变化？",
  },
  {
    day: 18,
    pillar: "社交联系",
    learn: "冲绳的「模合」（moai）——约 5 位朋友组成、彼此扶持一辈子的小圈子——是很实在的社交联系模式。",
    action: "今天参加一个活动，或把一段关系经营得更深一点——和某个人一起计划点什么。",
    reflect: "你和谁联系了？过程如何？",
  },
  {
    day: 19,
    pillar: "人生目标感",
    learn: "在一个什么安排都没有的周日下午，你的感受如何，正说明了你现在的意义来源有多稳固。",
    action: "试试「周日下午测试」——今天留意一下，面对没有安排的时间，你是什么感觉。",
    reflect: "是平静满足，还是空虚烦躁？这说明了什么？",
  },
  {
    day: 20,
    pillar: "营养",
    learn: "在城市人口中，超加工食品占了热量摄取的 40% 到 50%，并且与生理老化加速独立相关。",
    action: "今天把一餐加工食品，换成天然食物。",
    reflect: "你换掉了什么？比想像中难，还是容易？",
  },
  {
    day: 21,
    pillar: "结业 — 成为 ProAger",
    learn:
      "身分层面的承诺——把习惯和「你想成为什么样的人」绑在一起，并且说给别人听——才是计划结束之后还留得住的东西。",
    assessments: [
      { label: "重测：坐立测试", href: "/assess/sit-to-stand" },
      { label: "重测：平衡检测", href: "/assess/balance" },
      { label: "重测：营养与蛋白质", href: "/assess/nutrition-protein" },
      { label: "重测：睡眠质量", href: "/assess/sleep-quality" },
      { label: "重测：社交联系", href: "/assess/connection" },
    ],
    action:
      "重做上面这 5 项检测，看看这 21 天里你的变化，然后向另一个人说出你的核心习惯——这 21 天当中，你决定要一直保持下去的那一个。",
    reflect: "把这句话接完：「我是一个会……的人。」",
    isClose: true,
  },
];
