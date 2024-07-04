<template>
    <Poptip v-model="visible"
            placement="bottom-end"
            :disabled="disabled"
            ref="poptip"
            @after-enter="focus_searchInput"
            @hide="value_search = ''">
        <Input slot="reference"
               :disabled="disabled"
               v-model="value_show"
               :size="size"
               :placeholder="placeholder"
               readonly
               ref="show"
               :style="inputStyle"
               @change="reset">
            <Icon v-if="value_show && !disabled"
                  slot="suffix"
                  type="close-circled"
                  :size="14"
                  @click.stop="$emit('update:countryArea', '')"
                  style="line-height: 32px;cursor: pointer;"></Icon>
        </Input>
        <div v-if="!disabled"
             @click.stop>
            <Input v-model="value_search"
                   :size="size"
                   autofocus
                   ref="search"
                   :placeholder="placeholderDrop"
                   style="width: 100%;"
                   @input="debounce_search_countryArea">
                <Icon slot="suffix"
                      type="ios-search"
                      :size="16"
                      @click.native="search_countryArea(value_search)"
                      style="line-height: 32px;cursor: pointer;"></Icon>
            </Input>
            <br><br>

            <div style="max-height: 200px;overflow: auto;">
                <template v-if="computed_list_country.length">
                    <span style="font-style: italic;">{{ $t('global.country') }}</span>
                    <Tree :props="treeProps"
                          lazy
                          :load="searchArea"
                          :expand-on-click-node="false"
                          @node-click="click_countryArea_node"></Tree>
                </template>
                <br>
                <template v-if="computed_list_countryArea.length">
                    <span style="font-style: italic;">{{ $t('global.area') }}</span>
                    <Tree :props="treeProps"
                          lazy
                          :load="searchCity"
                          node-key="nodeKey"
                          :expand-on-click-node="false"
                          :default-expanded-keys="defaultExpandedCountryAreaKeys"
                          @node-click="click_countryArea_node"></Tree>
                </template>
            </div>
        </div>
    </Poptip>
</template>

<script>
    import util from '@/libs/util';
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import { crmClue } from '@/api/crm';
    // import url from '../../build/url';

    export default {
        name: 'countryAreaSelect',
        props: {
            isVisible: Boolean,
            disabled: Boolean,
            countryArea: String,
            inputStyle: String,
            createTime: {
                type: Date,
                default() {
                    return new Date();
                }
            },
            showUnknown: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            url: {
                type: String,
                default() {
                    return 'report/country/wherelike';
                }
            },
            size: String,
            error_format: Boolean,
            placeholder: String,
            placeholderDrop: {
                type: String,
                default() {
                    return '';
                }
            }
        },
        computed: {
            ...mapState(['enterpriseId']),
            computed_name_countryArea() {
                if (!Array.isArray(this.list_countryArea.divisions) || !this.list_countryArea.divisions.length) {
                    return [];
                }
                return this.list_countryArea.divisions.map(item => Vue.config.lang === 'zh-CN' ? `【${item.countryName}】  ${item.divisionCnname}` : `【${item.countryEnname}】  ${item.divisionEnname}`);
            }
        },
        data() {
            return {
                visible: false,
                /* 国家地区 */
                value_show: '',
                value_search: '',
                countryAreaCode: '',
                list_countryArea: {},
                computed_list_country: [],
                computed_list_countryArea: [],
                defaultExpandedCountryAreaKeys: [],
                treeProps: {
                    label: 'title',
                    isLeaf: 'isLeaf'
                },

                debounce_search_countryArea: this.$debounce(() => {
                    const name = this.value_search;
                    if (name.slice() && !this.computed_name_countryArea.includes(name)) {
                        this.list_countryArea = {};
                        util.oldAjax({
                            url: this.url,
                            method: 'post',
                            data: {
                                name: name.slice()
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                this.list_countryArea = res.data.data;
                            } else {
                                // this.$Message.error(this.$t('global.error_queryCountryArea'));
                            }
                        });
                    }
                }, 500)
            };
        },
        mounted() {

        },
        methods: {
            // 搜索国家地区
            search_countryArea(name, check_format) {
                if (name.slice() && !this.computed_name_countryArea.includes(name)) {
                    this.list_countryArea = {};
                    util.oldAjax({
                        url: this.url,
                        method: 'post',
                        data: {
                            name: name.slice()
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.list_countryArea = res.data.data;
                            if (check_format) {
                                this.$nextTick(() => {
                                    this.$emit('update:error_format', !this.search_existed(this.countryAreaCode || ''));
                                });
                            }
                        } else {
                            // this.$Message.error(this.$t('global.error_queryCountryArea'));
                        }
                    });
                }
            },
            // 搜索国家下的地区
            searchArea(node, resolve) {
                if (node.level === 0) {
                    return resolve(this.computed_list_country);
                }
                const data = node.data;
                let sendUrl = '';
                let sendData = {};

                if (data.countryCode === 'CN') {
                    sendUrl = '/report/country/getChinaList';
                    sendData = {
                        pId: data.id || 0
                    };
                } else {
                    sendUrl = '/report/country/getByCountryCode';
                    sendData = {
                        countryCode: data.countryCode
                    };
                }

                util.oldAjax({
                    url: sendUrl,
                    method: 'post',
                    data: sendData
                }).then(res => {
                    let children = [];
                    if (res.data.code === '1') {
                        // 如果创建时间小于预设时间, 在地区顶部加上"未知"
                        if (this.showUnknown) {
                            res.data.data.unshift({
                                countryCode: data.countryCode,
                                divisionCnname: '未知',
                                divisionCode: 'unknown',
                                divisionEnname: 'unknown area',
                                id: -100
                            });
                        }

                        // tree 子结点赋值
                        children = res.data.data.map(item => {
                            let temp = {};

                            // 如果点击国家为"中国"
                            if (data.countryCode === 'CN') {
                                temp = {
                                    title: Vue.config.lang === 'zh-CN' ? `${item.name}/${item.pinyin}` : `${item.pinyin}/${item.name}`,
                                    divisionCode: item.code,
                                    divisionCnname: item.name,
                                    divisionEnname: item.pinyin,
                                    id: item.id,
                                    pId: item.parentId,
                                    suffix: item.suffix,
                                    countryCode: data.countryCode,
                                    countryName: data.countryName,
                                    countryEnname: data.countryEnname
                                };

                                // 如果 parentId 为 0 (说明是省级), 则设置成可再次点击查询子结点
                                if (!item.parentId) {
                                    temp.loading = false;
                                    temp.children = [];
                                    temp.nodeKey = `${temp.countryCode}-${temp.divisionCode}`;
                                    // 台湾, 香港, 澳门, 无下级, 不可展开
                                    if (['32', '33', '34'].includes(`${item.id}`)) {
                                        temp.isLeaf = true;
                                    }
                                } else {
                                    // 否则不可再次点击查询, 并保存其父级 code 和 name
                                    temp.parentDivisionCode = data.divisionCode;
                                    temp.parentDivisionCnname = data.divisionCnname;
                                    temp.parentDivisionEnname = data.divisionEnname;
                                    temp.nodeKey = `${temp.countryCode}-${temp.parentDivisionCode}-${temp.divisionCode}`;
                                    temp.isLeaf = true;
                                }
                            } else {
                                temp = {
                                    title: Vue.config.lang === 'zh-CN' ? `${item.divisionCnname}/${item.divisionEnname}` : `${item.divisionEnname}/${item.divisionCnname}`,
                                    divisionCode: item.divisionCode,
                                    divisionCnname: item.divisionCnname,
                                    divisionEnname: item.divisionEnname,
                                    countryCode: data.countryCode,
                                    countryName: data.countryName,
                                    countryEnname: data.countryEnname,
                                    nodeKey: `${data.countryCode}-${item.divisionCode}`,
                                    isLeaf: true
                                };
                            }

                            return temp;
                        });
                    } else {
                        this.$Message.error(this.$t('global.error_queryArea'));
                    }
                    data.children = children;
                    resolve(children);
                });
            },
            // 搜索省级下的市级
            searchCity(node, resolve) {
                if (node.level === 0) {
                    return resolve(this.computed_list_countryArea);
                }
                const data = node.data;

                // 当前没有下属地区时才请求
                if (Array.isArray(data.children) && data.children.length) {
                    resolve(data.children);
                } else {
                    let sendUrl = '';
                    let sendData = {};

                    // 暂时只有中国有市级
                    if (data.countryCode === 'CN' && data.provinceId) {
                        sendUrl = '/report/country/getChinaList';
                        sendData = {
                            pId: data.provinceId
                        };

                        util.ajax({
                            url: sendUrl,
                            method: 'post',
                            data: sendData
                        }).then(res => {
                            let children = [];
                            if (res.data.code === '1') {
                                children = res.data.data.map(item => {
                                    return {
                                        title: Vue.config.lang === 'zh-CN' ? `${item.name}/${item.pinyin}` : `${item.pinyin}/${item.name}`,
                                        divisionCode: item.code,
                                        divisionCnname: item.name,
                                        divisionEnname: item.pinyin,
                                        id: item.id,
                                        pId: item.parentId,
                                        suffix: item.suffix,
                                        countryCode: data.countryCode,
                                        countryName: data.countryName,
                                        countryEnname: data.countryEnname,
                                        parentDivisionCode: data.divisionCode,
                                        parentDivisionCnname: data.divisionCnname,
                                        parentDivisionEnname: data.divisionEnname,
                                        isLeaf: true
                                    };
                                });
                            } else {
                                this.$Message.error(this.$t('global.error_queryArea'));
                            }
                            data.children = children;
                            resolve(children);
                        });
                    } else {
                        console.error('并非中国 或 省份ID为空');
                        resolve([]);
                    }
                }
            },
            // 查询已请求到的国家地区信息中是否有 countryArea 对应的国家地区*/
            search_existed(countryAreaCode) {
                if (countryAreaCode === '') {
                    return true;
                }
                const code = countryAreaCode.split('-');
                const allCountryArea = this.computed_list_country.concat(this.computed_list_countryArea);

                if (code[0] === 'CN') {
                    if (allCountryArea.find(item => item.countryCode === 'CN')) {
                        switch (code.length) {
                            case 2:
                                if (code[1] === 'unknown') {
                                    return true;
                                } else {
                                    // 香港等只到二级
                                    return allCountryArea.find(country => country.countryCode === 'CN').children.some(area => area.divisionCode === code[1]);
                                }
                            case 3:
                                if (code[2] === 'unknown') {
                                    return true;
                                } else {
                                    // 正常到三级
                                    return allCountryArea.find(country => country.countryCode === 'CN').children.filter(country => Array.isArray(country.children) && country.children.length).some(province => province.children.some(city => city.divisionCode === code[2]));
                                }
                            default:
                                return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    if (code[1] === 'unknown') {
                        return true;
                    } else {
                        return allCountryArea.some(country => country.children.length && country.children.some(area => area.divisionCode === code[1] || (area.countryCode === code[0] && !area.divisionCode)));
                    }
                }
            },
            // 根据 code 查国家地区信息
            get_detail_by_code(divCode) {
                util.oldAjax({
                    url: '/report/country/getDetailByCode',
                    method: 'post',
                    data: {
                        divCode
                    }
                }).then(async res => {
                    // 按 code 查, 如果匹配成功, 处理后退出流程
                    if (res.data.code === '1' && res.data.data.length) {
                        switch (res.data.data.length) {
                            case 1:
                                this.$nextTick(() => {
                                    const item = res.data.data[0];
                                    if (item.divisionCode && item.divisionCode !== 'unknown') {
                                        if (item.divisionXcode && item.divisionXcode !== 'unknown') {
                                            this.value_show = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】 ${item.divisionCnname} ${item.divisionXname}` : `【${item.countryEnname}】 ${item.divisionEnname} ${item.divisionXname}`;
                                            this.value_search = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】  ${item.divisionCnname}  ${item.divisionXname}` : `【${item.countryEnname}】 ${item.divisionEnname} ${item.divisionXname}`;
                                            this.search_countryArea(item.divisionXname, true);
                                        } else {
                                            this.value_show = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】 ${item.divisionCnname}` : `【${item.countryEnname}】 ${item.divisionEnname}`;
                                            this.value_search = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】 ${item.divisionCnname}` : `【${item.countryEnname}】 ${item.divisionEnname}`;
                                            this.search_countryArea(item.divisionCnname, true);
                                        }
                                    } else {
                                        this.value_show = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】` : `【${item.countryEnname}】`;
                                        this.value_search = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】` : `【${item.countryEnname}】`;
                                        this.search_countryArea(item.countryName, true);
                                    }
                                });
                                return;
                            case 2:
                                this.$nextTick(() => {
                                    const province = res.data.data[0];
                                    const city = res.data.data[1];
                                    // 都是中国城市且邮政编码前两位相同(省级相同)
                                    if (province.countryCode === 'CN' && city.countryCode === 'CN' && province.divisionCode.slice(0, 2) === city.divisionCode.slice(0, 2)) {
                                        this.value_show = Vue.config.lang === 'zh-CN' ? `【中国】 ${province.divisionCnname}-${city.divisionCnname}` : `【China】 ${province.divisionEnname}-${city.divisionEnname}`;
                                        this.value_search = Vue.config.lang === 'zh-CN' ? `【中国】 ${province.divisionCnname}-${city.divisionCnname}` : `【China】 ${province.divisionEnname}-${city.divisionEnname}`;
                                        this.search_countryArea(city.divisionCnname, true);
                                    } else {
                                        this.value_show = this.countryArea;
                                        this.$emit('update:error_format', true);
                                        this.$Message.warning(this.$t('global.info_countryAreaFormat'));
                                    }
                                });
                                return;
                        }
                    }

                    // 按 code 匹配失败, 继续按文本匹配, 如果匹配成功, 处理后退出流程
                    if (await this.get_detail_by_text(divCode)) {
                        return;
                    }

                    // 匹配失败, 提示用户格式错误
                    this.value_show = this.countryArea;
                    this.$emit('update:error_format', true);
                    this.$Message.warning(this.$t('global.info_countryAreaFormat'));
                });
            },
            // 根据文本查国家地区信息
            get_detail_by_text(divText) {
                return new Promise((resolve, reject) => {
                    // 处理 【】 后分割 '-' 得到数组 -> 数组去空 -> 去掉数组元素的前后空格并转为大写 -> 过滤掉"未知地区"
                    const textArr = (divText || '').replace('【', '').replace('】', '-').split('-').filter(item => !(!item || item === '')).map(i => i.trim().toUpperCase()).filter(item => !['未知', 'UNKNOWN', 'UNKNOWN AREA'].includes(item));

                    // 如果数组长度为空或者大于 3 , 格式错误, 退出流程
                    if (!textArr.length || textArr.length > 3) {
                        resolve(false);
                        return;
                    }

                    // 如果只有 1 项, 且为中国, 则不用请求接口
                    if (textArr.length === 1 && ['中国', 'CHINA'].includes(textArr[0])) {
                        this.value_show = Vue.config.lang === 'zh-CN' ? '【中国】' : '【China】';
                        this.value_search = Vue.config.lang === 'zh-CN' ? '【中国】' : '【China】';
                        this.countryAreaCode = 'CN-unknown';
                        this.search_countryArea('中国', true);

                        resolve(true);
                        return;
                    }

                    // 数组长度为 1/2/3 , 取最后一项, 进行搜索
                    util.oldAjax({
                        url: this.url,
                        method: 'post',
                        data: {
                            name: textArr[textArr.length - 1]
                        }
                    }).then(res => {
                        if (res.data.code === '1' && res.data.data) {
                            const countrys = Array.isArray(res.data.data.countrys) ? res.data.data.countrys : [];
                            const divisions = Array.isArray(res.data.data.divisions) ? res.data.data.divisions : [];
                            let country, division, province, city;

                            switch (textArr.length) {
                                case 1:
                                    // 只有 1 项, 一般视作国家, 查询国家 --- 目前只是为了让留言表单里的标准国家地区英文字符串能自动匹配, 所以暂时不考虑直接匹配"单个地区字符串"这种非标准格式
                                    // 也有"香港/澳门/台湾/夏威夷"这种地区, 接口返回只有 divisions 没有 countrys 的特殊情况

                                    // 先按国家查找, 找到第一个文字完全匹配的国家, 视作匹配成功
                                    country = countrys.find(item => [item.name.toUpperCase(), item.ename.toUpperCase()].includes(textArr[0]));
                                    if (country && country.code) {
                                        this.value_show = Vue.config.lang === 'zh-CN' ? `【${country.name}】` : `【${country.ename}】`;
                                        this.value_search = Vue.config.lang === 'zh-CN' ? `【${country.name}】` : `【${country.ename}】`;
                                        this.countryAreaCode = `${country.code}-unknown`;
                                        this.list_countryArea = res.data.data;

                                        resolve(true);
                                    } else if (divisions.length) {
                                        // "香港/澳门/台湾/夏威夷"这种接口返回只有 divisions 没有 countrys 的特殊情况, 特殊处理
                                        const division = divisions.find(item => [item.countryName.toUpperCase(), item.countryEnname.toUpperCase(), item.divisionCnname.toUpperCase(), item.divisionEnname.toUpperCase()].includes(textArr[0]));
                                        if (division && division.countryCode && division.divisionCode) {
                                            this.value_show = Vue.config.lang === 'zh-CN' ? `【${division.countryName}】  ${division.divisionCnname}` : `【${division.countryEnname}】  ${division.divisionEnname}`;
                                            this.value_search = Vue.config.lang === 'zh-CN' ? `【${division.countryName}】  ${division.divisionCnname}` : `【${division.countryEnname}】  ${division.divisionEnname}`;
                                            this.countryAreaCode = `${division.countryCode}-${division.divisionCode}${division.countryCode === 'CN' ? '-unknown' : ''}`;
                                            this.list_countryArea = res.data.data;

                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    } else {
                                        resolve(false);
                                    }

                                    break;
                                case 2:
                                    // 有 2 项, 视作国家 + 地区

                                    // 找到第一个国家字段和地区字段都完全匹配的地区, 视作匹配成功
                                    division = divisions.find(item => [item.countryName.toUpperCase(), item.countryEnname.toUpperCase()].includes(textArr[0]) && [item.divisionCnname.toUpperCase(), item.divisionEnname.toUpperCase()].includes(textArr[1]));
                                    if (division && division.countryCode && division.divisionCode) {
                                        this.value_show = Vue.config.lang === 'zh-CN' ? `【${division.countryName}】  ${division.divisionCnname}` : `【${division.countryEnname}】  ${division.divisionEnname}`;
                                        this.value_search = Vue.config.lang === 'zh-CN' ? `【${division.countryName}】  ${division.divisionCnname}` : `【${division.countryEnname}】  ${division.divisionEnname}`;
                                        this.countryAreaCode = `${division.countryCode}-${division.divisionCode}${division.countryCode === 'CN' ? '-unknown' : ''}`;
                                        this.list_countryArea = res.data.data;

                                        resolve(true);
                                    } else {
                                        resolve(false);
                                    }

                                    break;
                                case 3:
                                    // 有 3 项, 视作 中国 + 省份 + 市区

                                    // 如果国家不是中国, 视作格式错误, 退出流程 --- 目前只有中国有三级地区格式
                                    if (!['中国', 'CHINA'].includes(textArr[0])) {
                                        resolve(false);
                                        return;
                                    }

                                    // 获取省份, 城市匹配数据
                                    province = divisions.find(p => {
                                        // 非中国, pass
                                        if (p.countryCode !== 'CN') {
                                            return false;
                                        }

                                        // 省份文字完全匹配 + 城市文字完全匹配
                                        if ([p.divisionCnname.toUpperCase(), p.divisionEnname.toUpperCase()].includes(textArr[1])) {
                                            city = (Array.isArray(p.list) ? p.list : []).find(c => [c.divisionCnname.toUpperCase(), c.divisionEnname.toUpperCase()].includes(textArr[2]));
                                        }

                                        // 下属城市匹配成功了, 则此省份也被认定匹配成功
                                        return city;
                                    });

                                    // 城市匹配成功
                                    if (city && city.divisionCode && province && province.divisionCode) {
                                        // 要求中国城市要与省份的邮政编码前两位相同
                                        if (province.divisionCode.slice(0, 2) === city.divisionCode.slice(0, 2)) {
                                            this.value_show = Vue.config.lang === 'zh-CN' ? `【中国】 ${province.divisionCnname}-${city.divisionCnname}` : `【China】 ${province.divisionEnname}-${city.divisionEnname}`;
                                            this.value_search = Vue.config.lang === 'zh-CN' ? `【中国】 ${province.divisionCnname}-${city.divisionCnname}` : `【China】 ${province.divisionEnname}-${city.divisionEnname}`;
                                            this.countryAreaCode = `CN-${province.divisionCode}-${city.divisionCode}`;
                                            this.list_countryArea = res.data.data;

                                            resolve(true);
                                            return;
                                        }
                                    }

                                    // 最终匹配失败, 返回 false 退出流程
                                    resolve(false);
                                    break;
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            // 清空数据
            reset() {
                this.value_show = '';
                this.value_search = '';
                this.countryAreaCode = '';
                this.$nextTick(() => {
                    this.visible = true;
                    this.focus_searchInput();
                });
            },
            // 点击地区 tree node
            click_countryArea_node(nodeData) {
                console.log(nodeData);
                if (nodeData.pId > 0) {
                    // 如果点击了第三级"市"
                    this.countryAreaCode = `${nodeData.countryCode}-${nodeData.parentDivisionCode}-${nodeData.divisionCode}`;
                    this.value_show = Vue.config.lang === 'zh-CN' ? `【${nodeData.countryName}】 ${nodeData.parentDivisionCnname}-${nodeData.divisionCnname}` : `【${nodeData.countryEnname}】 ${nodeData.parentDivisionEnname}-${nodeData.divisionEnname}`;
                    this.value_search = Vue.config.lang === 'zh-CN' ? `【${nodeData.countryName}】 ${nodeData.parentDivisionCnname}-${nodeData.divisionCnname}` : `【${nodeData.countryEnname}】 ${nodeData.parentDivisionEnname}-${nodeData.divisionEnname}`;
                    this.$nextTick(() => {
                        this.visible = false;
                    });
                } else {
                    /* 本来是每个国家必须点击到最精确级别, 现在需求变动改成了可点国家, 可点地区 */
                    // 点击的是地区
                    if (nodeData.divisionCode) {
                        // 点击的是港澳台 或 不是中国
                        // if (nodeData.countryCode !== 'CN' || ['32', '33', '34'].includes(nodeData.provinceId + '')) {
                        this.countryAreaCode = nodeData.hasOwnProperty('pId') ? `${nodeData.countryCode}-${nodeData.divisionCode}-unknown` : `${nodeData.countryCode}-${nodeData.divisionCode}`;
                        this.value_show = Vue.config.lang === 'zh-CN' ? `【${nodeData.countryName}】  ${nodeData.divisionCnname}` : `【${nodeData.countryEnname}】  ${nodeData.divisionEnname}`;
                        this.value_search = Vue.config.lang === 'zh-CN' ? `【${nodeData.countryName}】  ${nodeData.divisionCnname}` : `【${nodeData.countryEnname}】  ${nodeData.divisionEnname}`;
                        this.$nextTick(() => {
                            this.visible = false;
                        });
                        // }
                    } else if (nodeData.countryCode) {
                        // 点击的是国家
                        this.countryAreaCode = `${nodeData.countryCode}-unknown`;
                        this.value_show = Vue.config.lang === 'zh-CN' ? `【${nodeData.countryName}】` : `【${nodeData.countryEnname}】`;
                        this.value_search = Vue.config.lang === 'zh-CN' ? `【${nodeData.countryName}】` : `【${nodeData.countryEnname}】`;
                        this.$nextTick(() => {
                            this.visible = false;
                        });
                    }
                }

                // switch (item.pId + '') {
                //     // case '0':
                //     // 如果点击了第二级"省"
                //     case 'undefined':
                //         // divisionCode 为空说明是独立地区, 此时使用 countryCode
                //         if (item.divisionCode) {
                //             this.countryAreaCode = `${ item.countryCode }-${ item.divisionCode }`;
                //         } else {
                //             this.countryAreaCode = item.countryCode;
                //         }
                //         this.value_show = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】  ${item.divisionCnname}` : `【${item.countryEnname}】  ${item.divisionEnname}`;
                //         this.value_search = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】  ${item.divisionCnname}` : `【${item.countryEnname}】  ${item.divisionEnname}`;
                //         this.$nextTick(() => {
                //             this.visible = false;
                //         });
                //         break;
                //     default:
                //         if (item.pId) {
                //             // 如果点击了第三级"市"
                //             this.countryAreaCode = `${item.countryCode}-${item.parentDivisionCode}-${item.divisionCode}`;
                //             this.value_show = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】 ${item.parentDivisionCnname}-${item.divisionCnname}` : `【${item.countryEnname}】 ${item.parentDivisionEnname}-${item.divisionEnname}`;
                //             this.value_search = Vue.config.lang === 'zh-CN' ? `【${item.countryName}】 ${item.parentDivisionCnname}-${item.divisionCnname}` : `【${item.countryEnname}】 ${item.parentDivisionEnname}-${item.divisionEnname}`;
                //             this.$nextTick(() => {
                //                 this.visible = false;
                //             });
                //         }
                // }
            },
            // 初始 获取历史选项
            getHistory() {
                util.oldAjax({
                    url: 'report/country/getCountryListByOrgId',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                        // orgId:100
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.list_countryArea = {
                            countrys: res.data.data
                        };
                    } else {
                        this.$Message.error(this.$t('global.error_queryCountryArea'));
                    }
                });
            },

            // 关闭 poptip 框
            doClose() {
                this.$refs.poptip.doClose();
            },
            // 聚焦到弹出框的搜索 Input
            focus_searchInput() {
                if (this.$refs.search) {
                    this.$refs.search.$el.querySelector('input').focus();
                }
            }
        },
        watch: {
            // 增加监听录入弹窗的显示与隐藏，如果隐藏则重置error_format的值
            // 修改bug: 从线索录入询盘时，如果国家地区不正确，第一次打开会有提醒，之后再打开就不会提醒了。
            //          因为关闭和再打开都不会触发上级组件watch:error_countryArea_clone
            isVisible(val) {
                if (!val) {
                    this.$nextTick(() => {
                        this.$emit('update:error_format', false);
                    });
                } else {
                    this.getHistory();
                }
            },
            countryAreaCode(val, oldVal) {
                // 置空文字
                if (!val) {
                    this.value_show = '';
                    this.value_search = '';
                }
                // 更新数据
                if (this.countryArea !== val) {
                    this.$emit('update:countryArea', val);
                    // 传一下国际地区名，无需再用code查了批量编辑时用
                    this.$emit('update:countryAreaName', this.value_show);
                }
                if (oldVal !== undefined && val !== undefined) {
                    this.$nextTick(() => {
                        this.$emit('update:error_format', !this.search_existed(val || ''));
                    });
                }
            },
            countryArea: {
                handler(val) {
                    if (this.countryAreaCode !== val) {
                        // 如果是外面直接赋值, 而不是点击选中改变数据的, 则获取 code 对应的信息并显示出来
                        // 由于原来的逻辑是：查询已请求到的国家地区信息中包含 countryArea 对应的国家地区就不再调用code接口编译
                        // 但是增加国家地区支持工商数据回填之后，存在多次选中的公司同属于一个省市并且该地区已经包含在原来的国家地区信息数据中导致不会再次调用code解析除最新的数据并回填
                        // 因此去掉校验 查询已请求到的国家地区信息中是否包含 countryArea 对应的国家地区逻辑
                        if (val) {
                            // if (!this.search_existed(val) || val.split('-').slice(-1)[0] === 'unknown') {
                            this.get_detail_by_code(val);
                            // }
                        }
                    }
                    // countryArea 变动时同步改动 countryAreaCode
                    this.countryAreaCode = val;
                },
                immediate: true,
                deep: true // countryArea 是 company 对象的属性, 不加这个检测不到变动
            },
            list_countryArea: {
                handler(val) {
                    /* 计算 computed_list_country */
                    this.computed_list_country = [];
                    if (!Array.isArray(this.list_countryArea.countrys) || !this.list_countryArea.countrys.length) {
                        this.computed_list_country = [];
                    } else {
                        const temp = this.list_countryArea.countrys.map(item => Object.assign({}, item));
                        this.computed_list_country = temp.map(item => {
                            return {
                                title: Vue.config.lang === 'zh-CN' ? `${item.name}/${item.ename}` : `${item.ename}/${item.name}`,
                                loading: false,
                                expand: false,
                                children: [],
                                countryCode: item.code,
                                countryName: item.name,
                                countryEnname: item.ename,
                                nodeKey: item.code
                            };
                        });
                    }

                    /* 计算 computed_list_countryArea */
                    this.computed_list_countryArea = [];
                    this.defaultExpandedCountryAreaKeys = [];
                    const defaultExpandedCountryAreaKeys = [];
                    // 无数据则返回 []
                    if (!Array.isArray(this.list_countryArea.divisions) || !this.list_countryArea.divisions.length) {
                        this.computed_list_countryArea = [];
                    } else {
                        // 浅拷贝
                        const temp = this.list_countryArea.divisions.map(item => Object.assign({}, item));

                        // 获取所有国家 code
                        const country = [...new Set(temp.map(item => item.countryCode))];

                        // 中国单独处理
                        if (country.includes('CN')) {
                            // 去掉中国
                            country.splice(country.findIndex(item => item === 'CN'), 1);

                            // 全部省份
                            const provinces = [...new Set(temp.filter(item => item.countryCode === 'CN').map(item => item.divisionCode))];

                            const China = {
                                title: Vue.config.lang === 'zh-CN' ? '中国/China' : 'China/中国',
                                loading: false,
                                expand: true,
                                countryCode: 'CN',
                                countryEnname: 'China',
                                countryName: '中国',
                                children: provinces.map(prov => {
                                    // 省级
                                    const province = temp.find(item => item.divisionCode === prov);

                                    // 市/区级
                                    const cities = temp.filter(item => item.divisionCode === prov).map(item => {
                                        if (Array.isArray(item.list)) {
                                            const city = item.list[0];
                                            return {
                                                title: Vue.config.lang === 'zh-CN' ? `${city.divisionCnname}/${city.divisionEnname}` : `${city.divisionEnname}/${city.divisionCnname}`,
                                                divisionCode: city.divisionCode,
                                                divisionCnname: city.divisionCnname,
                                                divisionEnname: city.divisionEnname,
                                                countryCode: province.countryCode,
                                                countryName: province.countryName,
                                                countryEnname: province.countryEnname,
                                                parentDivisionCode: province.divisionCode,
                                                parentDivisionCnname: province.divisionCnname,
                                                parentDivisionEnname: province.divisionEnname,
                                                pId: province.provinceId || 'default',
                                                nodeKey: `${province.countryCode}-${province.divisionCode}-${city.divisionCode}`,
                                                isLeaf: true
                                            };
                                        }
                                    }).filter(item => !(!item || item === ''));

                                    // 处理要返回的省数据
                                    const result = {
                                        title: Vue.config.lang === 'zh-CN' ? `${province.divisionCnname}/${province.divisionEnname}` : `${province.divisionEnname}/${province.divisionCnname}`,
                                        divisionCode: province.divisionCode,
                                        divisionCnname: province.divisionCnname,
                                        divisionEnname: province.divisionEnname,
                                        countryCode: province.countryCode,
                                        countryName: province.countryName,
                                        countryEnname: province.countryEnname,
                                        children: cities,
                                        pId: 0,
                                        provinceId: province.provinceId,
                                        nodeKey: `${province.countryCode}-${province.divisionCode}`
                                    };

                                    if (cities.length) {
                                        defaultExpandedCountryAreaKeys.push(`${province.countryCode}-${province.divisionCode}`);
                                        result.expand = true;
                                    } else {
                                        // 台湾, 香港, 澳门, 无下级, 不可展开
                                        if (!['32', '33', '34'].includes(`${result.provinceId}`)) {
                                            result.loading = false;
                                        } else {
                                            result.isLeaf = true;
                                        }
                                    }

                                    return result;
                                }),
                                nodeKey: 'CN'
                            };

                            this.computed_list_countryArea = [China];
                        }

                        // 遍历国家 code 处理数据
                        this.computed_list_countryArea = this.computed_list_countryArea.concat(country.map(countryCode => {
                            const country = this.list_countryArea.divisions.filter(item => item.countryCode === countryCode)[0];
                            return {
                                title: Vue.config.lang === 'zh-CN' ? `${country.countryName}/${country.countryEnname}` : `${country.countryEnname}/${country.countryName}`,
                                loading: false,
                                expand: true,
                                children: temp.filter(item => item.countryCode === countryCode).map(item => {
                                    return {
                                        title: Vue.config.lang === 'zh-CN' ? `${item.divisionCnname}/${item.divisionEnname}` : `${item.divisionEnname}/${item.divisionCnname}`,
                                        divisionCode: item.divisionCode,
                                        divisionCnname: item.divisionCnname,
                                        divisionEnname: item.divisionEnname,
                                        countryCode: item.countryCode,
                                        countryName: item.countryName,
                                        countryEnname: item.countryEnname,
                                        nodeKey: `${item.countryCode}-${item.divisionCode}`,
                                        isLeaf: true
                                    };
                                }),
                                countryCode,
                                countryName: country.countryName,
                                countryEnname: country.countryEnname,
                                nodeKey: countryCode
                            };
                        }));
                        this.computed_list_countryArea.filter(item => item.children && item.children.length).forEach(item => {
                            defaultExpandedCountryAreaKeys.push(item.countryCode);
                        });

                        this.$nextTick(() => {
                            this.defaultExpandedCountryAreaKeys = defaultExpandedCountryAreaKeys;
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
