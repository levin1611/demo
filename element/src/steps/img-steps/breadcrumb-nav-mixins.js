import { globalNavModes, helpCenterModes } from './mode-config';
import { Rnum } from '@/utils/dynamicDatas.js';
import { getIsReadMode } from '@/api/reusableApi/match-store-api';

export default {
    data() {
        return {
            modeRef: `stepImage_${Rnum()}`
        };
    },
    computed: {
        piwikBind() {
            return `piwik_routeName_${this.stepModeName}`;
        },
        stepModeName() {
            return this.$dym.toHump(this.$route.name); // 绑定唯一的路由名
        },
        imgSteps() {
            const lanUrl = 'cn'; // this.$store.state.app.lang === 'en-US' ? 'en' : 'cn'
            const target = this.stepModeName;
            const step = globalNavModes[target];
            if (!step) return [];
            return Array.apply(null, { length: step }).map((v, i) => ({
                url: require(`@/assets/images/step-${lanUrl}/${target}-steps/${target}-${i + 1}.png`)
            }));
        },
        toHelpCenter() {
            const target = this.stepModeName;
            const helpCenter = helpCenterModes[target];

            return helpCenter;
        }
    },
    methods: {
        checkModeIsRead() {
            getIsReadMode(this.stepModeName, this.openMode);
        },
        openMode() {
            this.$nextTick(function() {
                if (this.$refs[this.modeRef]) this.$refs[this.modeRef].showModal();
            });
        }
    }
};
