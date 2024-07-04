<template>
    <div class="theme-test">
        <h1>element-plus UI 主题调整</h1>
        <h2>element-plus 命名空间: {{ elnamespace }}</h2>
        <!-- 分割线 -->
        <el-divider></el-divider>

        <!-- 部分组件主题色调整 -->
        <div>
            <h2>部分组件主题色调整</h2>
            <!-- 分割线 -->
            <el-divider></el-divider>

            <!-- tabs -->
            <h3>TAB</h3>
            <el-tabs :value="'first'" class="demo-tabs">
                <el-tab-pane label="User" name="first">User</el-tab-pane>
                <el-tab-pane label="Config" name="second">Config</el-tab-pane>
                <el-tab-pane label="Role" name="third">Role</el-tab-pane>
                <el-tab-pane label="Task" name="fourth">Task</el-tab-pane>
            </el-tabs>
            <h3>二级 TAB</h3>
            <el-tabs value="first" :class="`${elnamespace}-secondary-tabs`">
                <el-tab-pane label="User" name="first">User</el-tab-pane>
                <el-tab-pane label="Config" name="second">Config</el-tab-pane>
                <el-tab-pane label="Role" name="third">Role</el-tab-pane>
                <el-tab-pane label="Task" name="fourth">Task</el-tab-pane>
            </el-tabs>

            <!-- Pagination -->
            <h3>Pagination</h3>
            <div class="demo-pagination-block">
                <el-pagination
                    :page-size="100"
                    :background="true"
                    layout="total, prev, pager, next"
                    :total="1000"
                />
            </div>
            <div class="demo-pagination-block">
                <el-pagination
                    :page-sizes="[100, 200, 300, 400]"
                    :background="true"
                    layout="sizes, prev, pager, next"
                    :total="1000"
                />
            </div>
            <div class="demo-pagination-block">
                <el-pagination
                    :background="true"
                    layout="prev, pager, next, jumper"
                    :total="1000"
                />
            </div>
            <div class="demo-pagination-block">
                <el-pagination
                    :page-sizes="[100, 200, 300, 400]"
                    :background="true"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="400"
                />
            </div>

            <!-- steps -->
            <h3>Steps</h3>
            <el-steps :active="2" finish-status="success">
                <el-step title="Step 1" description="Some description" />
                <el-step title="Step 2" description="Some description" />
                <el-step title="Step 3" description="Some description" />
            </el-steps>

            <!-- Message 消息提示 -->
            <h3>Message</h3>
            <el-button :plain="true" @click="open1">message</el-button>
            <el-button :plain="true" @click="open2">success</el-button>
            <el-button :plain="true" @click="open3">warning</el-button>
            <el-button :plain="true" @click="open4">error</el-button>

            <!-- loading -->
            <h3>loading</h3>
            <el-table v-loading="true" :data="[{}, {}, {}]" style="width: 100%">
                <el-table-column prop="date" label="Date" width="180" />
                <el-table-column prop="name" label="Name" width="180" />
                <el-table-column prop="address" label="Address" />
            </el-table>

            <!-- slider -->
            <h3>slider</h3>
            <div>
                <el-slider :value="70" show-input />
            </div>

            <!-- table -->
            <h3>table</h3>
            <el-table :data="tableData" stripe highlight-current-row style="width: 100%">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="date" label="Date" width="180" />
                <el-table-column prop="name" label="Name" width="180" />
                <el-table-column prop="address" label="Address" />
            </el-table>

            <!-- badge -->
            <h3>badge</h3>
            <el-badge :value="12" class="item">
                <el-button>comments</el-button>
            </el-badge>
            <br>
            <br>
            <el-badge :value="12" is-dot class="item">
                <el-button>comments</el-button>
            </el-badge>

            <!-- tooltip -->
            <h3>tooltip</h3>
            <el-tooltip
                class="box-item"
                effect="dark"
                content="Top Left prompts info"
                placement="top-start"
            >
                <el-button>top-start</el-button>
            </el-tooltip>

            <!-- input -->
            <h3>input</h3>
            <el-input
                v-model="inputVal"
                placeholder="Please input"
            />
            <br>
            <br>
            <el-input
                v-model="inputVal2"
                placeholder="Please Input"
                :suffix-icon="Search"
            />

            <!-- textarea -->
            <h3>textarea</h3>
            <el-input
                :rows="3"
                type="textarea"
                placeholder="Please input"
            />

            <!-- select -->
            <h3>select</h3>
            <el-select
                v-model="selectVal"
                placeholder="Select"
            >
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>

            <!-- select multiple -->
            <h3>select multiple</h3>
            <el-select
                v-model="selectVal2"
                multiple
                placeholder="Select"
            >
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>

            <!-- datepicker -->
            <h3>datepicker</h3>
            <el-date-picker
                type="date"
                placeholder="Pick a day"
            />

            <!-- dateTime picker -->
            <h3>dateTime picker</h3>
            <el-date-picker
                type="datetime"
                placeholder="Select date and time"
            />

            <!-- timepicker -->
            <h3>timepicker</h3>
            <el-time-picker placeholder="Arbitrary time"/>

            <!-- time select -->
            <h3>time select</h3>
            <el-time-select
                start="08:30"
                step="00:15"
                end="18:30"
                placeholder="Select time"
            />

            <!-- empty -->
            <h3>empty</h3>
            <default-empty />

            <!-- link -->
            <h3>link</h3>
            <el-link
            >default 文字链效果 + hover 效果</el-link>
            <el-link
                type="primary"
            >primary 文字链效果 + hover 效果</el-link>
            <el-link
                type="success"
            >success 文字链效果 + hover 效果</el-link>
            <el-link
                type="warning"
            >warning 文字链效果 + hover 效果</el-link>
            <el-link
                type="danger"
            >primary 文字链效果 + hover 效果</el-link>
            <el-link
                type="info"
            >primary 文字链效果 + hover 效果</el-link>

            <!-- text -->
            <h3>text</h3>
            <el-text
                type="primary"
            >文本 primary 色</el-text>
            <br>
            <br>
            <el-text
                type="danger"
            >文本 警告色</el-text>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import CSSVariables from '@/style/js.module.scss';
import defaultEmpty from '@/components/defaultEmpty.vue';
import { Search } from '@element-plus/icons-vue';
const { elnamespace } = CSSVariables;

// el-message
const open1 = () => {
    ElMessage({
        showClose: true,
        message: 'This is a message.',
        duration: 0
    });
};
const open2 = () => {
    ElMessage({
        showClose: true,
        message: 'Congrats, this is a success message.',
        type: 'success',
        duration: 0
    });
};
const open3 = () => {
    ElMessage({
        showClose: true,
        message: 'Warning, this is a warning message.',
        type: 'warning',
        duration: 0
    });
};
const open4 = () => {
    ElMessage({
        showClose: true,
        message: 'Oops, this is a error message.',
        type: 'error',
        duration: 0
    });
};
open1();
open2();
open3();
open4();

// el-notification
const noticeOpen1 = () => {
    ElNotification({
        title: 'Success',
        message: 'This is a success message',
        type: 'success',
        position: 'bottom-right',
        duration: 0
    });
};

const noticeOpen2 = () => {
    ElNotification({
        title: 'Warning',
        message: 'This is a warning message',
        type: 'warning',
        position: 'bottom-left',
        duration: 0
    });
};

const noticeOpen3 = () => {
    ElNotification({
        title: 'Info',
        message: 'This is an info message',
        type: 'info',
        duration: 0
    });
};

const noticeOpen4 = () => {
    ElNotification({
        title: 'Error',
        message: 'This is an error message',
        type: 'error',
        position: 'top-left',
        duration: 0
    });
};

noticeOpen1();
noticeOpen2();
noticeOpen3();
noticeOpen4();

// el-table
const tableData = [
    {
        date: '2016-05-03',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles'
    },
    {
        date: '2016-05-02',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles'
    },
    {
        date: '2016-05-04',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles'
    },
    {
        date: '2016-05-01',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles'
    }
];

// el-input
let inputVal = ref('');
let inputVal2 = ref('');

// el-select
let selectVal = ref('');
let selectVal2 = ref([]);
const options = [
    {
        value: 'Option1',
        label: 'Option1'
    },
    {
        value: 'Option2',
        label: 'Option2'
    },
    {
        value: 'Option3',
        label: 'Option3'
    },
    {
        value: 'Option4',
        label: 'Option4'
    },
    {
        value: 'Option5',
        label: 'Option5'
    }
];

</script>

<style lang="scss" scoped>
.theme-test {
    padding: 100px 50px;
    height: 100vh;
    overflow-y: auto;
}

h1 {
    color: $brandColor;
}

h2 {
    color: $secondaryColor;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}
.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}
</style>