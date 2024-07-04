<template>
    <Modal :visible="visible"
           width="886px"
           :append-to-body="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           @close="handleModalClose" >
           <Container :style="{height: tableHeight}">
                <Component :is="currentComponent.component"
                    v-if="refreshFlag"
                    :kind="kind"
                    :currentCurrency="currentCurrency"
                    :department_list="department_list"
                    :user_list="user_list"
                    class="main_component_item">
                </Component>
           </Container>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import tableIndex from './new-tables/tableIndex';
    import tableCompletion from './new-tables/tableCompletion';
    export default {
        name: 'enlargeModal',
        props: [
            'visible',
            'kind',
            'currentCurrency',
            'department_list',
            'user_list'
        ],
        components: [
            tableIndex,
            tableCompletion
        ],
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width,
                button_list: state => state.app.button_list,
                config: state => state.dashboard.config
            }),
            tableHeight() {
                if (this.kind === 'completion') {
                    return '220px';
                }
                return '250px';
            }
            // view() {
            //     return this.currentComponent ? this.currentComponent.component : 'tableCompletion';
            // }
        },
        data() {
            return {
                refreshFlag: true,
                currentComponent: {
                    component: 'tableCompletion'
                }
            };
        },
        created() {
        },
        methods: {
            handleModalClose() {
                this.$emit('update:visible', false);
            }
        },
        watch: {
            visible: {
                handler(val) {
                    console.log(val);
                    if (val) {
                        this.currentComponent = this.config.find(item => item.i === this.kind);
                        this.refreshFlag = false;
                        this.$nextTick(() => {
                            this.refreshFlag = true;
                        });
                        console.log(this.currentComponent);
                    } else {
                        this.currentComponent = {};
                    }
                }
            }
        }
    };
</script>

<style>

</style>
