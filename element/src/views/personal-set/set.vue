<template>
    <Row style="height: 100%">
        <ElCol :span="4" class="personal-set-shrinkable-menu">
            <Menu :default-active="activeName" @select="change_view" width="auto" class="side-menu universal-set-menu"
                  ref="universal_set_menu">
                <div style="height: 30px;"></div>
                <MenuItem index="passwordSet" class="piwik_passwordTag">{{$t('per_setting.accountInfo')}}</MenuItem>
                <!-- <MenuItem v-if="!isWAPersonalEdition" index="homepageSet" class="piwik_homepageTag">{{$t('per_setting.homepageSet')}}</MenuItem> -->
                <MenuItem index="langSet" class="piwik_langTag">{{$t('per_setting.langSet')}}</MenuItem>
                <MenuItem v-if="!isWAPersonalEdition" index="cardName" class="piwik_langTag">{{$t('menu.my_name_card')}}</MenuItem>
            </Menu>
        </ElCol>
        <ElCol :span="20" :class="{'if-cardName': activeName !== 'cardName'}" style="height: 100%">
            <template>
                <component :is="activeName" ref="resignComponents" :params="config"></component>
            </template>
        </ElCol>
    </Row>
</template>

<script>
    import { mapGetters } from 'vuex';
    import passwordSet from './change-password.vue';
    import homepageSet from './personal-settings.vue';
    import langSet from './lang-switch.vue';
    import cardName from './my-name-card.vue';

    export default {
        name: 'set',
        components: {
            passwordSet,
            homepageSet,
            langSet,
            cardName
        },
        computed: {
            ...mapGetters([
                'isWAPersonalEdition'
            ])
        },
        data() {
            return {
                activeName: 'passwordSet',
                config: {}
            };
        },
        created() {
            const params = this.$route.params;
            if (params.name) {
                if (params.action && params.action === 'edit') {
                    this.config = params;
                }
                this.activeName = params.name;
            } else {
                const hash = window.location.hash;
                const name = hash.split('?');
                if (name.length > 1) {
                    const a = name[1].split('&').map(v => {
                        const b = v.split('=');
                        return {
                            name: b[0],
                            val: b[1]
                        };
                    }).find(v => v.name === 'activeName');
                    if (a) {
                        this.activeName = a.val;
                        this.$router.replace({ name: 'set' });
                    }
                }
            }
        },
        methods: {
            change_view(name) {
                this.activeName = name;
                this.config = {};
            }
        }
    };
</script>
<style lang="scss" scoped>
    .if-cardName {
        padding:30px 0 0 30px ;
    }
</style>
<style lang="less">
    .personal-set-shrinkable-menu {
        height: 100%;

        .side-menu {
            height: 100%;
            border-right: 1px solid #f5f5f5;
            line-height: 18px;
        }
        .el-menu-item {
            padding:0 30px;
        }
    }
</style>
