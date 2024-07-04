<template>
  <div style="height: 100%;">
    <!-- 显示组件 -->
    <component :is="showWitchComponent"
               :openTemplate.sync="openTemplate"></component>
  </div>
</template>

<script>
    import { mapState } from 'vuex';
    import myWebsite from './my-website/my-website.vue';
    import guidePage from './guide-page/guide-page.vue';
    import selectTemplate from './select-template/select-template.vue';
    export default {
        name: 'site-management',
        components: {
            myWebsite,
            guidePage,
            selectTemplate
        },
        computed: {
            ...mapState({
                showWitchComponent: state => state.showWitchComponent
            })
        },
        data() {
            return {
                openTemplate: null
            };
        },
        created() {
          // let temp = localStorage.getItem('showWitchComponent') ? localStorage.getItem('showWitchComponent') : undefined
          // console.log(temp,'?????')
          // if(temp) {
          //   this.$store.state.showWitchComponent = temp
          // }
          try {
            if(this.$route.query.select) {
              this.$store.state.showWitchComponent = 'selectTemplate'
            } else {
              this.$store.state.showWitchComponent = 'myWebsite';
            }
          }catch {
            this.$store.state.showWitchComponent = 'myWebsite';
          }
        }
    };
</script>

<style lang="less" scoped></style>
