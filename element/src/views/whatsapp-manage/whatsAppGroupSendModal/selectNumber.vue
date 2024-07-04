<template>
    <div :style="{height: childComponentHeight, maxHeight: childComponentHeight, overflowY: 'scroll'}" class="mianWrap">
        <div class="area_item">
            <div class="labname">
                <span>
                    <k style="color: red;">*</k>{{ $t('wagroupsend.waNumber') }}
                </span>
                <div class="ogarea" v-if="!checkedAccountList.length">
                    <a
                        href="https://hkwhatsaposs01.leadscloud.com/8618403208162/1697423272725/784e12a9-5ca3-4051-94fc-2b49e3e2e66a/f.xlsx">
                        <div>
                            <Icon custom="custom custom-icon_plugin_download" size="14" /> {{ $t('wagroupsend.Dit') }}
                        </div>
                    </a>
                    <label style="margin-left: 20px;cursor: pointer;">
                        <Icon custom="custom custom-icon_plugin_upload" size="14" /> {{ $t('wagroupsend.Import') }}
                        <input type="file" ref="fileInput"  @change="process_sheet_data" accept=".xls,.xlsx,.ods,.csv" style="display: none;" />
                    </label>
                </div>
            </div>
            <Input v-if="!checkedAccountList.length && !checkedAllAccount" v-model="taskNumber" type="textarea" :rows="12" :placeholder=" $t('wagroupsend.waPlaceHolder') "></Input>

            <section class="checkedArea" v-if="checkedAccountList.length || checkedAllAccount">
                        {{$t('wagroupsend.selectedNumer')}}{{checkCount || checkedAccountList.length}}{{$t('wagroupsend.unity')}}
            </section>
        </div>
        <div class="area_item">
            <div class="labname">
                <span>{{ $t('wagroupsend.missname') }}</span>
            </div>
            <Input v-model="taskName" :placeholder=" $t('wagroupsend.missnameAK') " maxlength="100" show-word-limit></Input>
        </div>

    </div>
</template>

<script>
import XLSX from 'xlsx';
import { selectAllQuantities } from '@/api/whatsapp';

    import { mapState } from 'vuex';

export default {
    name: 'selectNumber',
    props: {
        childComponentHeight: {
            type: String,
            default: '400px'
        }
    },
    computed:{
            ...mapState({
                wAGroupSendVisible: state => state.wAGroupSendVisible
            }),
        // 等待发送的wa号码们
        checkedAccountList () {
                return this.$store.state.wAGroupSendAccount;
            },
        // 是不是全选发送
        checkedAllAccount() {
            return this.$store.state.wAGroupSendallChecked;
        }
    },
    data() {
        return {
            taskNumber: '',
            taskName: '',
            checkCount: 0
        }
    },
    methods: {
    // 上传电话号码
        process_sheet_data(evt){
        var f = evt.target.files[0];
        // console.log(f)
        let excelName = f.name.split('.')
        // 判断文件后缀名是否包含xls， xlsx，csv
        if (excelName[excelName.length - 1].toLowerCase() === 'xls' || excelName[excelName.length - 1].toLowerCase() === 'xlsx') {
            if (f) {
                var r = new FileReader();
                r.onload = e => {
                    var data = this.processExcel(e.target.result);
                    data = JSON.parse(data);
                    data = data[Object.keys(data)[0]];
                    console.log(data)
                    if (!data || data[0][0] !== "WhatsApp 号码（必填）") {
                        this.$Message.error(this.$t('crm.Modal.error_fileFormat'));
                        return
                    }
                    // console.log("导入的第一列数据", data[0][0])
                    if (data && data.length > 0) {
                        var numbers = '';
                    
                        for (var i = 1; i < data.length; i++) {
                            if (data[i][0]) {
                                numbers += data[i][0].toString().replace(/,/g, '').replace(/，/g, '');
                                if (i !== (data.length - 1))
                                    numbers += ',';
                            }
                        }
                        // 判断whatsapp号码是否为空，为空则提示
                        if (numbers === "") {
                            this.$Message.error(this.$t('crm.Modal.error_fileFormat'));
                            return
                        }
                        this.taskNumber = numbers;
                    } else {
                        this.$Message.error('无导入数据');
                    }
                };
                r.readAsBinaryString(f);
            } else {
                this.$Message.error('Failed to load file');
            }
        } else {
            this.$Message.error(this.$t('crm.Modal.error_fileFormat'));

        }
        this.$refs.fileInput.value = ''
        },
        processExcel(data) {
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            console.log("----------", workbook)

            // var firstSheet = workbook.SheetNames[0];
            var data = this.to_json(workbook);
            return data
        },
        to_json(workbook) {
            var result = {};
            workbook.SheetNames.forEach(function(sheetName) {
                var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                    header: 1
                });
                if (roa.length) result[sheetName] = roa;
            });
            return JSON.stringify(result, 2, 2);
        },
        getAllCheckedCount() {
             // 如果是wa全选 则需要知道全选的号码数量用来展示
            if(this.checkedAllAccount) {
                const waGroupSendParpasJson = JSON.parse(sessionStorage.getItem('waGroupSendParpasJson')) ;
                delete waGroupSendParpasJson.size;
                delete waGroupSendParpasJson.page;
                selectAllQuantities(waGroupSendParpasJson).then(res=>{
                    this.checkCount = res.data;
                })
            }else{
                this.checkCount = 0

            }
        }
    },
        // activated() {
        //     this.taskNumber = '';
        //     this.taskName = '';
        // },
        watch: {
            // modal消失时, 重置组件
            wAGroupSendVisible: {
                handler(val) {
                    this.taskNumber = '';
                    this.taskName = '';
                    if(val){
                        this.getAllCheckedCount();
                    }
                },
                immediate: true
            },
            taskNumber: {
                handler(val) {
                    let arr = [];
                    if (val.includes(',')) {
                        arr = val.split(',');
                    } else {
                        arr.push(val);
                    }

                    this.$emit('setDataJson', {
                        chatWaAccount: arr
                    });

                    this.$emit('computeTime');
                }
            },
            taskName(val) {
                this.$emit('setDataJson', {
                    taskName: val
                });
            }
        }
};
</script>

<style lang="less" scoped>
.mianWrap {
    padding-top: 30px;
    width: 790px;
    margin-left: 20px;
}

.area_item {
    margin-bottom: 20px;

    .labname {
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
            color: rgba(0, 0, 0, 0.80);
            font-family: PingFang SC;
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: 22px;
        }

        .ogarea {
            display: flex;
            color: #3B78DE;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 18px;
        }
    }


}

/deep/textarea {
    resize: none;
}
.checkedArea{
    width: 100%;
    height: 120px;
    background: #FAFBFF;
    border: 1px solid #EAEAEA;
    font-size: 14px;
    text-align: center;
    line-height: 120px;
    color: rgba(0, 0, 0, 0.8);
}
</style>
