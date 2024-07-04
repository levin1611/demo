// 存放发送消息的 翻译记忆逻辑
import { getTranslateMemory, setTranslateMemory } from '@/api/whatsapp.js';
export default {
    data() {
        return {
        };
    },
    methods: {
        // 查询当前聊天对象的翻译记忆
        getCurrentChatCountTM() {
            // http://10.2.2.101:7307
            return getTranslateMemory({
                orgId: this.enterpriseId,
                userId: this.userId,
                sessionType: 12,
                userAccount: this.pageId, // 询盘云 用户账号
                visitorAccount: this.conversationId // 访客账号
            });
        }
    },
    watch: {
        conversationId: {
            async handler() {
                this.inputMessage = '';
                const { message } = await this.getCurrentChatCountTM();
                this.language = message || 'en';
            },
            immediate: true
        },
        // language
        async language(value) {
            // 语言变化时设置翻译记忆
            await setTranslateMemory({
                language: value,
                orgId: this.enterpriseId,
                userId: this.userId,
                sessionType: 12,
                userAccount: this.pageId, // 询盘云 用户账号
                visitorAccount: this.conversationId // 访客账号
            });
        }
    }
};
