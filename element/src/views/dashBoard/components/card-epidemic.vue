<template>
  <div>
    <Card :body-style="{padding: '18px 20px',height: '100%', width: '100%'}" style="border-radius: 8px; height: 100%">
      <div style="width: 100%;height: 100%" class="card-epidemic">
        <div class="card-header _f _j_b">
          <span class="card-header-title">{{$t('epidemic.epidemic')}}</span>
          <span class="card-header-content">
            <span>
              {{$t('epidemic.top')}}
            </span>
            <span>
              {{dateFormat(stopDate)}}
            </span>
          </span>
        </div>
        <div class="card-content">
          <div class="card-content-base">
            <div class="card-content-left">
              <span class="card-content-left-title">{{China.name}}</span>
            </div>
            <div class="card-content-right">
              <div class="card-content-right-c">
                <context :c="topLeft"></context>
              </div>
              <div class="card-content-right-line"></div>
              <div class="card-content-right-c">
                <context :c="topRight"></context>
              </div>
            </div>
          </div>
          <div class="card-content-base">
            <div class="card-content-left">
              <div style="position: relative;box-sizing: border-box;margin: 0 1.2em;text-align:center">
                <span class="card-content-left-title">{{cur.name}}</span>
                <div style="position:absolute;top: 0;right: -1.2em;">
                  <Dropdown placement="bottom" :hide-on-click="true" @visible-change="ifClear" trigger="click">
                    <span class="custom custom-menu-arrow" style="color:rgb(123, 152, 182);font-size:12px"></span>
                    <DropdownMenu slot="dropdown">
                      <DropdownItem class="clear-dropdown">
                        <selected target="cur" label="label" val="value" :current="cur.location" :list="list" ref="epidemicSelect" @choose="select"></selected>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
            <div class="card-content-right">
              <div class="card-content-right-c">
                <context :c="curLeft"></context>
              </div>
              <div class="card-content-right-line"></div>
              <div class="card-content-right-c">
                <context :c="curRight"></context>
              </div>
            </div>
          </div>
        </div>
      </div>
<!--      <div style="position: fixed;bottom: 5px; right: 5px" v-if="isConfig">-->
<!--        <Icon custom="custom-delete-component" size="36" @click="removeFromDashBoard"></Icon>-->
<!--      </div>-->
      <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
    </Card>
  </div>
</template>

<script>
    import context from './epidemics/content.vue';
    import selected from './epidemics/selected.vue';
    import deleteIcon from './deleteIcon';
    // import $cookie from 'js-cookie';
    import { toHump } from '@/utils/dynamicDatas';
    import { getCountry, getEpidemicDetail } from '@/api/dashBoard/card-epidemic';
    export default {
        name: 'cardEpidemic',
        data() {
            return {
                choose: false,
                stopDate: null,
                China: {
                    id: 2,
                    location: 'China',
                    totalCases: '',
                    newCases: '',
                    totalDeaths: '',
                    newDeaths: -1,
                    totalRecovered: '',
                    activeCases: '',
                    name: this.$t('epidemic.china'),
                    cn: '中国',
                    en: 'China'
                },
                cur: {
                    id: 2,
                    location: 'World',
                    totalCases: '',
                    newCases: '',
                    totalDeaths: '',
                    newDeaths: -1,
                    totalRecovered: '',
                    activeCases: '',
                    name: this.$t('epidemic.world'),
                    cn: '中国',
                    en: 'China'
                },
                list: []
            };
        },
        components: { context, selected, deleteIcon },
        computed: {
            lang() {
                return this.$store.state.app.lang === 'zh-CN';
            },
            confirm() {
                return this.$t('epidemic.confirm');
            },
            diagnosis() {
                return this.$t('epidemic.diagnosis');
            },
            topLeft() {
                return {
                    total: this.China.activeCases,
                    context: this.confirm
                    // bottom: this.China.nowChange
                };
            },
            topRight() {
                return {
                    total: this.China.totalCases,
                    context: this.diagnosis,
                    bottom: this.China.newCases
                };
            },
            curLeft() {
                return {
                    total: this.cur.activeCases,
                    context: this.confirm
                };
            },
            curRight() {
                return {
                    total: this.cur.totalCases,
                    context: this.diagnosis,
                    bottom: this.cur.newCases
                };
            },
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            }

        },
        created() {
            this.stopDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        },
        beforeMount() {
            this.getEnCnList();
            this.getCountry(['China', 'World'], 'init');
            // this.getCountry('world');
        },
        methods: {
            async getEnCnList() {
                const data = await getCountry();
                if (data && Array.isArray(data)) {
                    this.list = data.map(v => {
                        const items = Object.entries(v)[0];
                        return {
                            value: items[0],
                            label: this.lang ? items[1] : items[0]
                        };
                    });
                } else {
                    this.list = [];
                }
            },
            async getCountry(region, flag = null) {
                const data = await getEpidemicDetail({
                    location: region,
                    date: [this.dateFormat(this.stopDate), this.dateFormat(new Date().getTime() - 24 * 60 * 60 * 2000)]
                });
                console.log(data)
                if (this.isRight(data)) {
                    region.forEach(m => {
                        if (m === 'China' && flag === 'init') {
                            const items = this.formatCell(data.filter(v => v.location === 'China'));
                            this.China = items.length ? items[0] : this.China;
                        } else {
                            const items = this.formatCell(data.filter(v => v.location === m));
                            this.cur = items.length ? items[0] : this.cur;
                        }
                    });
                }
            },
            dateFormat(date, type = 'date') {
                if (type === 'date') return this.$dym.dateFormat('YYYY-mm-dd', new Date(date));
                return new Date(this.$dym.dateFormat('YYYY-mm-dd', new Date(date))).getTime();
            },
            async select(item) {
              console.log(item)
                this.getCountry([item.value]);
            },
            isRight(data) {
                return data && Array.isArray(data) && data.length;
            },
            formatCell(item) {
                if (!item || (Array.isArray(item) && !item.length)) return [];
                return item.map(v => {
                    const o = {};
                    for (const k in v) {
                        o[toHump(k)] = v[k] === -1 ? ' ' : v[k];
                    }
                    return { ...o, name: this.lang ? (o.cn ? o.cn : '全球') : o.en };
                }).sort(this.$dym.arrDeepSort('date', false));
            },
            ifClear(flag) {
                // debugger;
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', 'epidemic');
            }
        }
    };
</script>

<style lang="scss" scoped>
@import "~@/styles/moduleScss/dash-board/epidemic";
</style>
