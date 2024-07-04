<template>
  <div class="card-content-right-c _specials" :style="{width: width}">
    <div class="card-content-right-c-top">{{c.total}}</div>
    <div class="card-content-right-c-center">{{c.context}}</div>
    <div class="card-content-right-c-bottom" v-if="c.bottom">
      <span class="card-content-right-c-bottom-left">{{$t('epidemic.yesterday')}}</span>
      <span class="card-content-right-c-bottom-right card-epidemic-down" :class="{'card-epidemic-up': c.flag}">
        <span class="card-epidemic-triangle" :class="{'card-epidemic-triangle-up': !c.flag, 'card-epidemic-flag': c.flag}"></span>
        <span>{{c.bottom}}</span>
      </span>
    </div>
    <div v-else class="card-content-right-c-bottom">
      <span style="color:rgba(0,0,0,0)">123</span>
    </div>
  </div>
</template>

<script>

    export default {
        name: 'cardEpidemicContent',
        props: {
            c: {
                type: Object,
                default: () => ({
                    total: '0',
                    context: '现有确诊',
                    flag: false,
                    bottom: '0'
                })
            },
            width: {
                type: String,
                default: '130px'
            }
        }
    };
</script>

<style lang="scss" scoped>
@import '~@/styles/moduleScss/dash-board/epidemic-content';
</style>
