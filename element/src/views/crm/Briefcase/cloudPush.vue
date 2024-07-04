<template>
    <div class="main-body">
        <cloud-push-homepage v-if="showField===0" :showField.sync="showField" :id.sync="id" :hasChatAuthority.sync="hasChatAuthority" ></cloud-push-homepage>
        <cloud-push-add v-if="showField===1" :showField.sync="showField" :id.sync="id" :hasChatAuthority.sync="hasChatAuthority" :editFIle.sync="editFIle"></cloud-push-add>
    </div>
</template>

<script>
    import CloudPushHomepage from './Components/cloudPushHomepage.vue';
    import CloudPushAdd from './Components/cloudPushAdd.vue';
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'cloudPush',
        components: {
            CloudPushHomepage,
            CloudPushAdd
            // CloudPushDetails,
        },
        computed: {
            ...mapState({
                userId: state => state.userId
            })
        },
        data() {
            return {
                editFIle: {},

                showField: 0,
                id: '',
                hasChatAuthority: true
            };
        },
        created() {
            this.init();
        },
        mounted() {
            // console.error('this.$route.query', this.$route.query);
            if (this.$route.query && this.$route.query.name === 'creat_smart_file') {
                setTimeout(() => {
                    this.id = 0;
                    this.showField = 1;
                    delete this.$route.query.name;
                    this.editFIle = JSON.parse(this.$route.query.file);
                }, 4000);
            }
        },
        methods: {
            // 判断是否开通聊天权限
            init() {
                util.ajax({
                    url: `/new-privilege/user/get?id=${this.userId}`,
                    method: 'POST'
                }).then(res => {
                    if (res.data.code === '1' && res.data.data) {
                        const f = this.$dym.treeDataToList(JSON.parse(localStorage.getItem('roleMenu')) || []).some(v => v.path === 'xhl_chat');
                        this.hasChatAuthority = res.data.data.canChat === 1 && f;
                    }
                });
            }
        }
    };
</script>

<style scoped>

</style>
