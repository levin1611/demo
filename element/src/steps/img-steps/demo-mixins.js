import { updateModeRead } from '@/api/reusableApi/match-store-api';
export default {
    computed: {
        imgSteps() {
            const lanUrl = this.$store.state.app.lang === 'en-US' ? 'en' : 'cn';
            const step = 5; // 步长
            const target = 'demo'; // 步骤模块名称 命名 eg: demo-steps
            return Array.apply(null, { length: step }).map((v, i) => ({
                url: require(`@/assets/images/step-${lanUrl}/${target}-steps/avatar${i + 1}.svg`)
            }));
        }
    },
    methods: {
        imgStepsIsRead(name) {
            if (name) {
                updateModeRead(name);
            }
        }
    }
};
