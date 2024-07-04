<template>
  <div class="sendSection">
    <Form v-if="hasPromptTask || hasPromptRequirement" class="chatForm" ref="chat_form" :model="chatForm">
      <FormItem class="chatFormItem" v-for="(item, index) in promptTask" v-if="hasPromptTask && shouldTaskShow(index)"
        :key="item.varName" :label="item.varName" :rules="[{ required: true, trigger: 'blur' }]">
        <Input v-if="item.varType === 1" v-model="task[item.varName]"> </Input>
        <Select popper-class="ai-toolbar-dropdown" v-if="item.varType === 2" v-model="task[item.varName]">
          <Option v-for="(optionItem, index) in item.varOptions" :key="index" :value="optionItem">{{ optionItem }}
          </Option>
        </Select>
        <Select v-if="item.varType === 3" popper-class="ai-toolbar-dropdown" v-model="task[item.varName]" multiple>
          <Option v-for="(optionItem, index) in item.varOptions" :key="index" :value="optionItem">{{ optionItem }}
          </Option>
        </Select>
      </FormItem>
      <FormItem class="chatFormItem" v-for="(item, index) in promptRequirement"
        v-if="hasPromptRequirement && shouldRequireShow(index)" :key="item.varName" :label="item.varName"
        :rules="[{ required: true, trigger: 'blur' }]">
        <Input v-if="item.varType === 1" v-model="requirement[item.varName]">
        </Input>
        <Select v-if="item.varType === 2" popper-class="ai-toolbar-dropdown" v-model="requirement[item.varName]">
          <Option v-for="(optionItem, index) in item.varOptions" :key="index" :value="optionItem">{{ optionItem }}
          </Option>
        </Select>
        <Select v-if="item.varType === 3" popper-class="ai-toolbar-dropdown" v-model="requirement[item.varName]"
          multiple>
          <Option v-for="(optionItem, index) in item.varOptions" :key="index" :value="optionItem">{{ optionItem }}
          </Option>
        </Select>
      </FormItem>
    </Form>
    <div :class="`item-textarea ${isGenerating && 'short-length'}`" v-else>
      <Input v-model="additionalTask" @keydown.enter.native="onClick"></Input>
    </div>
    <div class="btn-area">
      <stopButton @onClickStop="onClickStop" v-if="isGenerating" />
      <sendButton v-else @onClick="onClick" :disabled="!canSend"></sendButton>
    </div>
    <div v-if="isShowExpand" class="expan-btn" @click="onExpand">
      {{
        isShowAll
          ? this.$t('aiToolBar.chat.retract')
          : this.$t('aiToolBar.chat.expand')
      }}
      <i :class="`el-icon-arrow-${isShowAll ? 'up' : 'down'}`"></i>
    </div>
  </div>
</template>

<script>
import sendButton from './component/sendButton.vue'
import stopButton from './component/stopButton'

export default {
  name: 'chatForm',
  components: {
    sendButton,
    stopButton,
  },
  data() {
    return {
      task: {},
      requirement: {},
      additionalTask: '',
      isValidate: false,

      isShowAll: true,
    }
  },
  props: {
    promptTask: [],
    promptRequirement: [],
    isGenerating: false,
  },
  methods: {
    fromatValue(v) {
      if (Array.isArray(v)) {
        return v.join(',')
      }
      return v
    },
    onClick() {
      const promptTask = []
      Object.keys(this.task).forEach((key) => {
        promptTask.push({
          name: key,
          value: this.fromatValue(this.task[key]),
        })
      })
      const promptRequirement = []
      Object.keys(this.requirement).forEach((key) => {
        promptRequirement.push({
          name: key,
          value: this.fromatValue(this.requirement[key]),
        })
      })
      this.isShowAll = false
      this.$emit('onSend', {
        promptTask,
        promptRequirement,
        additionalTask: this.additionalTask,
      })
    },
    onExpand() {
      this.isShowAll = !this.isShowAll
    },
    shouldTaskShow(v) {
      if (v > 3) {
        return this.isShowAll
      }
      return true
    },
    shouldRequireShow(v) {
      const promptTaskLength = this.promptTask?.length || 0
      const offSet = promptTaskLength - 4
      if (offSet > 0) {
        return this.isShowAll
      } else if (v + 1 > Math.abs(offSet)) {
        return this.isShowAll
      } else {
        return true
      }
    },

    onClickStop() {
      this.$emit('onClickStop')
    },
  },
  computed: {
    hasPromptTask() {
      return this.promptTask && this.promptTask.length > 0
    },
    hasPromptRequirement() {
      return this.promptRequirement && this.promptRequirement.length > 0
    },
    isShowExpand() {
      const promptTaskLength = this.promptTask?.length || 0
      const promptRequirementLength = this.promptRequirement?.length || 0
      return promptTaskLength + promptRequirementLength > 4
    },

    canSend() {
      if (this.isGenerating) {
        return false
      }

      if (!this.hasPromptTask && !this.hasPromptRequirement) {
        return !!this.additionalTask
      }

      const isObjValidated = (obj, origin, shouldCheck) => {
        if (!shouldCheck) {
          return true
        }
        const values = Object.values(obj)
        if (values.length !== origin.length) {
          return false
        }
        return values.every((i) => i.length)
      }
      return (
        isObjValidated(this.task, this.promptTask, this.hasPromptTask) &&
        isObjValidated(
          this.requirement,
          this.promptRequirement,
          this.hasPromptRequirement
        )
      )
    },
  },
}
</script>

<style lang="less">
.sendSection {
  display: flex;
  align-items: flex-end;
  position: relative;
  margin-bottom: -4px;

  .chatForm {
    flex: 1;
    /* fix scroll bar issue */
    padding: 1px 0;

    .chatFormItem {
      display: inline-block;
      margin: 8px 20px 0 0;

      .el-form-item__label {
        float: none;
        display: inline-block;
        width: 110px;
        text-align: left;
        line-height: 22px;
        padding-right: 2px;
        font-size: 14px;
        color: #303133;
        vertical-align: text-top;

        &::before {
          color: #ea4335 !important;
          font-size: 20px;
          vertical-align: text-top;
        }
      }

      .el-form-item__content {
        display: inline-block;

        .el-input {
          width: 220px;
        }
      }
    }
  }

  .item-textarea {
    flex: 1;
    margin-right: 20px;
    margin-top: 16px;
    margin-bottom: 4px;

    &.short-length {
      .el-input {
        width: calc(100% - 60px);
      }
    }
  }

  .btn-area {
    margin-bottom: 7px;

    .stopButton {
      right: 0;

      .btn-stop {
        margin-top: 0;
      }
    }
  }

  .expan-btn {
    position: absolute;
    cursor: pointer;
    top: 17px;
    right: 0;
    color: rgba(59, 120, 222, 1);
    font-size: 14px;

    &:hover {
      color: #2d63bc;
    }
  }
}

.ai-toolbar-dropdown {
  &.el-popper {
    z-index: 3500 !important;
  }
}
</style>
