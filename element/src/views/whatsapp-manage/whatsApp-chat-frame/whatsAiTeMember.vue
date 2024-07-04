<template>
    <main :style="styleObj">
        <!-- @群成员选择列表 -->
       <section class="aiteWrapList">
                    <ul class="list_aiteMember" >
                        <li v-for="item in RendermemberList" :key="item.id" @click.stop="choseMember(item)"> 
                            <img :src="item.chatWaAvatar" v-if="item.chatWaAvatar" alt="">
                                <svg v-else
                                    aria-hidden="true"
                                    class="waMsgItem-avatar">
                                    <use xlink:href="#custom-visitor-avatar"></use>
                                </svg>
                            <span class="name_list_item">{{item.nickName}}</span>
                        </li>
                    </ul>
                    
        </section>
        <div class="triangle"></div>
    </main>
       
</template>
<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    export default {
        props: ['showAiTeMember', 'styleObj', 'chatInfo', 'whatsAppAccountInfo', 'serchByNickName'],
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId
            })
        },
        data() {
            return {
                memberList: [], // 原数组
                RendermemberList: [] // 筛选数组展示数组
            };
        },
        mounted() {
            document.addEventListener('click', this.closeWrap);
            // console.log(12333);
            this.getGropuMemberDeatil()
        },
        beforeDestroy() {
            document.removeEventListener('click', this.closeWrap);
        },
        methods: {
            // getGropuMemberDeatil
            async getGropuMemberDeatil() {
                const vm = this;
                const res = await util.ajaxWAJson({
                    url: '/whatsapp/chatRecords/getGroupParticipantList',
                    method: 'post',
                    data: {
                        orgId: this.whatsAppAccountInfo.orgId,
                        userId: this.whatsAppAccountInfo.userId,
                        chatWaAccount: this.chatInfo.chatWaAccount,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount
                    },
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        vm.cancelFunc = c;
                    })
                });
                try {
                    this.memberList = res.data.data.groupChatDtoList.filter(ele => !ele.deleteFlag);
                } catch (error) {
                    console.log(error);
                }
            },
            closeWrap(e) {
                if (this.showAiTeMember && e.target !== document.querySelector('.waInputDiv')) {
                    this.$emit('update:showAiTeMember', false);
                }
            },
            choseMember(item) {
                console.log('wwww');
                this.$emit('setChoseMember', item);
                this.$emit('update:showAiTeMember', false);
            }
        },
        watch: {
            memberList(v) {
                // console.log(v);
                this.RendermemberList = v;
            },
            serchByNickName(v) {
                if (v.trim()) {
                    this.RendermemberList = this.memberList.filter(ele => ele.nickName.includes(v.trim()));
                } else {
                    this.RendermemberList = this.memberList;
                }
                // console.log(this.RendermemberList,'sss');
            },
            RendermemberList(v) {
                // 过滤掉 数组中我自己的项目
                v.forEach((ele,i) => {
                    if(ele.participant === this.whatsAppAccountInfo.whatsappAccount) {
                        v.splice(i,1)
                    }
                })
            }
        }
    };
</script>
<style lang="less" scoped>
main{
    position: absolute;
        top: 0;
        transform: translateY(-94%);
        left: 0;
        z-index: 2;
}
.aiteWrapList{
        width: 200px;
        max-height: 230px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        background: #fff;
        border-radius: 4px;
        .list_aiteMember{
            li{
                width: 100%;
                height: 40px;
                padding: 5px 10px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                cursor: pointer;
                // justify-content: center;
                img{
                    width: 30px;
                    // margin-right: 8px;
                    border-radius: 50%;
                }
                .name_list_item{
                    font-size: 12px;
                    line-height: 22px;
                    color: rgba(0, 0, 0, 0.8);
                    font-weight: 700;
                    display: inline-block;
                    flex: 1;
                    overflow:hidden;
                    white-space:nowrap;
                    text-overflow:ellipsis;
                    margin-left: 8px;
                }
                &:hover{
                    background: #f5f7fa;
                }
            }
        }
    }
.triangle {
    width: 0;
    height: 0;
    border-top: 5px solid #fff;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
    transform: translateX(25px);
}
.waMsgItem-avatar {
        width: 30px !important;
        height: 30px !important;
        border-radius: 50%;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
    }
</style>
