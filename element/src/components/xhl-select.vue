<template>
  <div>
    <Select
      v-model="value"
      :disabled="disabled"
      :multiple="multiple"
      :clearable="clearable"
      :size="size"
      :style="styleCustom"
    >
      <Option
        v-for="(item, index) in followUpStatus"
        :value="item[dataModel.id]"
        :label="item[dataModel.label]"
        :key="index"
      >
      </Option>
    </Select>

    <!-- 本地数据使用方法 -->
    <!--
      <xhl-select
        v-model="contactsFormForShow.createWay"
        :followUpStatusData="createWayList"
        styleCustom="width:450px"
      ></xhl-select>
     -->
    <!-- 异步数据使用方法 -->
    <!-- <xhl-select
      v-model="contactsFormForShow.followUpId"
      :isSync="true"
      url="/crm/attr/getList"
      :params="{ typeId: 7 }"
      post-method="post"
      :errorText="this.$t('crm.Html.error_getFollowUpStatusList')"
      :formatData="formatFollowUp"
      :dataModel="{
        id: 'attrId',
        label: 'attrName',
      }"
    ></xhl-select> -->
  </div>
</template>
<script>
/**
 * 下拉列表组件，支持多选，单选
 * 支持异步数据和同步数据的兼容使用
 * 支持option数据结构的定制
 * 支持接口返回数据的接口定制
 */
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'xhlSelect',
        model: {
            prop: 'modelVal',
            event: 'change'
        },
        props: {
            size: {
                type: String,
                default: 'small'
            },
            clearable: {
                type: Boolean,
                default: true
            },
            // 接收的model传参变量，与model中的prop值一致，必传
            modelVal: {
                type: [String, Number, Array],
                default: ''
            },
            // 默认的数据源，非必传
            followUpStatusData: {
                type: [Array, String],
                default: ''
            },
            multiple: {
                type: Boolean,
                default: false
            },
            // 是否未异步获取数据，非必传
            isSync: {
                type: Boolean,
                default: false
            },

            // 请求下拉数据的接口,isSync为true时，必传
            url: String,

            // 接口传参
            params: {
                type: Object,
                default: () => {
                    return {
                        typeId: 7
                    };
                }
            },
            // 请求方式
            postMethod: {
                type: String,
                default: 'get'
            },
            // 请求失败之后的提示语
            errorText: {
                type: String,
                default: '请求失败'
            },
            // 下拉列表的数据模型
            dataModel: {
                type: [Object],
                default: () => {
                    return {
                        id: 'value',
                        label: 'label'
                    };
                }
            },

            // 格式化数据，有些数据源需要特殊处理, 此方法需要返回处理后的数据
            formatData: {
                type: [Function],
                default: (data) => {
                    return data;
                }
            },

            // 犹豫接口返回的数据结构不一样，所以需要定制取数据的接口
            dataListName: {
                type: String,
                default: 'data'
            },

            // 样式自定义
            styleCustom: {
                type: String,
                default: ''
            },

            disabled: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                followUpStatus: []
            };
        },
        computed: {
            ...mapState({
                enterpriseId: (state) => state.enterpriseId,
                userId: (state) => state.userId
            }),
            value: {
                get() {
                    return this.modelVal;
                },
                set(value) {
                    this.$emit('change', value);
                }
            }
        },
        mounted() {
            this.value = this.modelVal;
            if (this.isSync) {
                this.get_followUp_status();
            } else {
                this.followUpStatus = this.followUpStatusData;
            }
        },
        methods: {
            get_followUp_status() {
                const obj = this.postMethod === 'get' ? 'params' : 'data';
                util
                    .ajax({
                        url: this.url,
                        method: this.postMethod,
                        [obj]: Object.assign(this.params, {
                            orgId: this.enterpriseId
                        })
                    })
                    .then((response) => {
                        if (response[this.dataListName].code === '1') {
                            this.followUpStatus = this.formatData(response[this.dataListName].data);
                        } else {
                            this.$Message.error(this.errorText);
                        }
                    });
            }
        }
    };
</script>
