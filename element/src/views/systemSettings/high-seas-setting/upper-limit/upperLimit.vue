<template>
  <div>
    <div class="seas-set-item">
      <div class="seas-set-item-title" >{{$t('highSeasSetting.inquriry.title')}}</div>
      <el-switch v-model="isSwitchOpen" :disabled="switchDisabled" @change="setUserLimit" v-loading="switchDisabled"></el-switch>
      <div style="font-size: 12px;margin-top: 10px">{{beizhu}}</div>
    </div>
    <!-- 新建组件 -->
    <upperTable
      v-if="isSwitchOpen"
      ref="upLimTable"
    >
      <div style="display: flex;justify-content: space-between">
        <div class="seas-set-item-title">{{$t('highSeasSetting.inquriry.setTitle')}}</div>
        <Button
          type="primary"
          @click="addUpperLimit"
        >{{$t('crm.Table.newCompany')}}</Button>
      </div>
    </upperTable>
    <selfModal
      ref="upLimModal"
      modalType="create"
      @success="updateTable"
    ></selfModal>
  </div>
</template>

<script>
    import upperTable from './components/upperTable';
    import selfModal from './components/uppertModal';
    import { getSwitchStauts, setSwitchStauts } from '@/api/systemSettings/high-seas-setting/upperLimit';
    export default {
        name: 'upperLimit',
        components: {
            upperTable,
            selfModal
        },
        computed: {
            beizhu() {
                return this.isSwitchOpen ? this.$t('highSeasSetting.inquriry.beizhuOpen') : this.$t('highSeasSetting.inquriry.beizhuClose');
            }
        },
        data() {
            return {
                switchDisabled: true,
                isSwitchOpen: false
            };
        },
        async beforeMount() {
            this.init();
        },
        methods: {
            addUpperLimit() {
                this.$refs.upLimModal.show();
            },
            // 编辑客户上限配置
            async setUserLimit(flag) {
                setSwitchStauts({
                    isOpen: Number(flag)
                });
            },
            updateTable() {
                this.$refs.upLimTable.init();
            },
            async init() {
                this.switchDisabled = true;
                // 获取客户上限配置
                const data = await getSwitchStauts();
                if (data.code === '1') {
                    this.isSwitchOpen = data.data && (data.data.isOpen === 1);
                }
                this.switchDisabled = false;
            }
        }
    };
</script>

<style lang="scss" scoped>
    @import "~@/styles/moduleScss/upperLimit/overStory.scss";
</style>
