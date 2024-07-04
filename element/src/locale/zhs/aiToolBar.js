export default {
  aiToolBar: "AI 工具栏",
  aiToolBarTip: "支持用户在询盘云系统任意页面触发 AI 工具栏",
  placeholder: "输入“/AI”唤起 AI 工具栏",
  orPlaceholder: " 或 输入“/AI”唤起 AI 工具栏",
  settings: {
    input: "输入指令设置",
    output: "输出指令设置",
    timing: "触发时机",
    status: "启用状态",
    setting: "设置",
    updateSuccess: "更新状态成功",
    addScenario: "添加 AI 应用",
    scenarioName: "AI 应用名称",
    groupName: "AI 应用分组",
    showCondition: "显示条件",
    opration: "操作",
    delete: "删除",
    noData: "暂时没有数据",
    deleteSuccess: "删除成功",
    deleteFailed: "删除失败",
  },
  triggerType: {
    inputSlash: "输入框“/AI”触发",
    inputSlashText: "启用AI工具栏支持输入框快捷键“/AI”触发",
    inputSelect: "输入框选中文本",
    inputSelectText: "启用AI工具栏",
    pageSelect: "页面选中文本",
    pageSelectText: "启用AI工具栏",
  },
  group: {
    sort: "分组排序",
    sortModalTitle: "分组排序设置",
    all: "全部应用分组",
    ungrouped: "未分组",
    placeholder: "请选择分组",
    noData: "该分组下暂时没有场景",
    sortSuccess: "排序成功",
    sortFailed: "排序失败，请重试",
    close: "关闭",
  },
  addModal: {
    title: "选择 AI 应用",
    placeholder: "请输入搜索关键词",
    selectedApp: "已选应用",
    condition: "全部",
    saveSuccess: "保存成功",
    saveFailed: "保存失败",
    noData: '没有找到"{name}"相关的搜索结果',
  },
  stage: {
    analyzeProblem: "正在分析问题...",
    queryKG: "正在检索知识图谱...",
    queryKB: "正在检索知识库...",
    queryInternet: "正在检索互联网...",
    generateAnswers: "正在生成答案...",
    polishAnswers: "正在润色答案...",
    finish: "完成",
    failTOEnd: "生成失败，请重试。",
    generating: "正在生成答案...",
    searching: "搜索中...",
  },
  messageBox: {
    keywords: "关键词：",
    ref: "引用：",
    expandRef: "展开引用详情",
    retractRef: "收起引用详情",
    tip: "内容由 AI 生成，请自行判断并谨慎采纳",
  },
  chat: {
    placeholder: "请输入您的指令，或从列表中选择",
    retract: "收起全部",
    expand: "展开全部",
    cover: "覆盖插入",
    insert: "追加插入",
    retry: "重新生成",
    copy: "复制",
    abort: "弃用",
  },
  feedBack: {
    title: "反馈",
    placeholder: "请输入你点踩的原因",
    feedbackQuickText1: "内容不匹配",
    feedbackQuickText2: "表述不合理",
    feedbackQuickText3: "概念不准确",
    feedbackQuickText4: "内容不完整",
    feedbackQuickText5: "有敏感内容",
    overLength: "文字长度超过上限",
  },
  ref: {
    page: "第{value}页",
  },
  frontAi: {
    noResultForSearch: "没有找到{name}相关的搜索结果",
    modelSettings: "模型设置",
    selectModel: "选择模型",
    modelType_3p5: "GPT3.5",
    modelType_4: "GPT4",
    modelType_pangu: "盘古大模型",
    modelType_hunyuan1: "混元大模型标准版",
    modelType_hunyuan2: "混元大模型高级版",
    modelType_6: "GPT4 turbo",
    modelType_7: "GPT4o",
    selectModelCreativity: "选择模型创造力",
    strictMode: "精准模式",
    standardMode: "标准模式",
    creativeMode: "创造模式",
    deepOptimizeAnswer: "深度优化答案",
    tip_deepOptimizeAnswer:
      "开启后模型会对自己的结果做进一步优化，该过程会消耗一定费用",
    useKnowledgeBaseContent: "调用知识库内容",
    knowledgeMap: "知识图谱",
    filterByFile: "按文件筛选",
    allFolder: "全部文件夹",
    specificFolder: "指定文件夹",
    placeholder_selectFolder: "请选择文件夹",
    filterByTag: "按标签筛选",
    allTag: "全部标签",
    specificTag: "指定标签",
    add: "添加",
    otherSettings: "其他设置",
    quoteChatMsg: "引用会话消息",
    tip_quoteChatMsg: "提问时自动引用几条本会话中的消息",
    error_noChatSettings: "聊天设置未请求完成, 无法发送消息",
    deleteConfirm: "删除确认",
    tip_deleteFolder: "删除后会同步删除文件夹下的文件，请再次确认是否删除",
    error_fileDeleted: "文件已被删除或不存在！",

    responsePrefer: "模型回复偏好",
    learningAnReference: "仅供学习及参考",
    strictKnowledge: "严格遵循知识库资料",
  },
  confirm: "确定",
  cancel: "取消",
  stop: "停止",
  claer: "清空",
};