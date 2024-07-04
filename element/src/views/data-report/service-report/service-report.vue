<template>
    <Container style="height:100%">
        <Sider hide-trigger style="width: 130px; min-width: 130px; max-width: 130px; flex: 0 0 130px;">
            <Menu default-active="survey" @select="handleVie" style="height:100%" width='130px'>
                <MenuItem index="survey">{{$t('serviceReport.survey')}}</MenuItem>
                <MenuItem index="serviceQuality">{{$t('serviceReport.serviceQuality')}}</MenuItem>
            </Menu>
        </Sider>
        <Container>
            <keep-alive>
                <component
                        v-bind:is="view"
                        :authorized_export="authorized_button.service"
                        @proForm="proForm">
                </component>
            </keep-alive>
        </Container>
    </Container>
</template>
<script>
    import survey from './survey/survey';
    import serviceQuality from './serviceQuality-report/service-quality';
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'service_report',
        components: { survey, serviceQuality },
        computed: {
            ...mapState({
                button_list: state => state.app.button_list
            }),
            authorized_button() {
                return {
                    service: !HANDLE_BUTTON(BUTTON_IDS.dataReport.service, this.button_list)
                };
            }
        },
        created() {

        },
        data() {
            return {
                view: 'survey'
            };
        },
        methods: {
            handleVie(v) {
                this.view = v;
            },
            proForm(params) {
                // this.view = params[0];
                // this.productionEditing = params[1];
                // this.productionEditingId = params[2];
            }

        }
    };
</script>
<style lang="less">
    .account-head-title {
        font-size: 16px;
    }
</style>
