<template>
    <div style="width:100%;text-align: center; color: rgba(0, 0, 0, .8);">
        <img :src="imgUrl"
             style="width: 412px; height: 290px;">
        <h2 style="font-size: 22px; margin-top: 40px;  margin-bottom: 20vh;">{{ title }}</h2>
    </div>
</template>

<script type="text/javascript">
    export default {
        name: 'warningUpdate',
        data() {
            return {
                imgUrl: `${process.env.BASE_URL}/image/isUpgrading.png`,
                title: '系统维护中，请稍后访问'
            };
        }
    };
</script>
