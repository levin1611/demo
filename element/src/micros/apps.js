import store from '@/store';
import { router } from '@/router/index';
import actions from './actions'; // 定义全局状态，子父项目均可用
import base from './base';
import filters from './filter';
import components from './components';
import { childRules } from './childRules.js'; // 引入子应用激活规则
import { CHILDSTORE } from '@/micros/CHILDSTORE.js';

const getActiveRule = function(urls) {
    return (location) => {
        // console.log(location);
        return urls.some(ele => location.hash.startsWith(ele));
    };
};

const props = {
    router,
    store,
    ...actions,
    base,
    filters,
    components,
    CHILDSTORE
};

const apps = [];

childRules.forEach(item => {
    apps.push({
        name: item.name,
        entry: item.entry,
        container: item.container,
        activeRule: getActiveRule(item.rule),
        props: { data: { ...props } },
        loader: (v) => {
            console.log(v, '输出v');
            if (v) {
                if (document.querySelector('#mask_child_loading')) {
                    document.querySelector('#mask_child_loading').remove();
                }
                const div = document.createElement('div');
                div.innerHTML = `<div class="el-loading-spinner">
                <svg viewBox="25 25 50 50" class="circular">
                <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
                </svg>
                </div>`;
                div.id = 'mask_child_loading';
                document.querySelector('.single-page')&&document.querySelector('.single-page').append(div);
            } else {
                if (document.querySelector('#mask_child_loading')) {
                    document.querySelector('#mask_child_loading').remove();
                }
            }
        }
    });
});

export { apps };
