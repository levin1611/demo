<template>
    <Card :body-style="{padding: '18px 20px', height: '213px'}" class="_b_r">
        <div class="dashboard-title" style="display: inline-block;margin-right: 5px">{{$t('exchangeRate.title')}}</div>
<!--        <HelpTip :title="$t('helpTip.exchangeRate')"></HelpTip>-->
        <Tooltip :content="rateContent" placement="right">
            <Icon custom="custom custom-tip"></Icon>
        </Tooltip>
        <div class="exchange-rate">
            <Spin fix v-if="loading"></Spin>
            <div style="white-space: nowrap;max-width: 100%;">
                <div class="exchange-rate-ratio">{{rateTips}}</div>
                <div class="exchange-rate-block">
                    <div class="exchange-rate-item">
                        <Poptip
                                placement="bottom-start"
                                width="180"
                                :visible-arrow="false">
                            <div slot="reference" class="exchange-rate-unit">
                                <img :src="scurSrc" style="width: 20px">
                                <span style="vertical-align: super;">
                                    <span style="width: 75px;display: inline-block;margin-right: 5px;margin-left: 3px;text-align: start;font-weight: bold;">{{scur}}</span>
                                    <Icon custom="custom-menu-arrow" color="#7B98B6" size="12"></Icon>
                                </span>
                            </div>
                            <div>
                                <div style="max-height: 240px;overflow-y: auto;margin-top: 10px;position: relative;">
                                    <div class="world-country-item ellipsis holding-money"
                                        v-for="item in optionsTemp"
                                        :key="item.code"
                                        @click="selectedScur(item)"
                                        :class="{'exchange-rate-act': scur === item.code, 'exchange-rate-dis': tcur === item.code}">
                                        {{item.cn}}
                                    </div>
                                </div>
                            </div>
                        </Poptip>
                        <Input class="exchange-rate-input" v-model="money1" @change="changeMoney"></Input>
                    </div>
                    <div style="display: inline-block;padding: 0 25px;">
                        <Tooltip :content="$t('exchangeRate.swapCurrency')" placement="top">
                            <div class="exchange-rate-swap swap-currency"
                                @click="getExchangeRate">
<!--                                    <Icon custom="custom custom-zhuanhuan1" style="color: #0091FF"></Icon>-->
                                <svg class="custom" aria-hidden="true" style="width: 24px; height: 24px">
                                    <use xlink:href="#custom-convert"></use>
                                </svg>
                            </div>
                        </Tooltip>
                    </div>
                    <div class="exchange-rate-item">
                        <Poptip
                                placement="bottom-start"
                                width="180"
                                :visible-arrow="false">
                            <div slot="reference" class="exchange-rate-unit">
                                <img :src="tcurSrc" style="width: 20px">
                                <span style="vertical-align: super;">
                                    <span style="width: 75px;display: inline-block;margin-right: 5px;margin-left: 3px;text-align: start;font-weight: bold;">{{tcur}}</span>
                                    <Icon custom="custom-menu-arrow" color="#7B98B6" size="12"></Icon>
                                </span>
                            </div>
                            <div>
                                <div style="max-height: 240px;overflow-y: auto;margin-top: 10px;position: relative;">
                                    <div class="world-country-item ellipsis exchange-money"
                                        v-for="(item, index) in optionsTemp"
                                        :key="index"
                                        @click="selectedTcur(item)"
                                        :class="{'exchange-rate-act': tcur === item.code, 'exchange-rate-dis': scur === item.code}">
                                        {{item.cn}}
                                    </div>
                                </div>
                            </div>
                        </Poptip>
                        <div class="exchange-rate-result">{{money2}}</div>
                    </div>
                    <div style="display: inline-block;vertical-align: top;margin-left: 20px">
                        <Poptip
                                placement="bottom-start"
                                width="100"
                                :visible-arrow="false">
                            <div slot="reference" style="width: 140px;height: 36px;line-height: 36px;border-radius: 6px;background-color: #F5F6F9;">
                                <span style="vertical-align: super;">
                                    <span style="min-width: 90px;max-width: 110px;display: inline-block;margin-right: 5px;text-align: start;font-size: 12px;font-weight: bold;">{{value3}}</span>
                                    <Icon custom="custom-menu-arrow" color="#7B98B6" size="12"></Icon>
                                </span>
                            </div>
                            <div>
                                <div style="max-height: 240px;overflow-y: auto;margin-top: 10px;position: relative;">
                                    <div class="world-country-item ellipsis exchange-money exchange-rate-type"
                                         v-for="item in rateTypeTemp"
                                         :key="item.type"
                                         @click="selectedType(item)"
                                         :class="{'exchange-rate-act': currentType === item.type}">
                                        {{item.name}}
                                    </div>
                                </div>
                            </div>
                        </Poptip>
                    </div>
                </div>
            </div>
        </div>
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import $ from 'jquery';
    import Vue from 'vue';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'exchange-rate',
        data() {
            return {
                rateContent: '',
                scurSrc: `${process.env.BASE_URL}/image/flags/America.png`,
                tcurSrc: `${process.env.BASE_URL}/image/flags/China.png`,
                loading: true,
                money1: 100,
                money2: '',
                scur: 'USD', // 原币种编号
                tcur: 'CNY', // 目标币种编号
                scurTip: '',
                tcurTip: '',
                optionsTemp: [],
                options: [
                    { name: '人民币', src: `${process.env.BASE_URL}/image/flags/China.png`, cn: this.$t('currency.CNY'), en: 'Chinese Yuan CNY', code: 'CNY' },
                    { name: '美元', src: `${process.env.BASE_URL}/image/flags/America.png`, cn: this.$t('currency.USD'), en: 'United States Dollar USD', code: 'USD' },
                    { name: '澳元', src: `${process.env.BASE_URL}/image/flags/Australia.png`, cn: this.$t('currency.AUD'), en: 'Australian Dollar AUD', code: 'AUD' },
                    { name: '加元', src: `${process.env.BASE_URL}/image/flags/Canada.png`, cn: this.$t('currency.CAD'), en: 'Canadian Dollar CAD', code: 'CAD' },
                    { name: '欧元', src: `${process.env.BASE_URL}/image/flags/EuropeanUnion.png`, cn: this.$t('currency.EUR'), en: 'Euro EUR', code: 'EUR' },
                    { name: '韩元', src: `${process.env.BASE_URL}/image/flags/Korea.png`, cn: this.$t('currency.KRW'), en: 'South Korean Won KRW', code: 'KRW' },
                    { name: '英镑', src: `${process.env.BASE_URL}/image/flags/Britain.png`, cn: this.$t('currency.GBP'), en: 'British Pound GBP', code: 'GBP' },
                    { name: '港元', src: `${process.env.BASE_URL}/image/flags/China.png`, cn: this.$t('currency.HKD'), en: 'Hong Kong Dollar HKD', code: 'HKD' },
                    { name: '印尼卢比', src: `${process.env.BASE_URL}/image/flags/Indonesia.png`, cn: this.$t('currency.IDR'), en: 'Indonesian Rupiah IDR', code: 'IDR' },
                    { name: '印度卢比', src: `${process.env.BASE_URL}/image/flags/India.png`, cn: this.$t('currency.INR'), en: 'Indian Rupee INR', code: 'INR' },
                    { name: '日元', src: `${process.env.BASE_URL}/image/flags/Japan.png`, cn: this.$t('currency.JPY'), en: 'Japanese Yen JPY', code: 'JPY' },
                    { name: '马来西亚林吉特', src: `${process.env.BASE_URL}/image/flags/Malaysia.png`, cn: this.$t('currency.MYR'), en: 'Malaysian Ringgit MYR', code: 'MYR' },
                    { name: '新西兰元', src: `${process.env.BASE_URL}/image/flags/NewZealand.png`, cn: this.$t('currency.NZD'), en: 'New Zealand Dollar NZD', code: 'NZD' },
                    { name: '菲律宾比索', src: `${process.env.BASE_URL}/image/flags/Philippines.png`, cn: this.$t('currency.PHP'), en: 'Philippine Peso PHP', code: 'PHP' },
                    { name: '俄罗斯卢布', src: `${process.env.BASE_URL}/image/flags/Russia.png`, cn: this.$t('currency.RUB'), en: 'Russian Ruble RUB', code: 'RUB' },
                    { name: '新加坡元', src: `${process.env.BASE_URL}/image/flags/Singapore.png`, cn: this.$t('currency.SGD'), en: 'Singapore Dollar SGD', code: 'SGD' },
                    { name: '泰铢', src: `${process.env.BASE_URL}/image/flags/Thailand.png`, cn: this.$t('currency.THB'), en: 'Thai Baht THB', code: 'THB' },
                    { name: '新台币', src: `${process.env.BASE_URL}/image/flags/China.png`, cn: this.$t('currency.TWD'), en: 'Taiwan Dollar TWD', code: 'TWD' }
                    // { name: '越南盾', src: `${process.env.BASE_URL}/image/flags/Vietnam.png`, cn: this.$t('currency.VND'), en: 'Vietnamese Dong VND', code: 'VND' }
                ],
                rateType: [
                    { name: this.$t('exchangeRate.se_buy'), type: 'se_buy' },
                    { name: this.$t('exchangeRate.cn_buy'), type: 'cn_buy' },
                    { name: this.$t('exchangeRate.se_sell'), type: 'se_sell' },
                    { name: this.$t('exchangeRate.cn_sell'), type: 'cn_sell' },
                    { name: this.$t('exchangeRate.middle'), type: 'middle' }
                ],
                rateTypeTemp: [],
                currentType: 'middle',
                value3: this.$t('exchangeRate.middle'),
                cardinalRate: 0,
                rateTips: '',
                ScurRateObj: {},
                TcurRateObj: {}
            };
        },
        components: {
            deleteIcon
        },
        computed: {
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            }
        },
        methods: {
            selectedType(item) {
                this.optionsTemp = [];
                switch (item.type) {
                    case 'se_buy':
                    case 'se_sell':
                        this.optionsTemp = this.options.filter(item => {
                            return item.code !== 'IDR' && item.code !== 'INR' && item.code !== 'TWD';
                        });
                        break;
                    case 'cn_buy':
                    case 'cn_sell':
                        this.optionsTemp = this.options.filter(item => item.code !== 'MYR');
                        break;
                    default:
                        this.optionsTemp = this.options;
                        break;
                }
                this.value3 = item.name;
                this.currentType = item.type;
                this.renderData();
            },
            initScurRate() {
                if (this.scur === 'CNY') {
                    return false;
                }
                return new Promise(resolve => {
                    $.ajax({
                        type: 'get',
                        async: false,
                        url: `https://sapi.k780.com/?app=finance.rate_cnyquot&curno=${this.scur}&appkey=53764&sign=d49ff6dc87b410e7ef889889c3b14f5d&format=json&jsoncallback=dataS`,
                        dataType: 'jsonp',
                        jsonp: 'callback',
                        jsonpCallback: 'dataS',
                        success: (data) => {
                            resolve(data);
                        },
                        error: function() {
                            resolve(false);
                            console.log('get rate fail');
                        }
                    });
                });
            },
            initTcurRate() {
                if (this.tcur === 'CNY') {
                    return false;
                }
                return new Promise(resolve => {
                    $.ajax({
                        type: 'get',
                        async: false,
                        url: `https://sapi.k780.com/?app=finance.rate_cnyquot&curno=${this.tcur}&appkey=53764&sign=d49ff6dc87b410e7ef889889c3b14f5d&format=json&jsoncallback=dataT`,
                        dataType: 'jsonp',
                        jsonp: 'callback',
                        jsonpCallback: 'dataT',
                        success: (data) => {
                            resolve(data);
                        },
                        error: function() {
                            resolve(false);
                            console.log('get rate fail');
                        }
                    });
                });
            },
            initRate() {
                this.loading = true;
                // api改成了它国币100兑换人民币CNY，所以需要进行一些换算
                util.axios.all([this.initScurRate(), this.initTcurRate()]).then(util.axios.spread((ScurRateData, TcurRateData) => {
                    if (ScurRateData && ScurRateData.success === '1') {
                        this.ScurRateObj = ScurRateData.result[this.scur].BOC;
                    }
                    if (TcurRateData && TcurRateData.success === '1') {
                        this.TcurRateObj = TcurRateData.result[this.tcur].BOC;
                    }
                    this.renderData();
                }));
            },
            renderData() {
                // 获取对应的名称
                this.scurTip = this.getName(this.scur);
                this.tcurTip = this.getName(this.tcur);
                const x = this.scur === 'CNY' ? 1 : Number(this.ScurRateObj[this.currentType]);
                const y = this.tcur === 'CNY' ? 1 : Number(this.TcurRateObj[this.currentType]);
                const upddate = this.scur === 'CNY' ? this.TcurRateObj.upddate : this.ScurRateObj.upddate;
                let rate;
                if (this.scur === 'CNY') {
                    rate = 100 / y;
                } else if (this.tcur === 'CNY') {
                    rate = x / 100;
                } else {
                    rate = x / y;
                }
                this.rateContent = `${this.$t('exchangeRate.helpTips1')} ${upddate} ${this.$t('exchangeRate.helpTips2')}`;
                this.cardinalRate = rate.toFixed(4);
                this.money2 = (this.cardinalRate * Number(this.money1)).toFixed(2);
                let str = '=';
                // 如果汇率做了截取则用约等于
                const mantissa = rate.toString().split('.')[1];
                if (mantissa && mantissa.length > 4) {
                    str = '≈';
                }
                this.rateTips = `1 ${this.scurTip}${str}${this.cardinalRate} ${this.tcurTip}`;

                this.loading = false;
            },
            // 交互原始币种和目标币种信息
            getExchangeRate() {
                const temp1 = this.scur;
                this.scur = this.tcur;
                this.tcur = temp1;
                const src = this.scurSrc;
                this.scurSrc = this.tcurSrc;
                this.tcurSrc = src;
                this.initRate();
                this.saveLocalstorage();
            },
            filterType(item, value) {
                switch (item.code) {
                    case 'IDR':
                    case 'INR':
                    case 'TWD':
                        if (value === 'MYR') {
                            this.rateTypeTemp = this.rateTypeTemp.filter(item => {
                                return item.type !== 'se_buy' && item.type !== 'se_sell';
                            });
                        } else {
                            this.func1();
                        }
                        break;
                    case 'MYR':
                        if (value === 'IDR' || value === 'INR' || value === 'TWD') {
                            this.rateTypeTemp = this.rateTypeTemp.filter(item => item.type !== 'cn_buy' && item.type !== 'cn_sell');
                        } else {
                            this.rateTypeTemp = this.rateType.filter(item => item.type !== 'cn_buy' && item.type !== 'cn_sell');
                        }
                        break;
                    default:
                        if (value === 'IDR' || value === 'INR' || value === 'TWD') {
                            this.func1();
                        } else if (value === 'MYR') {
                            this.rateTypeTemp = this.rateType.filter(item => item.type !== 'cn_buy' && item.type !== 'cn_sell');
                        } else {
                            this.rateTypeTemp = this.rateType;
                        }
                        break;
                }
            },
            async selectedScur(item) {
                if (item.code === this.scur || item.code === this.tcur) {
                    return false;
                }
                this.filterType(item, this.tcur);
                this.scur = item.code;
                this.scurSrc = item.src;
                const ScurRateData = await this.initScurRate();
                if (ScurRateData && ScurRateData.success === '1') {
                    this.ScurRateObj = ScurRateData.result[this.scur].BOC;
                }
                this.renderData();
                this.saveLocalstorage();
            },
            async selectedTcur(item) {
                if (item.code === this.tcur || item.code === this.scur) {
                    return false;
                }
                this.filterType(item, this.scur);
                this.tcur = item.code;
                this.tcurSrc = item.src;
                const TcurRateData = await this.initTcurRate();
                if (TcurRateData && TcurRateData.success === '1') {
                    this.TcurRateObj = TcurRateData.result[this.tcur].BOC;
                }
                this.renderData();
                this.saveLocalstorage();
            },
            changeMoney(val) {
                const arr = val.split('');
                const arrTemp = [];
                const reg = /[0-9]/;
                let temp = false;
                let temp1 = false;
                // 去除非数字，以及0开头，再截取前10位
                arr.map(item => {
                    if (reg.test(item)) {
                        // 去除0开头
                        if (item !== '0') {
                            arrTemp.push(item);
                            temp = true;
                        } else if (temp) {
                            arrTemp.push(item);
                        }
                    } else if (!temp1 && item === '.') {
                        // 取第一个小数点
                        arrTemp.push(item);
                        temp1 = true;
                    }
                });
                if (arrTemp.length > 0) {
                    this.money1 = Number(arrTemp.join('').substr(0, 10));
                } else {
                    this.money1 = 100;
                }
                this.money2 = (Number(this.cardinalRate) * Number(this.money1)).toFixed(2);
                this.saveLocalstorage();
            },
            getName(key) {
                const temp = this.options.find(item => item.code === key);
                return temp ? Vue.config.lang === 'zh-CN' ? temp.name : temp.code : '';
            },
            func1() {
                this.rateTypeTemp = this.rateType.filter(item => {
                    return item.type !== 'se_buy' && item.type !== 'se_sell';
                });
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', 'exchangeRate');
            },
            saveLocalstorage() {
                this.$nextTick(() => {
                    const currencyExchangeObj = {
                        scur: this.scur,
                        scurSrc: this.scurSrc,
                        tcur: this.tcur,
                        tcurSrc: this.tcurSrc,
                        money1: this.money1,
                        currentType: this.currentType
                    };
                    localStorage.setItem('currencyExchangeObj', JSON.stringify(currencyExchangeObj));
                });
            }
        },
        mounted() {
            this.optionsTemp = this.options;
            this.rateTypeTemp = this.rateType;
            const currencyExchangeObj = localStorage.getItem('currencyExchangeObj') ? JSON.parse(localStorage.getItem('currencyExchangeObj')) : null;
            if (currencyExchangeObj) {
                this.scur = currencyExchangeObj.scur;
                this.scurSrc = currencyExchangeObj.scurSrc;
                this.tcur = currencyExchangeObj.tcur;
                this.tcurSrc = currencyExchangeObj.tcurSrc;
                this.money1 = currencyExchangeObj.money1;
                this.currentType = currencyExchangeObj.currentType;
                const currentType = this.rateType.filter(item => item.type === this.currentType);
                this.value3 = currentType[0] ? currentType[0].name : '';
            }
            this.initRate();
        }
    };
</script>

<style lang="less">
    .exchange-rate{
        text-align: center;
        position: relative;
        color: rgba(0,0,0,0.80);
        display: flex;
        justify-content: center;
        & input{
            height: 36px;
            line-height: 36px;
        }
        .el-select{
            .el-input{
                input{
                    border: none;
                    background-color: #F5F6F9;
                }
            }
            .el-input__inner:hover{
                box-shadow: 0 0 0 0;
            }
            .el-input.is-focus .el-input__inner{
                box-shadow: 0 0 0 0;
            }
        }
        &-ratio{
            font-size: 14px;
            font-weight: 600;
            margin-top: 20px;
            text-align: left;
        }
        &-block{
            margin: 20px 0;
        }
        &-item{
            width: 28%;
            max-width: 145px;
            display: inline-block;
            vertical-align: top;
        }
        &-unit{
            height: 36px;
            line-height: 36px;
            border-radius: 6px;
            background-color: #F5F6F9;
            padding-left: 10px;
        }
        &-input{
            width: 145px;
            margin-top: 10px;
            font-size: 18px;
            font-weight: 600;
            & input{
                border-radius: 0;
                border: none;
                border-bottom: 1px solid #EAEAEA;
            }
            .el-input__inner {
                padding-left: 21px;
            }
            .el-input__inner:hover{
                box-shadow: 0 1px 0 0 #EAEAEA;
            }
            .el-input.is-focus .el-input__inner{
                border-color: #EAEAEA;
                box-shadow: 0 1px 0 0 #EAEAEA;
            }
        }
        &-swap {
            width: 22px;
            height: 22px;
            background: #F5F6F9;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 7px;
            line-height: 21px;
            text-align: center;
        }
        &-result{
            font-size: 18px;
            font-weight: 600;
            width: 145px;
            height: 36px;
            line-height: 36px;
            display: inline-block;
            margin-top: 10px;
            text-align: start;
            padding-left: 21px
        }
        &-act{
            color: #4285F2;
            background-color: #F3F4F7;
        }
        &-dis{
            cursor:not-allowed;
        }
    }

    .dashboard-title {
        font-size: 20px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.8);
    }
</style>
