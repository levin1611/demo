
// 分页请求数据通用逻辑
import {ref, unref} from 'vue';
import { Request } from '@/https/baseUtilAjax';
import { useUserStore } from '@/pinia/modules/user.js';
import { CODESTATE } from '@/https/codeConfig';

const store = useUserStore();
function getData({method, url, data}, pageNo, pageSize) {
    
    // 发送请求获取数据
    const questData = {
        utilKey: 'ajaxJson',
        url
    };
    if (method == 'get') {
        // get请求使用params参数
        questData.params = {pageNo, pageSize, userId: store.userId, orgId: store.orgId, ...data};
    } else {
        questData.data = {pageNo, pageSize, userId: store.userId, orgId: store.orgId, ...data};
    }
    return new Request(questData, method).init(null, null, []);
}
// config {
//     method, 请求类型
//     url,  请求url
//     data, 请求参数
//     ...args 其余参数
// }

export const usePage = function(emit, config, beforeChange) {
    const pageNo = ref(1); // 当前选中的页数
    const pageSizeRef = config.value.pageSize || ref(20); // 当前选中的每页条数
    const totalCount = ref(0); // 总条数
    async function handleSizeChange() {
        // 合并config发送翻页请求
        getPageData(1); // 将页数重制到第一页

    }
    // 页数组件点击事件
    async function handleCurrentChange(val) {
        // 如果外部有传入指定页码, 更新 pageNo
        if (val) {
            pageNo.value = val;
        }
        // 请求数据
        getPageData(unref(pageNo));

    }
    async function getPageData(currentPage) {
        // 开始请求数据可以在这里 增加loading等一些操作
        emit('changeBefore');
        getData(config.value, currentPage, unref(pageSizeRef))
            .then(res => {
                if (res.code == CODESTATE.SUCCESS) {
                    if (res.data) {
                        const {list, total, pageNum, pageSize} = res.data;
                        // 接口查询回来之后向外emit数据，并且修改分页的配置
                        emit('updateData', list); // 向外emit列表数据
                        pageNo.value = pageNum; // 修改当前的 页数
                        totalCount.value = total;
                    }
                } else {
                    ElMessage.error(res.messageShow);
                }
            }).catch(err => {
                emit('updateData', []); // 向外emit列表数据
                console.error(err);
                ElMessage.error(err.messageShow);
            });
      
    }
    return {
        pageNo,
        pageSizeRef,
        handleSizeChange,
        handleCurrentChange,
        totalCount
    };
};