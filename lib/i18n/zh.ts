import type { Dictionary } from "./en";

// Terminology follows proageing.org's own Chinese pages wherever they
// already say something — "ProAgeing 七大步骤" for the seven steps, the
// nine check names from /zh/*.html — so a person moving between the
// website and the app doesn't meet two different vocabularies for the same
// thing.
//
// Typed as Dictionary, so a key added to en.ts without a translation here
// fails the build instead of silently rendering English to a Chinese user.
export const zh: Dictionary = {
  common: {
    loading: "载入中…",
    back: "← 返回",
    saving: "保存中…",
    saved: "已保存",
    save: "保存",
    signOut: "退出登录",
    signingOut: "退出中…",
    couldntSave: (detail: string) => `无法保存：${detail}`,
  },

  // Names taken from proageing.org's own /zh/ pages for each check.
  checks: {
    purpose: "人生目标感",
    "family-history": "家族病史风险",
    "cognitive-decline": "认知衰退风险",
    vo2max: "最大摄氧量与静息心率",
    "sit-to-stand": "坐立测试",
    balance: "平衡检测",
    "nutrition-protein": "营养与蛋白质",
    "sleep-quality": "睡眠质量",
    connection: "社交联系",
  },

  tabs: {
    home: "首页",
    readings: "我的记录",
    programme: "挑战",
    plans: "方案",
  },

  signIn: {
    title: "登录 ProAgeing",
    blurb: "我们会把登录链接发送到你的邮箱 — 无需密码。",
    emailPlaceholder: "you@example.com",
    send: "发送登录链接",
    sending: "发送中…",
    sent: "请查收邮件，点击链接即可继续。你可以关闭此页面。",
    failed: (detail: string) => `链接发送失败：${detail}`,
    signingYouIn: "正在登录…",
    backToSignIn: "返回登录",
  },

  dashboard: {
    greeting: (name: string) => `你好，${name}！`,
    firstVisit: "了解 ProAge 如何运作。",
    welcomeSteps: [
      {
        title: "完成免费检测",
        body: "围绕 ProAgeing 七大步骤的 9 项快速引导式检测 — 无需就诊，无需抽血。",
      },
      {
        title: "查看你的健康长寿档案",
        body: "你的结果会汇总成下方的档案，每次重测后都会同步更新。",
      },
      {
        title: "养成习惯",
        body: "准备好行动了吗？21 天 ProAgeing 挑战会把你的结果变成每日计划。",
      },
    ],
    affirmations: [
      "健康长寿，从今天开始！",
      "ProAgeing，一步一个脚印。",
      "小小步伐，换来更长岁月。",
      "今天的决定，塑造你的明天。",
      "为未来的自己投资。",
    ],
    cards: {
      checks: "我的长寿档案",
      checksProgress: (done: number, total: number) => `${done} / ${total} 项检测`,
      challenge: "21 天挑战",
      challengeBlurb: "每日计划与连续记录",
    },
    sevenSteps: {
      eyebrow: "ProAgeing 七大步骤",
      blurb: "七个简单步骤，通往更长久、更充实的人生。",
      stepLabel: (n: number, tagline: string) => `步骤 ${n} · ${tagline}`,
    },
  },

  readings: {
    title: "你的长寿检测记录",
    blurb: "你做过的每一项检测，以及各项的最新结果。",
    yourChecks: "你的 9 项检测",
    notStarted: "尚未开始",
    legend: {
      typical: "正常范围",
      worthALook: "值得留意",
      seeDoctor: "请咨询医生",
    },
    missingHistory: "找不到 proageing.org 上的记录？",
  },

  account: {
    title: "账户",
    displayName: "显示名称",
    displayNameBlurb: "这是应用中显示的名称",
    yourData: "你的数据",
    findHistory: "查找其他邮箱下的记录",
    findHistoryBlurb: "以其他邮箱地址保存在 proageing.org 上的结果",
    accountSection: "账户",
    privacy: "隐私政策",
    terms: "使用条款",
    language: "语言",
    languageBlurb: "应用全局使用",
    couldntSave: (detail: string) => `无法保存：${detail}`,
  },

  upgrade: {
    title: "方案与价格",
    blurb:
      "9 项检测始终免费，你的账户也会免费保存每一次检测的历史记录。以下是把检测结果转化为每日计划的引导式方案。",
    currentlyOn: (plan: string) => `你目前使用的是${plan}。`,
    notOpenYet: (plan: string) => `${plan}尚未开放 — 以下是目前可选的方案。`,
    yourSelection: "你的选择",
    comingSoon: "即将推出",
    currentPlan: "当前方案",
    choosePlan: "选择此方案",
    redirecting: "跳转中…",
    couldntStart: "无法开始结账。",
  },

  importHistory: {
    title: "查找其他邮箱下的记录",
    blurb:
      "只要使用同一个邮箱地址登录，你保存在 proageing.org 上的记录都会自动同步过来。如果当时用的是另一个邮箱，请在此输入，我们会向该地址发送链接以确认是你本人。",
    privacy: "我们只会读取你自己的数据 — 不会与任何人共享。",
    send: "发送登录链接",
    sending: "发送中…",
    sent: "请查收邮件，点击链接即可导入记录。你可以关闭此页面。",
    failed: (detail: string) => `链接发送失败：${detail}`,
    working: "正在导入你的记录…",
    needsPrimary: "请先登录你的 ProAgeing 账户，然后从账户页面重新使用导入链接。",
    done: (imported: number, skipped: number) => `已导入 ${imported} 项结果，跳过 ${skipped} 项已导入的记录。`,
    backToDashboard: "返回首页",
    tryAgain: "重试",
  },

  programme: {
    notStarted: {
      eyebrow: "21 天挑战",
      title: "开始实践 ProAgeing 七大步骤",
      blurb: "每天一个小行动，坚持二十一天。第 1 天从今天开始。",
      whatYoullDo: "你会做什么",
      items: [
        { label: "学习", body: "每天一个理念，一分钟读完。" },
        { label: "行动", body: "一个当天就能完成的小行动。" },
        { label: "反思", body: "写给自己的一句话，完全私密。" },
      ],
      onDay21: "第 21 天",
      onDay21Body: "你会重测其中五项检测，看看究竟有什么变化 — 然后为自己定下要坚持的那一个习惯。",
      begin: "开始第 1 天",
      starting: "开始中…",
      couldntStart: (detail: string) => `无法开始挑战：${detail}`,
    },
    noAccess: {
      title: "21 天 ProAgeing 挑战",
      blurb:
        "你的 9 项检测始终免费。而引导式的 21 天挑战 — 每日行动、连续记录，以及最后的核心习惯 — 属于付费方案。",
      seePlans: "查看方案与价格",
    },
    day: {
      dayOf: (day: number, total: number) => `第 ${day} 天 / 共 ${total} 天`,
      backToToday: (day: number) => `回到今天（第 ${day} 天）`,
      previousDay: "前一天",
      nextDay: "后一天",
      streak: (days: number) => `🔥 连续 ${days} 天`,
      learn: "学习",
      act: "行动",
      reflect: "反思",
      readToday: "已读今天的内容",
      readThisDay: "已读这一天的内容",
      doneClose: "已完成 — 已重测并定下核心习惯",
      doneToday: "今天已完成",
      done: "已完成",
      answerPlaceholder: "写下你的答案…",
      examples: (examples: string) => `例如：${examples}`,
      saveToday: "保存今天的进度",
      saveDay: (day: number) => `保存第 ${day} 天的进度`,
      profileReveal: "ProAgeing 七大步骤已全部检测完成 — 在你的",
      profileRevealLink: "首页",
      backToSummary: "← 返回我的总结",
    },
    testimonial: {
      heading: "分享你的故事",
      improvedMost: "哪方面改善最明显？",
      otherPlaceholder: "改善了什么？",
      consentQuestion: "你是否愿意匿名分享，以鼓励其他成年人？",
      yes: "愿意",
      no: "不愿意",
      beforeConcern: "在参加这个计划之前，你对衰老最大的顾虑是什么？",
      changeNoticed: "你注意到的一个变化是什么？",
      recommendation: "对于和你年龄相仿、却迟迟不敢开始的人，你想说什么？",
    },
    complete: {
      eyebrow: (total: number) => `挑战完成 · ${total} / ${total}`,
      title: "你已成为 ProAger",
      finishedOn: (date: string) => `完成于 ${date}。以下是你的变化。`,
      keystone: "你的核心习惯",
      keystoneFooter: (day: number) => `于第 ${day} 天定下 · 属于你自己`,
      daysDone: "完成天数",
      bestStreak: "最长连续",
      retaken: "已重测",
      whatMoved: "有什么变化",
      whatMovedRange: "开始时 → 现在",
      betterRange: "范围提升",
      sameRange: "同一范围",
      lowerRange: "范围下降",
      firstTime: "首次检测",
      notRetaken: "未重测",
      readingsSaved: "每一次重测都会保存到你的档案 — 你的记录已是最新。",
      seeReadings: "查看我的长寿检测记录",
      revisitDays: "回顾任意一天",
    },
  },

  stepDetail: {
    unknown: "找不到这个步骤。",
    backToDashboard: "← 返回首页",
    whyItMatters: "为什么重要",
    scienceShows: "科学怎么说",
    takeCheck: (label: string) => `做${label} →`,
    prevStep: (n: number) => `← 步骤 ${n}`,
    nextStep: (n: number) => `步骤 ${n} →`,
  },

  consent: {
    heading: "数据使用同意与个人资料保护法（PDPA）",
    clauses: [
      "收集目的 — 本人同意 ProAge 收集、使用并存储本人的个人资料及检测结果，用于进行检测、提供检测后建议，以及内部质量管理。",
      "遵守 PDPA — 本人知悉 ProAge 将依据《个人资料保护法》（PDPA）保护本人的资料。本人理解本人的资料不会被出售，也不会披露予未经授权的第三方。",
    ],
  },
};
