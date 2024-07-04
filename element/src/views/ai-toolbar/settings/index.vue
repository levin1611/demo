<template>
  <div class="aiTools">
    <component :is="current_compo" :type="currentType" :stage="currentStage"
      @clickInputSettings="handleClickInputSettings" @clickOutputSettings="handleClickOutputSettings"
      @onClickGoBack="handleClickGoBack"></component>
    <!-- <div :style="'margin-top: 500px'">预览样式</div>
    <div @mouseup="onIputSelect">
      <Input v-model="inputValue" type="textarea" :rows="5"></Input>
    </div> -->
  </div>
</template>

<script>
import mainPage from './mainPage.vue'
import settings from './settings.vue'

export default {
  name: 'aitoolbar',
  components: {
    mainPage,
    settings,
  },
  methods: {
    handleClickInputSettings(type) {
      this.currentType = type
      this.currentStage = 1
      this.current_compo = 'settings'
    },
    handleClickOutputSettings(type) {
      this.currentType = type
      this.currentStage = 2
      this.current_compo = 'settings'
    },
    handleClickGoBack() {
      this.currentType = ''
      this.current_compo = 'mainPage'
    },

    // test
    onIputSelect(e) { },
    onSelect(e) { },
  },
  data() {
    return {
      /* 组件切换 */
      current_compo: 'mainPage',
      currentType: '',
      currentStage: 0,

      //test
      inputValue: '',
    }
  },

  // test
  watch: {
    inputValue: function (val) {
      if (val === '/') {
        this.$aiToolBar.init({
          type: 'inputBoxSlash',
          onConfirm: this.handleInsert,
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.aiTools {
  height: 100%;
}
</style>
