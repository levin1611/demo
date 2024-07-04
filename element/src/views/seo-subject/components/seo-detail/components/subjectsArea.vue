<template>
    <div class="subjects_container">
        <div class="main_subject_box">
            <Card class="subject_card cursorBtn" @click.native="handleCardClick(subjectDetail['id'])">
                <span slot="header">{{subjectDetail.name}}</span>
                <div>
                    <span>{{subjectDetail.url ? subjectDetail.url : '附加主题内容'}}</span>
                </div>
            </Card>
        </div>
        <div class="sub_subjects_box">
            <Timeline>
                <TimelineItem>
<!--                    <div slot="dot">-->
<!--                        <Icon custom="custom-tag-color" size="12" color="#FF752A"></Icon>-->
<!--                    </div>-->
                    <div>
                        <br>
                    </div>
                </TimelineItem>
                <TimelineItem v-if="!isMoreThan50">
                    <Card class="sub_subject_card displayInRight cursorBtn"
                          @click.native="addSubjectKeyword"  >
                        <p>子主题关键词</p>
                    </Card>
                </TimelineItem>
                <TimelineItem v-for="(item, index) in subjectDetail['sub_topic']" @click.native.prevent="handleCardClick(item.id)">
                    <div slot="dot" v-if="item.url">
                        <Icon custom="custom-tag-color" size="12" color="#FF752A"></Icon>
                    </div>
                    <Card class="sub_subject_card cursorBtn" :class="(index%2===0) ? 'displayInLeft': 'displayInRight'">
<!--                        <span class="subject_name" slot="header">{{item.name}}</span>-->
                        <div class="subject_name" slot="header">
                            <span class="keyword_name">{{item.name}}</span>
                            <div ref="tailsInput" style="display: none">
                                <Input v-model="edittingTails" @blur="handleTailsChange(item, index)" class="tails_input" @click.native.stop></Input>
                            </div>
                            <span class="keyword_long_name cursorBtn" ref="tailsDisplay" @click.stop="changeTails(item['long_tail'].toString(), index)">
<!--                                <Icon custom="custom-field-edit"-->
<!--                                      size="12"-->
<!--                                      class="edit_tails_icon"-->
<!--                                      @click.stop="changeTails(item['long_tail'].toString(), index)"-->
<!--                                      v-if="index%2===0"  >-->
<!--                                </Icon>-->
                                {{item['long_tail'].toString() ? item['long_tail'].toString(): '单击按钮设置长尾词'}}
                                <Icon custom="custom-field-edit"
                                      size="12"
                                      class="edit_tails_icon"
                                      >
                                </Icon>
                            </span>
                        </div>
                        <span class="displayMid subject_url" style="top: 42%">{{item.url ? item.url : '附加关键字内容'}}</span>
                    </Card>
                </TimelineItem>
            </Timeline>
        </div>
        <editContent :visible.sync="visible_content"
                     v-if="visible_content"
                     :id="editingId"
                     :countrySelected="countrySelected"
                     :langSelected="langSelected"
                     @updateDetail="updateDetail"
                     v-on="$listeners"></editContent>
    </div>
</template>

<script>
    import editContent from './Modals/editContent';
    import util from '../../../../../libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'subjectsArea',
        props: ['subjectDetail', 'countrySelected', 'langSelected'],
        components: {
            editContent
        },
        computed: {
            isMoreThan50() {
                return this.subjectDetail.sub_topic && this.subjectDetail.sub_topic.length >= 50;
            },
            ...mapState({
                subjectId: state => state.seo.subjectId
            })
        },
        data() {
            return {
                visible_keyword: false, // 控制addKeyword弹窗组件的显示
                visible_content: false, // 控制editContent弹窗组件的显示
                editingId: null,
                edittingTails: ''
            }
        },
        methods: {
            addSubjectKeyword() {
                this.$emit('openDialog', 'keyword');
            },
            handleCardClick(id) {
                this.editingId = id;
                this.visible_content = true;
            },
            updateDetail() {
                this.$emit('updateDetails');
            },
            handleTailsChange(item, index) {
                util.ajaxAMP({
                    url: '/seotopic/edit',
                    method: 'post',
                    data: {
                        name: item.name,
                        topic_id: item.id,
                        site_id: item['site_id'],
                        parent_id: this.subjectId,
                        type: item.type,
                        object: item.type === 1 ? item['page_id'] : item['url'],
                        location_id: this.countrySelected,
                        language_id: this.langSelected,
                        longTail: this.edittingTails.split(',')
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.updateDetail();
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                })
                this.$refs.tailsInput[index].style.display = 'none';
                this.$refs.tailsDisplay[index].style.display = 'block';
            },
            changeTails(tails, index) {
                // 隐藏掉所有已经存在的输入框
                let inputNodes = this.$refs.tailsInput;
                let dispNodes = this.$refs.tailsDisplay;
                inputNodes.forEach((input, i) => {
                    if (i === index) {
                        input.style.display = 'block';
                        input.querySelector('input').focus();
                    } else {
                        input.style.display = 'none';
                    }
                });
                dispNodes.forEach((disp, i) => {
                    if (i === index) {
                        disp.style.display = 'none'
                    } else {
                        disp.style.display = 'block'
                    }
                })
                this.edittingTails = tails;
            }
        },
        watch: {
            showAddModal: {
                handler(val) {
                    if (val) {
                        this.visible_keyword = val;
                    }
                }
            },
            visible_keyword: {
                handler(val) {
                    if (!val) {
                        this.$emit('addClose');
                    }
                },
                immediate: true
            }
        },
        created() {
            this.$nextTick(() => {
                // let nodeList = this.$refs.tailsInput;
                // console.log('the node list is', nodeList);
                // nodeList.forEach(node => {
                //     node.style.display = 'none';
                // })
            })
        }
    };
</script>

<style scoped lang="less">
    @import "subjectsArea";
</style>
