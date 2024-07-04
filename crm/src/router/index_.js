import { createRouter, createWebHashHistory } from 'vue-router';
import {
    routers
} from './router_';
let routes = [...routers];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;