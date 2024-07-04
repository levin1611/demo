<template>
  <div class="main-body">
      <loop-manage v-if="showField===0" :showField.sync="showField"></loop-manage>
      <Audit v-if="showField===1" :showField.sync="showField"></Audit>
      <pass-back v-if="showField===2" :showField.sync="showField"></pass-back>
  </div>
</template>
<script>
    import util from '@/libs/util';
    import LoopManage from '../components/loop-manage.vue';
    import Audit from '../components/audit.vue';
    import PassBack from '../components/pass-back.vue';
    export default {
        name: 'close_loop',
        components: {
            LoopManage,
            Audit,
            PassBack
        },
        data() {
            return {
                showField: 0
            };
        },
        mounted() {

        },
        created: function() {

        },
        methods: {

        }
    };
</script>
<style lang="less">
  .table_wrap h2 {
    font-size: 16px;
    font-weight: 500;
    color: #2d2f2e;
  }
</style>
