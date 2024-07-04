<template>
    <el-container>
        <el-container v-resize="resize">
            <menuList></menuList>
            <el-main class="el-main-demo">
                <menuHeader/>
                <router-view v-slot="{ Component }">
                    <transition  name="fade-transform" mode="out-in">
                        <keep-alive :max="10">
                            <component :is="Component"></component>
                        </keep-alive>
                    </transition>
                </router-view>
                <!-- <div style="padding: 10px">
                    <transition name="fade-transform" mode="out-in">
                        <keep-alive>
                            <router-view />
                        </keep-alive>
                    </transition>
                </div> -->
            </el-main>
        </el-container>
    </el-container>
</template>
<script setup>
import menuHeader from './menu-header.vue';
import menuList from './menu-list.vue';
const resize = () =>{
    console.log('resize自定义指令')
}
</script>
<style scoped>

</style>