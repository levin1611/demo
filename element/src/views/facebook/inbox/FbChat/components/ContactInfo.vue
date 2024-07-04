<template>
    <div class="contact-info">
        <div class="contact-head">
            <img class="contact-head-avatar" :src="contactAvatar">
            <p class="contact-head-name">{{contactName}}</p>
        </div>
        <div style="border:1px solid #E8E8E8;width:80%;margin:0 auto;"></div>
        <div class="contact-body">
            <p>{{$t('facebook.inbox.fbChat.about')}}</p>
            <p>{{$t('facebook.inbox.fbChat.gender')}}：<span>{{contactGender=='female'?$t('facebook.inbox.fbChat.female'):$t('facebook.inbox.fbChat.male')}}</span>
            </p>
            <p>{{$t('facebook.inbox.fbChat.localTime')}}：<span>{{localTime}}</span></p>
        </div>
        <div class="access-information">
            <div class="access-information-title">{{ $t('inbox.accessInformation') }}</div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'ContactInfo',
        props: {
            contactName: {
                type: String,
                default: '',
                required: true
            },
            contactAvatar: {
                type: String,
                default: '',
                required: true
            },
            contactGender: {
                type: String,
                default: ''
            }
        },
        data() {
            return {};
        },
        computed: {
            localTime() {
                return '12:00';
            }
        },
        methods: {},
        created() {

        }
    };
</script>
<style lang="less">
    .contact-info {
        padding-top: 20px;

        .contact-head {
            text-align: center;

            .contact-head-avatar {
                width: 100px;
                height: 100px;
                border-radius: 50px;
            }

            .contact-head-name {
                font-size: 12px;
                font-weight: 700;
                margin: 10px 0;
            }
        }

        .contact-body {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #495060;

            p {
                line-height: 24px;
            }

        }

        .access-information {
            .access-information-title {
                padding: 10px;
                border-top: 1px solid #E8E8E8;
                border-bottom: 1px solid #E8E8E8;
                font-size: 14px;
                font-weight: 700;
            }
        }
    }
</style>
