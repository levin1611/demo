<template>
    <span>
        <Select
            v-if="show"
            v-model="value_show"
            :multiple="multiple"
            filterable
            :disabled="disabled"
            remote
            reserve-keyword
            @change="selectCountry"
            :placeholder="placeholder"
            :remote-method="remoteMethod"
            :loading="loading">
                <!-- 国家地区选项列表 -->
                <Option v-for="countryArea in options"
                    :key="countryArea.code"
                    :value="countryArea.code"
                    :label="countryArea.countryAreaName">{{ countryArea.countryAreaName }}</Option>
        </Select>
    </span>
</template>

<script>
    import util from '@/libs/util';

    export default {
        name: 'topFilterCountrySelect',
        props: {
            disabled: Boolean, // 禁用阈值
            country: Array,
            inputStyle: String,
            size: String,
            multiple: {
                type: Boolean,
                default: false
            },
            placeholder: String
        },
        data() {
            return {
                timer: null, // 定时器
                loading: false, // loading效果
                show: true, // 解决 单选切换多选时，没有去除掉显示的label 的bug 加的值
                options: [], // 国家地区搜索结果列表
                selectedCountry: [], // 当前选中的国家列表(包含之前的选中的)
                value_show: '' // 国家地区
            };
        },
        methods: {
            //
            clearCountry() {
                this.value_show.length = 0;
                this.options.length = 0;
            },
            // 远程搜索国家地区
            remoteMethod(query) {
                const _this = this;
                // 防止输入过快,频繁调接口
                if (this.timer) {
                    clearTimeout(this.timer);
                }

                this.loading = true;
                // trim() 方法不会改变原始字符串。
                if (query.trim()) {
                    this.timer = setTimeout(() => {
                        util.ajax({
                            url: '/report/country/wherelike',
                            method: 'post',
                            data: {
                                name: query.trim()
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                _this.options = [];
                                const { countrys, divisions } = res.data.data;

                                if (Array.isArray(countrys)) {
                                    // 国家名字处理
                                    countrys.forEach(item => {
                                        let obj = null;
                                        obj = {
                                            countryAreaName: `【${item.name}】`,
                                            code: `${item.code}`
                                        };
                                        _this.options.push(obj);
                                    });
                                };
                                if (Array.isArray(divisions)) {
                                    divisions.forEach(item => {
                                        let obj = null;
                                        // 有第三个地区
                                        if (Array.isArray(item.list)) {
                                            item.list.forEach(division => {
                                                obj = {
                                                    countryAreaName: `【${item.countryName}】 ${item.divisionCnname} - ${division.divisionCnname}`,
                                                    code: `${item.countryCode}-${item.divisionCode}-${division.divisionCode}`
                                                };
                                            });
                                        } else {
                                            obj = {
                                                countryAreaName: `【${item.countryName}】 ${item.divisionCnname}`,
                                                code: `${item.countryCode}-${item.divisionCode}`
                                            };
                                        }
                                        _this.options.push(obj);
                                    });
                                };
                            } else {
                                _this.$Message.error(_this.$t('global.error_queryCountryArea'));
                            }
                            _this.loading = false;
                        });
                    }, 500);
                } else {
                    this.loading = false;
                    this.options = [];
                }
            },
            // 将选择的国家地区传给父组件
            selectCountry(val) {
                const arr = [];
                // 多选
                if (this.multiple) {
                    for (let j = 0; j < val.length; j++) {
                        for (let i = 0; i < this.options.length; i++) {
                            if (val[j] === this.options[i].code) {
                                const obj = {
                                    countryAreaName: '',
                                    code: ''
                                };
                                obj.countryAreaName = this.options[i].countryAreaName;
                                obj.code = this.options[i].code;
                                arr.push(obj);
                            };
                        };
                    };
                }

                // 单选
                if (!this.multiple) {
                    for (let i = 0; i < this.options.length; i++) {
                        if (val === this.options[i].code) {
                            const obj = {
                                countryAreaName: '',
                                code: ''
                            };
                            obj.countryAreaName = this.options[i].countryAreaName;
                            obj.code = this.options[i].code;
                            arr.push(obj);
                        };
                    };
                }
                if (this.country.length) {
                    this.selectedCountry.push(...this.country, ...arr);
                } else {
                    this.selectedCountry.push(...arr);
                }

                // 数组去重
                const ids = new Set();
                let arrCopy = this.selectedCountry.filter(item => {
                    // if (this.value_show) {
                    //     ;
                    // };
                    if (!ids.has(item.code)) {
                        ids.add(item.code);
                        return true;
                    }
                });

                arrCopy = arrCopy.filter(ele => {
                    return this.value_show.includes(ele.code);
                });

                this.$emit('updateCountry', arrCopy);
            }
        },
        watch: {
            country: {
                handler(val) {
                    this.options = [];
                    if (this.multiple) {
                        // 解决 单选切换多选时，没有去除掉显示的label 的bug
                        const _this = this;
                        this.show = false;
                        setTimeout(() => {
                            _this.show = true;
                        });

                        this.value_show = [];
                    } else {
                        this.value_show = '';
                    };
                    const arr = val;
                    this.options = val;
                    if (arr) {
                        arr.forEach(item => {
                            if (this.multiple) {
                                this.value_show.push(item.code);
                            } else {
                                this.value_show = item.code;
                            };
                        });
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style scoped>

</style>
