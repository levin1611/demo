import { defineStore } from 'pinia';
import { queryOptionByFieldIds } from '@/api/common.js';
export const useSelectOptions = defineStore('selectOptions', { 
    state: () => {
        return {
            options: []
        };
    },
    getters: {
        optionsMap: (state) => {
            return state.options;
        }
    },
    actions: {
        getOptions(data) {
            queryOptionByFieldIds(data).then(res => {
                if (res.code === 10000) {
                    this.options = res.data;
                } else {
                    ElMessage.error(res.messageShow);
                }
            });
        }
    }
});