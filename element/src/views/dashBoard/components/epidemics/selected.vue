<template>
  <div :style="{width:width, height: height}" class="selected-room">
    <div style="width: 100%;height: 100%">
      <div class="selected-room-search" @click.stop="forbidden">
        <ElInput v-model="search" size="mini">
          <i slot="suffix" class="custom custom-search-new" style="font-size: 12px; color:#A9B9C9;cursor: default;"></i>
        </ElInput>
      </div>
      <div class="epidemic-select">
        <ul>
          <li v-for="(v,i) in filters" :key="i" class="piwik_catch__country" :class="{'epidemic-select-is-active': v[val] === current}" @click="choose(v,i)" :title="v[label]">{{v[label]}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
        // import { debounce } from 'lodash';

    export default {
        name: 'epidemicSelect',
        props: {
            width: {
                type: String,
                default: '200px'
            },
            height: {
                type: String,
                default: '220px'
            },
            target: String,
            current: String,
            val: {
                type: String,
                required: true
            },
            label: {
                type: String,
                required: true
            },
            list: Array
        },
        computed: {
            filters() {
                if (!this.search) return this.list;
                return this.list.filter(v => (v[this.label].toLowerCase()).indexOf(this.search.trim().toLowerCase()) !== -1);
            }
        },
        data() {
            return {
                search: ''
            };
        },
        components: {},
        methods: {
            forbidden() {},
            choose(item, index) {
                this.$emit('choose', item);
                // this.$emit('update:cur', item);
            }
        }
    };
</script>

<style lang="scss" scoped>
.epidemic-select {
  height: 180px;
  margin-top: 10px;
  color: rgba($color: #000000, $alpha: 0.8);
  font-size: 12px;
  overflow-y: auto;
  &-is-active {
    background-color: #f3f4f7;
  }
  ul li {
    line-height: 30px;
    padding: 0 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      background-color: #f3f4f7;
    }
  }
}
.selected-room {
  background-color: #ffffff;
  border-radius: 8px;
  &-search {
    padding: 0 20px;
  }
}
</style>
