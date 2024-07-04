// 封装 el-loading 实例显示/隐藏 loading 逻辑
// el-dialog 不能用 v-loading , 因此封装此 hook

import { watch } from 'vue';
import { ElLoading } from 'element-plus';

const useElLoadingInstance = (options, loading) => {
    // loading 实例
    let loadingInstance;
    // 监听外部 loading 变化, 显隐 loading
    watch(
        loading,
        (val) => {
            if (val) {
                loadingInstance = ElLoading.service(options);
            } else {
                loadingInstance && loadingInstance.close();
            }
        },
        {
            immediate: true
        }
    );

    return { loadingInstance };
};

export default useElLoadingInstance;
