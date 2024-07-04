import { Rnum } from '@/utils/dynamicDatas.js';
import { getIsReadMode } from '@/api/reusableApi/match-store-api';
export default {
    data() {
        return {
            modeRef: `stepImage_${Rnum()}`
        };
    },
    computed: {
        imgSteps() {
            // const lanUrl = this.$store.state.app.lang === 'en-US' ? 'en' : 'cn';
            const lanUrl = 'cn';
            const step = 6; // 步长
            const target = 'mailAccountBind'; // 步骤模块名称 命名 eg: demo-steps
            return Array.apply(null, { length: step }).map((v, i) => ({
                url: require(`@/assets/images/step-${lanUrl}/${target}-steps/${target}${i + 1}.png`)
            }));
        }
    },
    methods: {
        checkModeIsRead() {
            getIsReadMode('mailAccountBind', this.openMode);
        },
        openMode() {
            this.$nextTick(function() {
                if (this.$refs[this.modeRef]) this.$refs[this.modeRef].showModal();
            });
        }
    }
};
