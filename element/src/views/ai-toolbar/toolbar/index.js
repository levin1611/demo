//引入vue组件
import temp from "./toolbar";
import Vue from "vue";
import { getPosition } from "../utils/tools";
import store from "../../../store";
import _ from "lodash";

//创建Vue对象
const toolbar = Vue.extend(temp);
let instance;
let timeoutObj;

export default {
  init(
    options = {
      type: "",
      value: "",
      mouseX: undefined,
      mouseY: undefined,
      slashPos: undefined,
      // function
      onConfirm: undefined,
      onCover: undefined,
      onInsert: undefined,
      onAbort: undefined,
    }
  ) {
    if (timeoutObj) {
      clearTimeout(timeoutObj);
    }

    const {
      type,
      value,
      mouseX,
      mouseY,
      slashPos,
      onConfirm,
      onCover,
      onInsert,
      onAbort,
    } = options;
    const state = store.state.aiToolBar.toolbarTriggerConfig
      ? store.state.aiToolBar.toolbarTriggerConfig
      : store.state.aiToolBar;

    let delay = 0;

    if (!type) return;
    // is config setting open
    if (!state[type]) return;

    if (type !== "inputBoxSlash") {
      delay = 300;
    }

    timeoutObj = setTimeout(() => {
      if (!instance) {
        //创建div标签并挂载Vue对象
        instance = new toolbar({
          el: document.createElement("div"),
        });
      }
      if (instance.visible) return;

      // params
      instance.position = getPosition(type, mouseX, mouseY, slashPos);
      instance.value = value;
      instance.type = type;

      instance.current_compo =
        type === "inputBoxSlash" ? "menuSection" : "buttonSection";

      instance.onConfirm = onConfirm;
      instance.onCover = onCover;
      instance.onInsert = onInsert;
      instance.onAbort = onAbort;

      //将新创建的div添加到body中去
      document.body.appendChild(instance.$el);
      Vue.nextTick(() => {
        //修改组件的visible属性控制显示和隐藏
        instance.visible = true;
      });
    }, delay);
  },
  destroy() {
    if (instance) {
      /*因为加载中往往伴随着界面的数据变化和更新，因此需要在nextTick中执行，
            即在数据真正驱动界面变化之后再关闭加载中弹窗*/
      Vue.nextTick(() => {
        instance.visible = false;
      });
    }
  },
};
