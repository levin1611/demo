export const globalNavModes = { // 路由name驼峰写法 若需改路由名称则需要做值映射
    // whatsappChat: 4, // whatsApp
    myInquiry: 9, // 询盘
    mailHome: 8, // 邮件
    // xhlChat: 10, // 我的聊天
    // visitorHistory: 6, // 网站历史
    // websiteMessage: 8, // 网站留言
    // inbox: 9, // FaceBook 收件箱
    // fbMessage: 7, // FaceBook leads管理
    homepageDynamic: 6, // FaceBook 主页管理
    oneKeyRelease: 8, // FaceBook 发帖管理
    myClue: 10, // 我的线索
    closeLoop: 5 // Google 闭环优化管理
};
export const helpCenterModes = {
    whatsappChat: 'https://leadscloud.helpdocsonline.com/whatsapp', // whatsApp帮助中心
    aiseo: 'https://www.yuque.com/g/help.leadscloud/faq_guide/yi9o4fynpdr6p5gk/collaborator/join?token=zOtB7ZZIQ3H5J04H&source=doc_collaborator', // ai seo 生成文档
    inbox: 'https://www.yuque.com/help.leadscloud/faq_guide/op7gutv6ih60q1pv?singleDoc# 《Facebook 操作指南》', // Facebook
    xhlChat: 'https://www.yuque.com/help.leadscloud/faq_guide/ol9b3c988drgumf2?singleDoc# 《网站操作指南》',
    visitorHistory: 'https://www.yuque.com/help.leadscloud/faq_guide/ol9b3c988drgumf2?singleDoc# 《网站操作指南》',
    websiteMessage: 'https://www.yuque.com/help.leadscloud/faq_guide/ol9b3c988drgumf2?singleDoc# 《网站操作指南》'
};
const global = Object.keys(globalNavModes);
const special = ['mailAccountBind', 'closeLoopPassBack', 'closeLoopCheck', 'cloundPushAddSteps']; // 维护组件内部的步骤提示模块名称
export const allowGetIsReadMode = global.concat(special);
