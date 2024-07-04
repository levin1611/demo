<template>
    <!-- responsePrefer -->
    <div class="responsePrefer sceneUseBaseSet-item">
        <div class="sceneUseBaseSet-item-title">{{ $t('aiToolBar.frontAi.responsePrefer') }}</div>

        <div class="sceneUseBaseSet-item-content">
            <!-- 全部/指定 单选 radio -->
            <RadioGroup :value="responsePrefer" @input="onInput">
                <Radio :label="1">{{ $t('aiToolBar.frontAi.learningAnReference') }}</Radio>
                <Radio :label="0">{{ $t('aiToolBar.frontAi.strictKnowledge') }}</Radio>
            </RadioGroup>
        </div>
    </div>
</template>

<script>
export default {
    name: 'responsePrefer',
    props: {
        responsePrefer: 0
    },
    methods: {
        onInput(v) {
            this.$emit('update:responsePrefer', v)
        }
    },
};
</script>

<style lang="less" scoped>
.sceneUseBaseSet {
    &-item {
        &-title {
            color: #333;
            font-size: 14px;
            font-weight: 500;
            line-height: 18px;
            margin-top: 20px;
        }

        &-content {
            margin-top: 12px;

            /deep/ .el-radio__label {
                font-size: 12px;
            }
        }
    }
}
</style>