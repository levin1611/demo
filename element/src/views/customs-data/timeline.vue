<template>
    <div class="container timeline">
        <h2>累计上线海关数据 {{totalData}} 条</h2>
        <div class="timeline-title">
            <span class="title-cell timeline-col1">时间</span>
            <div>
                <span class="title-cell timeline-col2">产品类型</span>
                <span class="title-cell timeline-col2">供应商</span>
                <span class="title-cell timeline-col2">采购商</span>
                <span class="title-cell timeline-col2">海关数据</span>
            </div>
        </div>
        <Timeline pending>
            <TimelineItem>
                <span class="timeline-col1">2020.2.2</span>
                <Card class="timeline-data">
                    <span class="timeline-data-element">95559</span>
                    <span class="timeline-data-element">10086</span>
                    <span class="timeline-data-element">886</span>
                    <span class="timeline-data-element">1220</span>
                </Card>
            </TimelineItem>
            <TimelineItem>
                <span class="timeline-col1">2020.2.2</span>
                <Card class="timeline-data">
                    <span class="timeline-data-element">95559</span>
                    <span class="timeline-data-element">10086</span>
                    <span class="timeline-data-element">886</span>
                    <span class="timeline-data-element">1220</span>
                </Card>
            </TimelineItem>
            <TimelineItem>
                <span class="timeline-col1">2020.2.2</span>
                <Card class="timeline-data">
                    <span class="timeline-data-element">95559</span>
                    <span class="timeline-data-element">10086</span>
                    <span class="timeline-data-element">886</span>
                    <span class="timeline-data-element">1220</span>
                </Card>
            </TimelineItem>
            <TimelineItem>
                <span class="timeline-col1">2020.2.2</span>
                <Card class="timeline-data">
                    <span class="timeline-data-element">95559</span>
                    <span class="timeline-data-element">10086</span>
                    <span class="timeline-data-element">886</span>
                    <span class="timeline-data-element">1220</span>
                </Card>
            </TimelineItem>
            <TimelineItem>
                <span class="timeline-col1">2020.2.2</span>
                <Card class="timeline-data">
                    <span class="timeline-data-element">95559</span>
                    <span class="timeline-data-element">10086</span>
                    <span class="timeline-data-element">886</span>
                    <span class="timeline-data-element">1220</span>
                </Card>
            </TimelineItem>
            <TimelineItem>
                <span class="timeline-col1">2020.2.2</span>
                <Card class="timeline-data">
                    <span class="timeline-data-element">95559</span>
                    <span class="timeline-data-element">10086</span>
                    <span class="timeline-data-element">886</span>
                    <span class="timeline-data-element">1220</span>
                </Card>
            </TimelineItem>
            <TimelineItem>
                <!-- <span >2020.2.2</span> -->
                <a href="#" class="timeline-col1">{{ $t('mail.more') }}</a>
            </TimelineItem>
        </Timeline>
    </div>
</template>

<script>
    export default {
        created() {
            this.dateformat();
        },
        data() {
            return {
                totalData: 0
            };
        },
        methods: {
            dateformat() { /* 日期格式化 */
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                        }`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            }
        }
    };
</script>

<style scoped lang="less">
    .container {
        margin-top: 50px;

        h2 {
            text-align: center;
        }
    }

    .timeline-title {
        height: 46px;
        text-align: center;
        line-height: 46px;
        margin: 55px 0 30px 0;
    }

    .title-cell {
        font-weight: 700;
    }

    .timeline-col1 {
        width: 15%;
        float: left;
        text-align: center;
        line-height: 46px;
    }

    .timeline-col2 {
        width: 20%;
        float: right;
        text-align: center;
        line-height: 46px;
    }

    .timeline-element {
        width: 20%;
        float: left;
        text-align: center;
        line-height: 46px;
    }

    .timeline-data {
        float: right;
        width: 80%;

        &:after {
            position: absolute;
            display: inline-block;
            top: 18px;
            left: -5px;
            width: 0;
            height: 0;
            content: '';
            border-style: solid;
            border-width: 5px;
            border-color: #fff #fff transparent transparent;
            transform: rotate(-135deg);
            z-index: 999;
            border-radius: 2px;
            background-color: #fff;
            box-shadow: 1px -1px 2px rgba(0, 0, 0, .13);
        }
    }

    .timeline-data-element {
        line-height: 46px;
        float: left;
        width: 25%;
        text-align: center;
    }
</style>

<style lang="less">
    .timeline {
        .ivu-timeline-item-tail {
            border-left: 3px solid #e9eaec;
            position: absolute;
            left: 15%;
            transform: translate(5px);
            top: 20px;
        }

        .ivu-timeline-item-head {
            top: 14px;
            left: 15%;
        }

        .ivu-timeline-item {
            height: 80px;
            /* margin-top: 34px; */
        }

        .ivu-card-body, .ivu-timeline-item-content {
            padding: 0;
        }
    }
</style>

