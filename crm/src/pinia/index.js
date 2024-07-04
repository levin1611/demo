import { createPinia } from 'pinia';
import piniaPluginPersist from 'pinia-plugin-persist';

// 创建Pinia实例
const store = createPinia();
store.use(piniaPluginPersist);

export default store;