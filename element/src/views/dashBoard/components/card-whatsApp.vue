<template>
  <Card :body-style="{padding: '18px 20px',height: '144px'}" class="_b_r">
    <div class="dashboard-title" style="display: inline-block;margin-right: 5px">{{$t('waHomeSearch.title')}}</div>
    <!--       <HelpTip :title="$t('countries.helpTip.whatsAppSearch')"></HelpTip>-->
    <Tooltip :content="$t('waHomeSearch.helpTips')" placement="right">
      <Icon custom="custom custom-tip"></Icon>
    </Tooltip>
    <div class="whatsApp-block">
      <div>
        <div style="display: flex;">
          <ElInput :placeholder="$t('waHomeSearch.searchPlaceholder')" v-model="whatsApp" @input="verifyWA" style="width: 260px;height: 36px;margin-right: 12px;line-height: 38px"></ElInput>
          <Button class="whatsApp-home-search" @click="searchWA" :disabled="isLegal" type="primary">{{$t('customData.search')}}</Button>
        </div>
        <div class="whatsApp-block-tips" :class="{errorTip: isError}">{{tips}}</div>
      </div>
    </div>
  </Card>
</template>

<script>
    import comparisonMixins from './card-whatsApp/base';
    export default {
        name: 'WhatsApp-search',
        mixins: [comparisonMixins],
        data() {
            return {
                whatsApp: '',
                whatsAppTemp: [], // 查询时存储去除非数字后前1-4位的值
                tips: '',
                isLegal: true, // 输入是否合法
                isError: false
            };
        },
        methods: {
            verifyWA(val) {
                // 验证WhatsApp格式 仅支持填写数字、+号、空格信息
                console.log('verifyWA', val);
                // eslint-disable-next-line no-useless-escape
                const reg = /^[\+\d\s]+$/;
                if (val && !reg.test(val)) {
                    this.tips = this.$t('waHomeSearch.supportSearchTips');
                    this.isLegal = true;
                    this.isError = true;
                } else {
                    this.tips = '';
                    this.isLegal = false;
                    this.isError = false;
                }
            },
            searchWA() {
                this.isError = false;
                this.whatsAppTemp = this.whatsApp.replace(/[^0-9]/ig, '');
                console.log('this.whatsAppTemp', this.whatsAppTemp);
                let isMatch = false;
                // 只依次取前1到4位匹配
                this.tips = this.$t('waHomeSearch.waHomeCountry');
                for (let i = 1; i < 5; i++) {
                    const temp = this.getItem(i);
                    console.log('getItem-----', temp);
                    if (temp) {
                        this.comparison.map(item => {
                            if (`${item.code}` === temp) {
                                isMatch = true;
                                const str = `${item.country}(${item.code});`;
                                this.tips += str;
                            }
                        });
                    }
                }
                if (!isMatch) {
                    this.tips = this.$t('waHomeSearch.noSearchDataTips');
                }
            },
            // 获取输入值的指定前几位
            getItem(index) {
                const t = 0;
                const res = this.recursionVal(t, index);
                return res;
            },
            recursionVal(i, L) {
                if ((i + L) > this.whatsAppTemp.length) {
                    return false;
                }
                const temp = this.whatsAppTemp.slice(i, i + L);
                const reg = /^[0-9]+$/;
                if (reg.test(temp)) {
                    return temp;
                } else {
                    i++;
                    this.recursionVal(i, L);
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
.whatsApp-block {
  padding-top: 20px;
  display: flex;
  justify-content: center;
  /deep/ .is-disabled {
    border-color: #E7EcF2;
    background: #E7ECF2;
    color: rgba(110,129,154,0.40);
    border-radius: 4px;
  }
  & input {
    height: 36px;
    line-height: 36px;
  }
  &-tips {
    margin-top: 5px;
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    text-align: left;
  }
  .errorTip {
    color: #ea4335;
  }
}

.dashboard-title {
    font-size: 20px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.8);
}
</style>
