<template>
  <span class="crm-archive-status" :style="`color:${avatarColor}; border-color:${avatarColor}`" @click="$emit('showDetail')">
        {{avatarTitle}}
  </span>
</template>

<script>
    export default {
        name: 'crmArchiveStatus',
        props: {
            size: {
                type: String,
                default: 'default'
            },
            status: {
                type: [Number, String],
                default: 1
            }
        },
        data() {
            return {
            };
        },
        computed: {
            avatarColor() {
                switch (Number(this.status)) {
                    case 4:
                    case 6:
                    case 9:
                        return '#00CC99';
                    case 2:
                    case 5:
                    case 7:
                        return '#FF752A';
                    case 3:
                    case 8:
                        return '#4285F2';
                    case 1:
                    default:
                        return '#90949D';
                }
            },
            avatarTitle() {
                if (this.size === 'default') {
                    switch (Number(this.status)) {
                        case 4:
                            return this.$t('mail.other_leads');
                        case 6:
                            return this.$t('mail.otherContact');
                        case 9:
                            return this.$t('mail.other_customers');
                        case 2:
                            return this.$t('mail.my_leads');
                        case 5:
                            return this.$t('mail.myContact');
                        case 7:
                            return this.$t('mail.my_customers');
                        case 3:
                            return this.$t('mail.public_leads');
                        case 8:
                            return this.$t('mail.public_customers');
                        case 1:
                        default:
                            return this.$t('mail.untreatedDocumented');
                    }
                } else {
                    switch (Number(this.status)) {
                        case 2:
                        case 3:
                        case 4:
                            return this.$t('mail.clue');
                        case 5:
                        case 6:
                            return this.$t('mail.contact');
                        case 7:
                        case 8:
                        case 9:
                            return this.$t('mail.customer');
                        case 1:
                        default:
                            return this.$t('mail.untreatedDocumented');
                    }
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
    .crm-archive-status {
        padding: 0 5px;
        line-height: 16px;
        font-size: 11px;
        color: #90949D;
        border-radius: 30px;
        border: #90949D solid 1px;
        cursor: pointer;
    }
</style>
