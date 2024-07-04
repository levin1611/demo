<script setup>
import CSSVariables from '@/style/js.module.scss';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
const { elnamespace } = CSSVariables;
import Cookies from 'js-cookie';
import { useUserStore } from '@/pinia/modules/user';
const store = useUserStore();
if (localStorage.getItem('current_tenant')) {
    const tenant = JSON.parse(localStorage.getItem('current_tenant'));
    // 设置store的值
    store.$patch({
        orgId: tenant.orgId,
        userId: tenant.userId,
        accessToken: Cookies.get('accessToken'),
        larkId: tenant.larkId
    });
}

</script>

<template>
    <el-config-provider :namespace="elnamespace" :locale="zhCn">
        <div class="app-main">
            <RouterView v-slot="{ Component }">
                <Suspense>
                    <component :is="Component"></component>
                </Suspense> 
            </RouterView>
        </div>

        <!-- teleport 容器 -->
        <div id="permSys-teleport-container"></div>
    </el-config-provider>
</template>

<style lang="scss">
    .app-main {
        width: 100%;
        height: 100%;
    }
</style>
