<template>
    <div>
        <div>
            <ul id="shoppingList" class="iview-admin-draggable-list">
                <li v-for="(item, index) in typeList" :key="index" class="notwrap todolist-item" :data-index="index">
                    {{ item.fullname }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'draggable-list',
        data() {
            return {
                typeList: [],
                attrIdList: [],
                tempIdList: [],
                affordList: [],
                currentId: '',
                currentName: '',
                typeOperate: '',
                enterpriseId: 100
            };
        },
        created() {
            this.enterpriseId = this.$store.state.enterpriseId;
            this.init();
        },
        methods: {
            init() {
                // 聊天设置 =》 客服分配规则，单独传了userType:1,后端返回对齐进行是否可接待的筛选
                const postData = {
                    orgId: this.enterpriseId,
                    userType: 1
                };
                this.$commonApi.getUserInfoList(postData).then(response => {
                    if (response.code === '1') {
                        this.typeList = response.data;
                    }
                });
            }
        }
    };
</script>
<style>
    .iview-admin-draggable-list {
        max-height: 290px;
        overflow-y: scroll;
    }

    .iview-admin-draggable-list li {
        line-height: 37px;
        padding: 0 10px;
    }

    .iview-admin-draggable-list::-webkit-scrollbar {
        width: 4px;
        height: 10px;
        background-color: #c9c9c9;
    }

    .iview-admin-draggable-list::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        border-radius: 2px;
        background-color: #c9c9c9;
    }

    .iview-admin-draggable-list::-webkit-scrollbar-thumb {
        border-radius: 5px;
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
        background-color: #fc8b2f;
    }
</style>
