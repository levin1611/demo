<template>
    <div>
        <Modal :visible="visible"
               v-if="visible"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               :lock-scroll="false"
               width="600px"
               height="500px"
               ref="currentModal"
               @close="close"
               class="addressBookModal">

            <div slot="title">
                <span style="margin-right: 5px;max-width: calc(100% - 80px);overflow: hidden;text-overflow: ellipsis; white-space: nowrap; display: inline-block;">{{$t('mailMarketing.newMarketing.selectAddressBook')}}</span>
            </div>

            <div class="previewContent">
                <div class="address-book-filter">
                    <!-- 邮件搜索 -->
                    <Input type="text"
                           v-model="keyword"
                           style="width:300px;"
                           maxlength="150"
                           autocomplete="off"
                           clearable
                           :placeholder="$t('mailMarketing.newMarketing.enterAddressBook')"
                           @clear="handleClear"
                           @keyup.enter.native="handleKeyUpEnter">
                    <i slot="suffix"
                       ref="timelineKeyWordSearch"
                       @click="handleSearch"
                       class="el-input__icon el-icon-search"></i>
                    </Input>
                    <Button class="" type="primary" @click.stop="newAddress" v-if="showBtns.newBtn">{{$t('mailMarketing.new')}}</Button>
                </div>
                <!-- 表格列表 -->
                <Table :data="tableList"
                       @selection-change="handleSelectionChange"
                       :height="tableHeight">
                    <TableColumn type="selection" width="45"> </TableColumn>
                    <TableColumn prop="addrName" :label="$t('mailMarketing.newMarketing.addressBookName')" :show-overflow-tooltip="true"></TableColumn>
                    <TableColumn prop="contactCount" :label="$t('mailMarketing.newMarketing.numberContacts')" :show-overflow-tooltip="true"></TableColumn>
                    <TableColumn prop="createTime" :label="$t('mailMarketing.newMarketing.updateTime')" :show-overflow-tooltip="true">
                        <template slot-scope="{row}">
                            {{new Date(row.createTime).format('yyyy-MM-dd hh:mm:ss')}}
                        </template>
                    </TableColumn>
                </Table>
            </div>

            <div slot="footer">
                <!-- 分页 -->
                <Page
                        small
                        :total="total"
                        :current-page.sync="currentPageNum"
                        :page-size="pageSize"
                        :page-sizes="[20, 50, 100]"
                        class="pageWrap-right addressBookModalPage"
                        layout="total, prev, pager, next, sizes, jumper"
                        @current-change="pageChange"
                        @size-change="pageSizeChange"
                        :pager-count="5"
                        transfer
                >
                </Page>
                <!--底部操作按钮-->
                <div>
                    <Button class="" type="default" @click.stop="close">{{$t('mailMarketing.cancel')}}</Button>
                    <Button class="" type="primary" @click.stop="sure" :disabled="!selectList.length">{{$t('mailMarketing.confirm')}}</Button>
                </div>
            </div>
        </Modal>

    </div>
</template>
<script>
import util from '@/libs/util';
import { mapState, mapGetters } from 'vuex';
import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
import Search from "@/views/main-components/search-input/search-input";
export default{
    name: 'selectAddressBook',
    props: {
        visible: {
            type: Boolean
        },
        recipients_to: {
            type: Array
        }
    },
    data () {
        return {
            total: 0,   // 列表数据总条数
            currentPageNum: 1,  //当前页码
            pageSize: 20,   // 当前页显示条数
            tableList: [],
            keyword: '',
            selectList: [],
        }
    },
    components: {Search},
    computed: {
        ...mapState({
            enterpriseId: 'enterpriseId',
            userId: 'userId',
            button_list: state => state.app.button_list
        }),
        showBtns () {
            const ids = BUTTON_IDS.emailMarketing.addressBook;
            return {
                newBtn: !HANDLE_BUTTON(ids.new, this.button_list),
            };
        },
        tableHeight() {
            return 500 - 50;
        },
    },
    mounted () {
        this.getDataList();
    },
    methods: {
        close () {
            this.$emit('update:visible', false);
        },
        sure () {
            this.$emit('update:visible', false);
            this.$emit('update:recipients_to', this.selectList)
        },
        /** 搜索关键词改变 */
        handleKeyUpEnter() {
            this.getDataList()
        },
        // 点击放大镜搜索时触发
        handleSearch() {
            if (this.keyword) {
                this.getDataList()
            } else {
                this.$Message.warning('搜索关键词不可为空');
            }
        },
        // 点击清空时触发
        handleClear () {
            this.getDataList()
        },
        handleSelectionChange(val) {
            this.selectList = val;
        },
        // 翻页
        pageChange(num) {
            this.currentPageNum = num;
            this.getDataList();
        },
        /** 改变表格每页展示数据量 */
        pageSizeChange(size) {
            this.pageSize = size;
            this.getDataList();
        },
        // 获取地址簿列表数据
        getDataList () {
            let data = {
                createUserId: this.userId,
                orgId: this.enterpriseId,
                addrName: this.keyword,
                type: 1,
                pageNo: this.currentPageNum,
                pageSize: this.pageSize
            }
            util.ajaxEmailMarketingJson({
                url: '/business/address/book/findAddressListByPage',
                method: 'post',
                data
            }).then(response => {
                if (response.data.code === 1) {
                    let result = response.data.data;
                    this.tableList = result.list;
                    this.total = result.totalSize;
                    if (!response.data.data.list.length && result.pageNo > 1) {
                        this.getDataList();
                    }
                } else {
                    this.$Message.error(response.data.msg);
                }
            }).catch(() => {
                this.$Message.error('请求异常');
            });
        },
        // 调用新建地址簿的弹窗
        newAddress () {
            this.close();
            const { href } = this.$router.resolve({
                name: "address_book",
            });
            window.open(href, '_blank');
        },
        // 此方法是新建地址簿页面的回调，暂时没有任何用处,主要看后期如果没有参数抛出 直接删掉
        refreshData () {

        }
    },
    watch: {},
}
</script>
<style lang="less">
    @import url('selectAddressBook.less');
</style>
<style lang="less" scoped>

</style>