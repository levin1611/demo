<template>
    <div>
        <InputNumber :min="0" :max="['starLevel', 'cpStarLevel'].includes(condition1) ? 5 : Infinity" v-model="minInput"
                size="mini"
                :precision="precision"
                :controls="controls"
                :disabled="disabled"
                @change="changeInput"
                style="width:90px;margin-right:5px;">
        </InputNumber>
        -
        <InputNumber :min="0" :max="['starLevel', 'cpStarLevel'].includes(condition1) ? 5 : Infinity" v-model="maxInput"
                size="mini"
                :precision="precision"
                :controls="controls"
                :disabled="disabled"
                @change="changeInput"
                style="width:90px;margin-left:5px;">
        </InputNumber>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'numberRange',
        model: {
            prop: 'numberRangeValue', // 默认是value
            event: 'numberRangeInput' // 默认是input
        },
        props: {
            numberRangeValue: [String, Number],
            condition1: String,
            disabled: [String, Number, Boolean],
            precision: {
                type: Number,
                default: 0
            },
            controls: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                minInput: 0,
                maxInput: 0
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                enterpriseId: state => state.enterpriseId
            })
        },
        methods: {
            changeInput($event) {
                // 向上派发myInput事件，这样model监听myInput才有意义：当输入字符时触发input事件，
                // 进而派发触发自定义的myInput事件，然后model监听myInput，就实现了数据绑定
                this.$emit('numberRangeInput', [this.minInput, this.maxInput]);
            },
        },
        created() {
        },
        beforeDestroy() {
        },
        watch: {
            numberRangeValue(val) {
                this.minInput = val[0];
                this.maxInput = val[1];
            }
        }
    };
</script>

<style scoped lang="less">


</style>
