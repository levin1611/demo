<template>
    <div>
        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            @select="jumpTo"
            unique-opened
            :collapse-transition="false"
            >
            <template v-for="(item, index) in router_map.filter(item => item.path !== '/customs_data')" :key="index">
                
                <!-- <el-menu-item v-if="item.children && item.children.length === 1 && !item.children[0].children &&  ['home', 'mail_home', 'index'].includes(item.path)" -->
                <el-menu-item :index="item.name">
                    <i>
                        <el-icon><icon-menu /></el-icon>
                    </i>
                    <span class="layout-text">{{ $t(item.title.i18n) }}</span>
                </el-menu-item>
                <!-- <el-sub-menu v-else
                         :key="item.id"
                         :index="item.name"
                         popper-class="side-collapse-menu-popper clear-menu-default"
                         ref="submenu">
                    <template slot="title">
                        <el-icon><icon-menu /></el-icon>
                            <span :title="$t(item.title.i18n)"
                                class="layout-text">{{ $t(item.title.i18n) }}</span>
                            <Icon custom="custom-menu-arrow-forward"
                                class="side-collapse-menu-arrow"></Icon>
                    </template>
                    <template v-for="child in item.children" :key="child.id">
                        <el-menu-item
                                  :index="child.children ? child.children[0].name : child.name">
                            <span :key="child.id"
                                  :title="$t(item.children[0].title)">{{ $t(item.children[0].title) }}</span>
                        </el-menu-item>
                    </template>
                </el-sub-menu> -->
            </template>
            <!-- <el-sub-menu index="1">
                <template #title>
                    <el-icon><location /></el-icon>
                    <span>Navigator One</span>
                </template>
                <el-menu-item-group>
                    <template #title><span>Group One</span></template>
                    <el-menu-item index="1-1">item one</el-menu-item>
                    <el-menu-item index="1-2">item two</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="Group Two">
                    <el-menu-item index="1-3">item three</el-menu-item>
                </el-menu-item-group>
                <el-sub-menu index="1-4">
                    <template #title><span>item four</span></template>
                    <el-menu-item index="1-4-1">item one</el-menu-item>
                </el-sub-menu>
            </el-sub-menu>
            <el-menu-item index="/home">
                <el-icon><icon-menu /></el-icon>
                <template #title>首页</template>
            </el-menu-item>
            <el-menu-item index="/login">
                <el-icon><document /></el-icon>
                <template #title>登录</template>
            </el-menu-item>
            <el-menu-item index="/pages1">
                <el-icon><setting /></el-icon>
                <template #title>page1</template>
            </el-menu-item>
            <el-menu-item index="/pages2">
                <el-icon><setting /></el-icon>
                <template #title>page2</template>
            </el-menu-item> -->
        </el-menu>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Document, Menu as IconMenu, Location, Setting} from '@element-plus/icons-vue';
import { menuList } from '@/router/routerMap';
import { HANDLE_MENU_JSON } from '@/router/utils';
const isCollapse = ref(false);
const router = useRouter();

let router_map = HANDLE_MENU_JSON(menuList).children;

console.log(router_map)
const jumpTo = (name, path, cc) => {
    console.log(name, path, cc)
    router.replace(cc.index);
}
// const itemTitle = (item) => {
//     if (typeof item.title === 'object') {
//         return $t(item.title.i18n);
//     } else {
//         return item.title;
//     }
// }
console.log(222)
</script>
<style scoped>
</style>