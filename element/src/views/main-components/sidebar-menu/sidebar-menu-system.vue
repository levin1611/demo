<template>
  <div :style="{background: bgColor}" class="side-shrinkable-menu clear-menu-default">
    <slot name="top"></slot>
    <Menu :default-active="currentPageName" :unique-opened="true" collapse ref="sideMenuSystem" @select="handleChange" class="side-menu side-collapse-menu">
      <template v-for="item in menuList.filter(item => item.path !== '/customs_data')">
        <template v-if="!item.children.length">
          <MenuItem :key="item.id" :index="item.name" :disabled="forbidden" @contextmenu.native.prevent="show" @click.native.stop="newContextmenu(item.name)" @click.native.right="target(item.name)" :class="{'side-menu-item-active': activeRouteNames.includes(item.name)}">
          <Icon :custom="item.icon" :size="iconSize" :class="item.class"></Icon>
          <span :title="itemTitle(item)" :style="{display: menuExpand ? 'inline-block' : 'none'}" class="layout-text">{{ itemTitle(item) }}</span>
          </MenuItem>
        </template>
        <template v-else>
          <Submenu :key="item.id"
                   :index="item.name"
                   popper-class="side-collapse-menu-popper clear-menu-default"
                   ref="submenu"
                   :class="{'side-menu-item-active': activeRouteNames.includes(item.name)}">
            <template slot="title">
              <Icon :custom="item.icon" :size="iconSize" :class="item.class"></Icon>
              <span :title="itemTitle(item)" :style="{display: menuExpand ? 'inline-block' : 'none'}" class="layout-text">{{ itemTitle(item) }}</span>
              <Icon custom="custom-menu-arrow-forward" class="side-collapse-menu-arrow"></Icon>
            </template>
            <template v-for="child in item.children">
              <MenuItem  :key="child.id" :disabled="forbidden" :index="child.name" @contextmenu.native.prevent="show" :style="{display:menuExpand ? 'flex':'none', 'padding-left': '55px'}" @click.native.right="target(child.name)"  @click.native="newContextmenu(child.name)" @mouseenter.native="mouse(true)" @mouseleave.native="mouse(false)">
              <span :key="child.id" :title="itemTitle(child)">{{ itemTitle(child) }}</span>
              </MenuItem>
            </template>
          </Submenu>
        </template>
      </template>
    </Menu>
  </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    /* eslint-disable no-prototype-builtins */

    export default {
        name: 'sidebarMenu',
        props: {
            forbidden: Boolean,
            menuExpand: {
                type: Boolean,
                default: false
            },
            menuList: {
                type: Array,
                required: true
            },
            theme: {
                type: String,
                default: 'dark',
                validator(val) {
                    return util.oneOf(val, ['dark', 'light']);
                }
            },
            beforePush: {
                type: Function
            }
        },
        data() {
            return {
                iconSize: 18
                // contextMenuVisible: false,
                // targetPath: '',
                // keyDownType: ''
                // openNewTabTime: 0 // 记录最近一次新标签页打开目录的时间戳
            };
        },
        computed: {
            ...mapState({
                bi_report_menu: 'bi_report_menu',
                currentPageName: state => state.app.currentPageName,
                lang: state => state.app.lang,
                // 当前路由 name 数组
                activeRouteNames: state => state.app.activeRouteNames
            }),
            bgColor() {
                return this.theme === 'dark' ? '#495060' : '#fff';
            }
            // openedNames() {
            //     return this.getOpenedNamesByActiveName(this.currentPageName);
            // }
        },
        methods: {
            // getOpenedNamesByActiveName(name) {
            //     return this.$route.matched.map(item => item.name).filter(item => item !== name);
            // },
            show() {},
            mouse(flag) {
                // 触发 menu 事件
                this.$emit(flag ? 'subMenuOpen' : 'subMenuClose');
            },
            newContextmenu(path, e) {
                if (path === 'dataMovement' || !this.forbidden) return false;
                this.target(path);
            },
            target(path) {
                if (this.bi_report_menu.hasOwnProperty(path)) {
                    window.open(this.bi_report_menu[path]);
                    // 下面是恢复菜单的active项
                    this.$nextTick(() => {
                        if (this.$refs.sideMenuSystem) {
                            this.$refs.sideMenuSystem.activeIndex = this.currentPageName;
                        }
                    });
                    return;
                }

                // this.targetPath = path;

                const targetUrl = this.$router.resolve({
                    name: path
                });
                window.open(targetUrl.href, '_blank');
            },
            async handleChange(name, params) {
                // 新窗口打开时必然会触发 menu select , 且 select 更早执行, 为解决新窗口打开时原标签页也跳转的问题, 增加如下代码
                // 记录触发 menu select 的时间戳
                // const nowTime = Date.now();
                // 等待可能存在的"新窗口打开"完成, 再往下执行
                await new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    });
                });
                // 如果新窗口打开的时间和当前触发 select 的时间很接近, 认为当前是新窗口打开, 停止向下执行
                // if (Math.abs(nowTime - this.openNewTabTime) < 50) {
                //     return;
                // }

                console.log('切换菜单', name, params);
                // 修正选中项
                if (this.$refs.sideMenuSystem) {
                    this.$refs.sideMenuSystem.activeIndex = this.currentPageName;
                }
                if (this.bi_report_menu.hasOwnProperty(name)) {
                    window.open(this.bi_report_menu[name]);
                    // // 下面是恢复菜单的active项
                    // this.$nextTick(() => {
                    //     if (this.$refs.sideMenu) {
                    //         this.$refs.sideMenu.activeIndex = this.currentPageName;
                    //     }
                    // });
                    return;
                }

                // this.contextMenuVisible = false;
                let willpush = true;
                if (this.beforePush !== undefined) {
                    if (!this.beforePush(name)) {
                        willpush = false;
                    }
                }
                if (willpush) {
                    // 如果要跳转的页面就是当前页, 则先跳转到空白页, 再正常跳转, 避免报错
                    if (this.$route.name === name) {
                        // 跳转到 refresh 中转页, 中转页根据传入 params 带参数跳转到指定 name
                        this.$router.push({
                            name: 'refresh',
                            params: Object.assign({
                                name
                            }, params)
                        });
                        return;
                    }
                    // 否则直接跳转到目标页
                    this.$router.push({
                        name,
                        params
                    });
                }
            },
            itemTitle(item) {
                if (typeof item.title === 'object') {
                    return this.$t(item.title.i18n);
                } else {
                    return item.title;
                }
            }
            // keyDown() {
            //     const key = event.key;
            //     if (key === 'Alt' || key === 'Meta') {
            //         this.forbidden = true;
            //     }
            // },
            // keyUp() {
            //     const key = event.key;
            //     if (key === 'Alt' || key === 'Meta') {
            //         this.forbidden = false;
            //     }
            // },
            // winBlur() {
            //     this.forbidden = false;
            // }
        },
        watch: {
            // forbidden(val) {
            //     console.log('----------->', val);
            // }
        },
        created() {
            // window.addEventListener('blur', this.winBlur);
            // document.addEventListener('keydown', this.keyDown);
            // document.addEventListener('keyup', this.keyUp);
        },
        beforeDestroy() {
            // document.removeEventListener('keydown', this.keyDown);
            // document.removeEventListener('keyup', this.keyUp);
            // window.removeEventListener('blur', this.winBlur);
        }
    };
</script>

<style lang="less" scoped>
@import "./styles/menu.less";
</style>
