<template>
  <div>
    <div
      :class="{ 'site-page': !noBorder }"
      :style="{ width, height, marginTop, background: '#fff' }"
    >
      <iframe
        v-if="path"
        :src="path"
        frameborder="0"
        ref="pageIframe"
        style="width: 100%; height: 100%;"
      ></iframe>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'SitePage',
        props: ['width', 'height', 'marginTop', 'noBorder'],
        computed: {
            path() {
                if (
                    this.$store.state.FullTemplatePath === '' &&
                    this.$store.state.isShowFullTemplateModal === true
                ) {
                    this.$Message({
                        message: this.$t('administerAMP.getFail'),
                        type: 'error',
                        duration: 3000
                    });
                }
                return this.$store.state.FullTemplatePath;
            }
        }
    };
</script>

<style scoped lang="less">
.site-page {
  box-shadow: 0 2px 4px 0 rgba(224, 224, 224, 0.5);
  border-radius: 30px;
  border: 10px solid #cbd4e7;
  margin: 0 auto;
  iframe {
    border-radius: 20.7px;
  }
}
</style>
