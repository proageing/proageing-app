import type { SevenStep } from "./sevenSteps";

// Verbatim from proageing.org/zh/7-steps.html — this is the site's own
// published Chinese copy, not a fresh translation of the English, so the
// two properties say the same thing in the same voice. Section order,
// list lengths and photos match lib/sevenSteps.ts one for one.
export const SEVEN_STEPS_ZH: SevenStep[] = [
  {
    step: 1,
    title: "明确你理想的未来",
    tagline: "想清楚你的初衷",
    photo: "/steps/step-1.jpg",
    why: "真正的改变，都是从一个有意义的理由开始的。心里有目标的人，比较容易保持活跃、吃得健康、管好压力，也比较不容易和人断了联系。",
    science:
      "研究发现，目标感越强的人，认知衰退的风险越低，心理状态越好，连早逝的风险也比较低。目标感的作用，似乎是通过动力、韧性，以及每天那些更健康的选择，慢慢体现出来的。",
    listHeading: "问问自己",
    listItems: [
      "10年、20年后，我希望自己过的是什么样的日子？",
      "我希望自己还「做得到」什么，而不只是「避开」什么？",
      "我希望能一直陪在谁身边？",
    ],
    closing:
      "把这个愿景放在看得见的地方。当你是朝着某件有意义的事往前走，而不只是想躲开疾病，健康长寿这件事就容易得多。",
    assessments: [{ label: "人生目标感检测", type: "purpose" }],
  },
  {
    step: 2,
    title: "了解你的个人健康风险",
    tagline: "了解你的风险因素",
    photo: "/steps/step-2.jpg",
    why: "健康寿命，指的是你在健康状态下度过的年数。很多和老化有关的毛病——心脏病、糖尿病、跌倒、体弱、睡不好、认知衰退——都是慢慢累积出来的。",
    science:
      "让人老得不好的几个最大因素，多半是可以改变的：不运动、体脂过高、血压高、睡不好、抽烟、饮食不健康，还有和人疏远。",
    listHeading: "看看你目前的状况",
    listItems: ["血压", "腰围", "力量与平衡", "睡眠质量", "压力水平", "社交联系", "身体活动量"],
    closing: "了解风险不是为了吓自己，而是要弄清楚哪几项跟你最有关，好把力气花在真正要紧的地方。",
    assessments: [
      { label: "家族病史检测", type: "family-history" },
      { label: "认知衰退风险检测", type: "cognitive-decline" },
    ],
  },
  {
    step: 3,
    title: "坚持日常运动",
    tagline: "经常活动，而非只求强度",
    photo: "/steps/step-3.jpg",
    why: "你的身体，本来就是要一整天都动的。每天动一动，心脏、肺、大脑、关节和情绪都会跟着受益。",
    science:
      "研究显示，有规律走路、做中等强度活动的人，心血管疾病、糖尿病、抑郁症与认知衰退的风险都比较低。就算只是把长时间的久坐打断一下，健康指标也会跟着改善。",
    listHeading: "不只是运动",
    listItems: ["饭后散步", "走楼梯", "每30到60分钟起来动一动", "做点家务、种种花草", "中间穿插几次短短的活动时间"],
    closing: "健康长寿靠的不是偶尔拼一次的高强度锻炼，而是一种让身体每天都在动的生活方式。",
    assessments: [{ label: "最大摄氧量检测", type: "vo2max" }],
  },
  {
    step: 4,
    title: "增强力量与平衡能力",
    tagline: "守住自己照顾自己的能力",
    photo: "/steps/step-4.jpg",
    why: "力量不是运动员才需要的东西。能不能自己照顾自己，靠的就是它：从椅子上站起来、爬楼梯、提得动买回来的菜、跌倒时稳得住，样样都要力量。",
    science:
      "肌肉会随着年纪慢慢流失（也就是肌少症），而这件事从中年就可能开始。做力量训练和平衡练习，能让行动更利索、降低跌倒风险，也帮助你老得更好。",
    listHeading: "专注于功能性力量",
    listItems: ["坐立练习", "上台阶练习", "提物练习", "弹力带训练", "提踵练习", "单脚平衡练习"],
    closing: "把力量和平衡守住，是我们在变老的过程中，留住自信、行动力和自理能力最有效的办法之一。",
    assessments: [
      { label: "坐立测试", type: "sit-to-stand" },
      { label: "平衡检测", type: "balance" },
    ],
  },
  {
    step: 5,
    title: "健康饮食，滋养身体",
    tagline: "用饮食把改变撑住",
    photo: "/steps/step-5.jpg",
    why: "食物是给身体的信息。你的精力、血糖、血压、发炎反应、肌肉和大脑，都会受它影响。",
    science:
      "多吃蔬菜、水果、豆类、全谷物和健康脂肪，蛋白质也吃够——这样的饮食方式，一再被发现与更好的心血管、代谢与认知健康有关。",
    listHeading: "保持简单可行",
    listItems: ["一半的盘子留给蔬菜", "每一餐都要有蛋白质", "多吃天然、少加工的食物", "水要喝够", "慢慢减少超加工食品"],
    closing: "健康饮食不是要你吃得完美，也不是处处设限，而是把身体用来修复、适应、长期撑住的营养给足。",
    assessments: [{ label: "营养与蛋白质检测", type: "nutrition-protein" }],
  },
  {
    step: 6,
    title: "恢复睡眠与压力节奏",
    tagline: "休息，也是健康的一部分",
    photo: "/steps/step-6.jpg",
    why: "身体变好，不只是在你运动、吃得好的时候，也在你让它有时间修复的时候。",
    science:
      "睡不好的人，肥胖、糖尿病、心脏病、抑郁症与认知衰退的风险都比较高。而长期的压力，会一点一点影响血压、免疫力和长远的健康。",
    listHeading: "支持你的节奏",
    listItems: ["作息尽量固定", "早上多晒点太阳", "过了下午就少碰咖啡因", "睡前少看屏幕", "用慢呼吸让神经安定下来"],
    closing: "睡得好、压力缓得下来，不是可有可无的加分项，而是身体和大脑真正修复自己的过程。",
    assessments: [{ label: "睡眠质量检测", type: "sleep-quality" }],
  },
  {
    step: 7,
    title: "加强社交与情感联系",
    tagline: "一起成长",
    photo: "/steps/step-7.jpg",
    why: "人本来就是群居的。和人有来往，保护的不只是心理，也是身体。",
    science:
      "孤独和与人疏离的人，抑郁症、认知衰退、心脏病与早逝的风险都比较高。反过来，身边有人支持，人会更有韧性，也更容易把健康的习惯维持下去。",
    listHeading: "用心建立联系",
    listItems: ["给朋友打通电话", "参加一个团体", "找人一起吃饭", "参与志愿服务", "需要的时候开口求助", "有余力的时候帮别人一把"],
    closing: "健康长寿不只是一个人活得久，还关乎有没有归属感、能不能付出，以及和别人之间那份情感上的牵挂。",
    assessments: [{ label: "社交联系检测", type: "connection" }],
  },
];
