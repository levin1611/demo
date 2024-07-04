<template>
    <div style="font-size: 12px;color: rgba(0,0,0,0.8)">
        <Row>
            <Col :span="4">{{ $t('message.user') }}</Col>
            <Col :span="18"
                 :offset="2">{{ $t('message.leadscloud') }}</Col>
        </Row>
        <Row>
            <Col :span="4">{{ $t('message.deadline') }}</Col>
            <Col :span="18"
                 :offset="2">{{ letter.createTime }}</Col>
        </Row>

        <div>
            <div :title="letter.title" style="font-size: 14px; font-weight: bold;margin: 10px 0"
                 class="title-letter" >{{ letter.title }}</div>
            <div v-html="letter.content"
                 class="content _self_content" style="font-size: 13px"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'letterDetail',
        props: [
            'letter'
        ]
    };
</script>

<style lang="less" scoped>
    .title-letter {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.80);
        letter-spacing: 0;
        line-height: 22px;
        padding-left: 11px;
        position: relative;

        &::before {
            display: block;
            position: absolute;
            left: 0;
            top: 4px;
            height: calc(~"100% - 8px");
            content: '';
            border: 1.5px solid #FA8241;
            border-top: 0;
            border-bottom: 0;
            border-radius: 1.5px;
        }
    }
</style>
