<template>
  <Modal :visible="isShowUpload" :modal="false" :append-to-body="false" :modal-append-to-body="true" :show-close="false" :close-on-click-modal="false" class="file_upload_modal">
    <div slot="title">
      <span class="file_upload_title">正在上传{{fileNum}}项</span>
      <Icon custom="custom-minus" style="float: right" @click="handleMinimize"></Icon>
    </div>
    <div class="file_upload_container">
      <div class="file_upload_body">
        <ul style="list-style:none">
          <li v-for="(item, index) in uploadData" :class="{'file_upload_item-first': index === 0}" class="file_upload_item" :key="index" style="position:relative">
            <div style="position:absolute;top:0;left:0;height:44px;background:#DDEBFA" :style="{width: Math.round(item.percent || 0) +'%'}"></div>
            <Row type="flex" justify="left" class="row-bg">
              <Col :span="15">
              <fileNameIcon :iconName="getFileSuffix(item.name)"></fileNameIcon>
              <Tooltip placement="top" :content="item.name">
                <span class="upload_file_name" style="margin-left: 10px">{{item.name | ellipsis}}</span>
              </Tooltip>
              </Col>
              <Col :span="4">
              <span>{{item.size | fileSizeFilter}}</span>
              </Col>
              <Col :span="6">
              <span style="margin: 0 10px;font-size:12;color:rgba(0,0,0,0.8)">{{Math.round(item.percent || 0)}} %</span>
              <svg class="svg-icon" aria-hidden="true" style="width: 16px; height: 16px;" v-if="item.isUploading==1">
                <use xlink:href="#custom-img-checked"></use>
              </svg>
              <i class="el-icon-loading" v-if="item.isUploading!== 1 && item.isUploading !== -1">
              </i>
              </Col>
            </Row>
          </li>
        </ul>
      </div>
    </div>
  </Modal>
</template>

<script>
    export default {
        name: 'fileUpload',
        props: {
            isShowUpload: {
                type: Boolean,
                default: false
            },
            fileNum: {
                type: Number
            },
            uploadData: {
                type: Array
            },
            remindNum: {
                type: Number
            }
        },
        computed: {
            uploadFile() {
                return Object.values(this.uploadData);
            }
        },
        filters: {
            fileSizeFilter(bytes) {
                const byte = parseInt(bytes);
                if (byte === 0) {
                    return '0 B';
                }
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
                const i = Math.floor(Math.log(byte) / Math.log(k));
                return `${(byte / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
            },
            ellipsis(value) {
                if (!value) {
                    return '';
                }
                if (value.length > 30) {
                    return `${value.slice(0, 30)}...`;
                }
                return value;
            }
        },
        data() {
            return {
                isFull: true
            };
        },
        methods: {
            handleMinimize() {
                this.isFull = !this.isFull;
                const wrapper = document.getElementsByClassName('file_upload_modal');
                const body = wrapper[0].getElementsByClassName('el-dialog__body');
                console.log('the body is', body);
                if (!this.isFull) {
                    body[0].style.display = 'none';
                } else {
                    body[0].style.display = 'block';
                }
            },
            getFileSuffix(name) {
                const lastIndex = name.lastIndexOf('.');
                if (lastIndex === -1) {
                    return 'other';
                }
                return name.substr(lastIndex + 1).toLowerCase();
            }
        },
        created() {
        },
        watch: {
            uploadFile: {
                handler(val) {
                    // let temp = Object.values(val)
                    if (val.length) {
                        const flag = val.every((item) => {
                            return item.isUploading === 1;
                        });
                        if (flag) {
                            this.$emit('isUploadCompleted', true);
                        }
                    }
                    // let flag = val.every(item => {
                    //     console.log('文件目前的状态1', item)
                    //     console.log('文件目前的状态2', item.isUploading)
                    //     return item.isUploading === 1
                    // })
                    // console.log('文件目前的状态2is', flag)
                    // if(flag) {
                    //     this.$emit('isUploadCompleted', true)
                    // }
                },
                deep: true,
                immediate: true
            },
            remindNum(val) {
                if (this.uploadFile.length) {
                    const flag = this.uploadFile.every((item) => {
                        return item.isUploading === 1;
                    });
                    if (flag) {
                        this.$emit('isUploadCompleted', true);
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
.file_upload_modal {
  // z-index: 0 !important;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;

  .file_upload_title {
    font-family: PingFangSC-Semibold;
    font-size: 16px;
    color: #2f2d2e;
    letter-spacing: 0;
    line-height: 26px;
  }
  .file_upload_item {
    height: 44px;
    line-height: 44px;
    padding: 0 20px;
    border-bottom: 1px solid #eaeaea;
  }
  .file_upload_item-first {
    border-top: 1px solid #eaeaea;
  }
  .el-dialog__body {
    height: 341px !important;
    overflow: scroll !important;
  }
}
</style>
<style lang="less">
.file_upload_modal {
  .el-dialog {
    margin: 0;
  }
  .el-dialog__body {
    height: 341px !important;
    overflow: scroll !important;
    padding: 10px 0;
  }
}
</style>
