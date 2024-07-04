<template>
  <transition name="buttonSection">
    <div class="buttonSection" key="button-section">
      <Tooltip content="关闭" effect="dark" placement="top">
        <div class="close-button">
          <Icon custom="custom custom-guanbi" size="16" @click="onClickClose" />
        </div>
      </Tooltip>
      <Divider class="button-section-divider" direction="vertical"></Divider>
      <Tooltip content="启用AI" effect="dark" placement="top">
        <div class="ai-button">
          <Icon
            custom="custom custom-a-AIguoduanniu"
            size="20"
            @click="onClickAi"
          />
        </div>
      </Tooltip>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'buttonSection',
  methods: {
    onClickClose() {
      this.$aiToolBar.destroy()
    },
    onClickAi() {
      this.$emit('onClickAi')
    },
  },
}
</script>

<style lang="less">
.buttonSection {
  display: flex;
  align-items: center;
  border-radius: 15px;
  background: #ffffff;
  border: 1px solid #e3e7ed;
  box-shadow: 0px 2px 10px 0px #d9dce8;
  &:hover {
    .button-section-divider {
      visibility: hidden;
    }
  }

  .button-section-divider {
    height: 20px;
    margin: 0;
    background-color: #f5f6f9;
  }
  .custom-guanbi,
  .custom-a-AIguoduanniu {
    padding: 0 8px;
    line-height: 30px;
    cursor: pointer;
    &:hover {
      background-color: #f5f6f9;
    }
  }
  .custom-guanbi {
    border-radius: 15px 0 0 15px;
    color: #909299;
  }
  .custom-a-AIguoduanniu {
    border-radius: 0 15px 15px 0;
    color: #ff752a;
  }
}

/*过渡效果*/
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.buttonSection-enter-active {
  animation: fadeIn 0.2s;
}
.buttonSection-leave-active {
  transition: opacity 0.1s linear;
  opacity: 0;
}
</style>
