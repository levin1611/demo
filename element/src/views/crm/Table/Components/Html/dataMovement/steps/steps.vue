<template>
    <div class="steps">
        <div
                v-bind:class="[stepArray.length==2 ? 'width-2' : stepArray.length==3?'width-3':'width-4', '']"
                v-for="(item,index) in stepArray"
                :key="index"
        >
            <div
                    class="width-100">
                <Icon
                        v-if="index<currentVal"
                        class="circle"
                        type="md-checkmark-circle"/>
                <Icon
                        v-else-if="index==currentVal"
                        class="circle"
                        type="md-radio-button-on"/>
                <div
                        v-else
                        class="circle-no-border"></div>
                <p
                        v-show="index!=0"
                        class="line-1"></p>
                <p
                        v-show="index!=stepArray.length-1"
                        class="line-2"></p>

            </div>
            <div class="width-100 mt-b">
                <p class="steps-title">{{item}}</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .steps {
        background: #fff;
        display: flex;
        /*justify-content: space-evenly;*/
        align-items: flex-end;
        width: 100%;
        overflow: scroll;
        text-align: center;
        padding-top: 16px;
    }

    .line-1 {
        width: 46%;
        height: 1px;
        position: absolute;
        z-index: 0;
        left: 0;
        top: 8px;
        border: none;
        border-bottom: 1px dashed #CBD6E2;
        /*background: #CBD6E2;*/
    }

    .line-2 {
        width: 46%;
        height: 7px;
        position: absolute;
        z-index: 0;
        left: 54%;
        top: 2px;
        border: none;
        border-bottom: 1px dashed #CBD6E2;
    }

    .mt-b {
        margin-bottom: 4px;
        margin-top: 8px;
    }

    .width-100 {
        width: 100%;
        position: relative;
        display: flex;
        justify-content: center;
    }

    .steps-title {
        width: 100px;
        /*font-weight: bold;*/
        line-height: 18px;
        font-size: 12px;
        font-family: PingFangSC-Regular;
        color: rgba(0, 0, 0, .6)
    }

    .width-2 {
        width: 50%;
    }

    .width-3 {
        width: 33.33%;
    }

    .width-4 {
        width: 25%;
    }

    .circle {
        width: 16px;
        height: 16px;
        z-index: 9;
        font-size: 17px;
        color: #00CC99;

    }

    .circle-no-border {
        width: 16px;
        height: 16px;
        /*border: 2px solid #fff;*/
        border-radius: 50%;
        /*background: #007AFF;*/
        z-index: 9;
    }

    .circle-no-border::before {
        display: inline-block;
        content: "";
        width: 8px;
        height: 8px;
        background: #CBD6E2;
        position: absolute;
        top: 4px;
        z-index: 1;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 50%;
    }
</style>
<script>
    export default {
        data() {
            return {};
        },
        props: {
            currentVal: {
                type: Number,
                default: 2
            },
            stepArray: {
                type: Array,
                default: function() {
                    return ['步骤1', '步骤2', '步骤3', '步骤4', '步骤5'];
                }
            }
        }
    };
</script>
