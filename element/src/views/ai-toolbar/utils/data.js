export const triggerType = {
  inputBoxSlash: 1,
  inputBoxSelect: 2,
  pageSelect: 3,
};

export const stage = {
  inputSetting: 1,
  outputSetting: 2,
};

export const inputType = ["input", "select", "selectMultiple"];

export const aiQueryStage = [
  "queryKB",
  "referenceReady",
  "generateAnswers",
  "streamAnswers",
  "finish",
];

export const selectScenario = [
  {
    scenarioName: "翻译文本",
    prompt: "promptTask",
    taskName: "目标语种",
    promptTask: [
      "中文简体",
      "中文繁体",
      "英语",
      "西班牙语",
      "俄语",
      "阿拉伯语",
      "法语",
      "日语",
      "韩语",
      "马来语",
      "印尼语",
      "意大利语",
      "越南语",
      "葡萄牙语",
      "泰语",
      "土耳其语",
      "波斯语",
      "德语",
      "荷兰语",
      "捷克语",
      "斯洛伐克语",
      "乌克兰语",
      "希伯来语",
      "波兰语",
    ],
  },
  {
    scenarioName: "调整语气",
    prompt: "promptRequirement",
    taskName: "语气",
    promptTask: [
      "商务的",
      "专业的",
      "令人信服的",
      "礼貌的",
      "热情的",
      "正式的",
      "诚挚的",
      "吸引人的",
      "友好的",
    ],
  },
];

export const selectScenarioList = selectScenario.map((i) => i.scenarioName);
