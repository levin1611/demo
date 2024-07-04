<template>
  <div class="tag-input">
    <div class="form-title-font form-label" style="line-height:24px;">{{title}}</div>
    <div slot="prefix" class="tag-list">
        <Tag :color="tagAttr[index].isEmail?'#f7f7f7':'#ed4014'" v-for="(tag,index) in tagList" :key="tag.emailAddress">
            <RecipientPoptip
                fromFlag="tagInput"
                :currentPage="fromFlag"
                v-if="fromFlag === 'writeMail' || fromFlag === 'writeMailFloatWindow'"
                :currentInquiryId="tag.tagStatus ? tag.tagStatus.inquiryId: ''"
                v-bind="$attrs"
                v-on="$listeners"
                :params="{row: tag.tagStatus}"
            >
            </RecipientPoptip>
            <span class="tag-content" v-show="!tagAttr[index].editting" @click="tagContent" :title="tag.tagName">{{tag.tagName | filterTagName}}</span>
        </Tag>
    </div>
  </div>
</template>
<script>
    import Vue from 'vue';
    // const reg = /<?[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+>?/i;
    const reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/i;

    export default {
        name: 'tag_input',
        props: {
            taglist: {
                type: Array,
                default() {
                    return [];
                }
            },
            type: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: '收件人'
            },
            fromFlag: {
                type: String,
                default: ''
            },
            row: {
                type: Array,
                default() {
                    return [];
                }
            },
            isSeparate: {
                type: Number,
                default: 0
            }
        },
        filters: {
            filterTagName(val) {
                if (val) {
                    if (val.indexOf('<') >= 0) {
                        if (val.split('<')[0]) {
                            return val.split('<')[0];
                        } else {
                            return val.split('<')[1].split('@')[0];
                        }
                    } else {
                        return val.split('@')[0];
                    }
                }
            }
        },
        computed: {
            $lang() {
                return Vue.config.lang;
            }
        },
        data() {
            return {
                tagAttr: [],
                tagList: [], // 经过处理后的数组
                activeIndex: -1 // 选中项的索引
            };
        },
        created() {
            this.getTagArr();
            this.getMailStatus();
        },
        methods: {
            getTagArr() {
                const flag = this.tagAttr.filter(item => {
                    return item.editting;
                });
                if (flag.length > 0) {
                    return;
                }
                this.tagAttr = this.taglist.map(tag => {
                    let isEmail = false;
                    isEmail = reg.test(tag);
                    return {
                        isEmail,
                        editting: false
                    };
                });
            },
            /* 获取标准格式的邮箱 */
            getStandardEmail(emailAdd) {
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    return emailAdd.slice(startIndex + 1, emailAdd.length - 1);
                } else {
                    return emailAdd;
                }
            },
            /* 获取邮箱对应的状态信息 */
            getMailStatus() {
                // 先去重
                for (let i = 0; i < this.taglist.length; i++) {
                    for (let j = i + 1; j < this.taglist.length; j++) {
                        let email1 = this.getStandardEmail(this.taglist[i]).toLowerCase();
                        let email2 = this.getStandardEmail(this.taglist[j]).toLowerCase();
                        if (email1 === email2) {
                            this.taglist.splice(j,1)
                            j--
                        }
                    }
                }

                const res = this.taglist.map((item, index) => {
                    const email = this.getStandardEmail(item);
                    const obj = {};
                    obj.tagName = item;
                    obj.emailAddress = email;
                    obj.tagStatus = this.row.find(rowData => rowData.email === email);
                    return obj;
                });
                this.tagList = res;
            },
            tagContent (e) {
                e.preventDefault();
            }
        },
        watch: {
            taglist: {
                handler(val) {
                    this.getTagArr();
                    this.getMailStatus();
                }
            },
            row: {
                handler() {
                    if (this.row.length) {
                        this.getMailStatus();
                    }
                }
            }
        }
    };
</script>
<style lang="less" scoped>
.tag-input{
  cursor: text;
  .tag-list{
    margin-left: 0px;
    display: flex;
    flex-wrap: wrap;
      margin-top: 4px;
    max-width: calc(~'100% - 165px');
    /deep/ .el-tag {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-right:8px;
      }
    .tag-content{
      float: left;
      max-width: 290px;
      color: rgba(0, 0, 0, .8);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0 5px;
    }
  }
  .el-tag{
    margin: 10px 4px 0 0;
    max-width: 100% !important;
    .ivu-icon-ios-close {
      font-size: 20px;
      top: 1px;
      color: #666;
      opacity: .66;
    }
  }
  .ivu-tag-error{
    border: 1px solid #ed4014;
  }
  .input-inside{
    border: 1px solid transparent;
   // width: 400px;
  }
  .input-inside:focus{
    outline: 0;
  }
  .keyword {
        color: #4285F4;
    }
  .select-dropdown {
        max-width: 350px;
        max-height: 190px;
        overflow: auto;
        margin: 5px 0;
        padding: 5px 0;
        background-color: #fff;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        border-radius: 4px;
        -webkit-box-shadow: 0 1px 6px rgba(0,0,0,.2);
        box-shadow: 0 1px 6px rgba(0,0,0,.2);
        position: absolute;
        z-index: 900;
        .relevant-address-item {
            font-size: 12px;
            height: 30px;
            line-height: 30px;
            padding: 0 12px;
            box-sizing: border-box;
            &:hover {
                background-color: #F3F4F7;
                cursor: pointer;
            }
            .relevant-address-content {
                display: inline-block;
                width: 100%;
                height: 100%;
            }
        }
        .active-item {
              background-color: #F3F4F7;
          }
    }
}

</style>

