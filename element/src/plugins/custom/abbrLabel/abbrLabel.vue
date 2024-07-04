<template>
    <div v-if="labels.length"
         class="abbrLabel">
        <!-- 外部展示的标签 -->
        <div class="label-container">
            <SoftTag v-for="labelItem in displayLabels"
                     :key="labelItem.attrId"
                     :color="labelItem.attrValue || '#4285F4'"
                     class="abbr-label">
                <TooltipAuto :content="labelItem.attrName"></TooltipAuto>
            </SoftTag>
        </div>
        <!-- 更多标签 -->
        <Poptip trigger="click"
                placement="top-end"
                popper-class="abbr-popper"
                ref="poptip">
            <!-- trigger -->
            <div slot="reference"
                 v-show="remainingLabels.length > 0"
                 class="abbr-account">{{ `+${remainingLabels.length}` }}</div>
            <!-- content -->
            <div class="abbr-popper-tag-container">
                <SoftTag v-for="labelItem in remainingLabels"
                         :key="labelItem.attrId"
                         :color="labelItem.attrValue || '#4285F4'"
                         class="abbr-label">
                    <TooltipAuto :content="labelItem.attrName"></TooltipAuto>
                </SoftTag>
            </div>
        </Poptip>
    </div>
</template>

<script>
    export default {
        name: 'abbrLabel',
        props: {
            labels: {
                type: Array
            }
        },
        computed: {
            // 外部展示的标签数组(之后可以扩展为指定外部展示 x 个标签)
            displayLabels() {
                return this.labels.slice(0, 1);
            },
            // 省略显示的标签数组
            remainingLabels() {
                return this.labels.slice(1);
            }
        },
        methods: {
            // 关闭 poptip 框
            doClose() {
                if (this.$refs.poptip) {
                    this.$refs.poptip.doClose();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .abbrLabel {
        display: flex;
        align-items: center;

        .label-container {
            flex: 1;
            overflow: hidden;
        }

        .abbr-label {
            color: #FFF;
            max-width: 100%;
            line-height: 1;
            display: inline-flex;
            align-items: center;
        }

        .abbr-account {
            min-width: 30px;
            height: 30px;
            line-height: 30px;
            border: 1px solid #CBD6E2;
            border-radius: 15px;
            text-align: center;
            margin-left: 12px;
            background-color: #FFF;
            cursor: pointer;
        }
    }
</style>

<style lang="less">
    .abbr-popper {
        min-width: 90px;
        max-width: 425px;

        .abbr-popper-tag-container {
            /*display: flex;*/
            /*flex-wrap: wrap;*/
            /*align-content: flex-start;*/
            max-height: 30vh;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 0 4px;

            .abbr-label {
                color: #FFF;
                margin: 8px 4px 0;
                line-height: 1;
                display: inline-flex;
                align-items: center;
                max-width: calc(100% - 8px);

                &:last-child {
                    margin-bottom: 8px;
                }
            }
        }
    }
</style>
