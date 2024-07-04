import { Rnum } from '@/utils/dynamicDatas.js';
// import i18n from '@/locale';

// 组件内引入自身的mixins 设置自己的 导航数据
export default {
    data() {
        return {
            forbiddenAllBehaviers: false, // 禁止其余 默认行为 开启步骤状态的唯一标识符
            tourRef: `DefaultTour_${Rnum()}`, // 生成组件唯一ref
            tourName: `DefaultTourtName_${Rnum()}` // 生成组件唯一name
        };
    },
    methods: {
        tourDefaultStart() {
            // 启动公共方法勿动
            this.$nextTick(function() {
                if (this.$refs[this.tourRef]) {
                    this.$refs[this.tourRef].start();
                }
            });
        },
        onTourDefaultStart() {
            console.clear();
            this.forbiddenAllBehaviers = true;
        },
        onTourDefaultStop() {
            // 恢复默认值
            this.forbiddenAllBehaviers = false;
            // this.changeNavZIndex = false;
            // this.forcedDisplayStep = false;
            // this.$refs.personDropdown.changeShow(false);
            // this.$store.commit('changeAppCenterVisible', false);
        },
        onTourDefaultPreviousStep(currentStep) {},
        onTourDefaultNextStep(currentStep) {}
    },
    computed: {
        callbacksTourDefault() {
            return {
                onStart: this.onTourDefaultStart,
                onStop: this.onTourDefaultStop,
                onPreviousStep: this.onTourDefaultPreviousStep,
                onNextStep: this.onTourDefaultNextStep
            };
        },
        defaultTourSteps() {
            // | 'auto'
            // | 'auto-start'
            // | 'auto-end'
            // | 'top'
            // | 'top-start'
            // | 'top-end'
            // | 'bottom'
            // | 'bottom-start'
            // | 'bottom-end'
            // | 'right'
            // | 'right-start'
            // | 'right-end'
            // | 'left'
            // | 'left-start'
            // | 'left-end'
            const params = {
                highlight: true,
                enableScrolling: true
            };
            const targetUrl = ['set_up_shared_domain_name', 'set', 'database'].map(v => this.$router.resolve({ name: v }).href);
            return [
                {
                    key: 'all',
                    target: '#v-step-b-all',
                    ht: '准备工作',
                    content: `
                      <div class="tour_content_slot">
                        <p>我们需要做一些准备工作：</p>
                        <p>1. 设置智能物料域名，去这里设置（系统设置 - <a href="${targetUrl[0]}" target="_blank">智能物料域名</a>）</p>
                        <p>2. 编辑完善我的名片，名片信息作为智能物料的重要传递内容，去这里编辑（个人设置 - <a href="${targetUrl[1]}?activeName=cardName" target="_blank">我的名片</a>）</p>
                        <div class="_f tour_content_slot_img _j_b" style="height:160px;">
                          <img alt="" title="" width="50%" height="100%" src="${require('@/assets/images/step-tour/briefcase/domain.png')}"/>
                          <img alt="" title="" width="50%" height="100%" src="${require('@/assets/images/step-tour/briefcase/myNameCard.png')}"/>
                        </div>
                        <p>如已完成，请单击下一步</p>
                      </div>
                    `,
                    params: {
                        ...params,
                        placement: 'right'
                    },
                    before: async (type) => new Promise((resolve, reject) => {
                        // previous next
                        resolve('foo');
                    })
                },
                {
                    key: 'content',
                    target: '#v-step-b-content',
                    ht: '新建智能物料',
                    content: `
                      <div class="tour_content_slot">
                        <p>选择要分享的文件，依次录入标题、描述，选择合适的分享预览图片，如尚未上传文件，去<a href="${targetUrl[2]}" target="_blank">资料库</a>上传，查看人登录Facebook授权默认勾选状态，也可取消勾选。</p>
                        <div class="_f tour_content_slot_img _j_s" style="height:160px;">
                          <img alt="" title="" width="50%" height="100%" src="${require('@/assets/images/step-tour/briefcase/libs.png')}"/>
                        </div>
                        <p>确认信息无误，请单击下一步</p>
                      </div>
                    `,
                    params: {
                        ...params,
                        placement: 'right'
                    }
                },
                {
                    key: 'preview',
                    target: '#v-step-b-preview',
                    ht: '预览',
                    content: `
                      <div class="tour_content_slot">
                        <p>编辑好智能物料信息后，可以单击预览按钮查看智能物料效果。</p>
                        <div class="_f tour_content_slot_img _j_s" style="height:285px;">
                          <img alt="" title="" width="300px" height="100%" src="${require('@/assets/images/step-tour/briefcase/preview.png')}"/>
                        </div>
                        <p>预览效果满意了，请单击下一步</p>
                      </div>
                    `,
                    params: {
                        ...params,
                        placement: 'right-end'
                    }
                },
                {
                    key: 'save',
                    target: '#v-step-b-save',
                    ht: '保存',
                    content: `
                      <div class="tour_content_slot">
                        <p>预览后如不想立即分享，单击【保存】按钮将智能物料信息进行保存，并返回到列表可以进行再次编辑或分享。</p>
                        <div class="_f tour_content_slot_img _j_s" style="height:217px;">
                          <img alt="" title="" width="495px" height="100%" src="${require('@/assets/images/step-tour/briefcase/save.png')}"/>
                        </div>
                      </div>
                    `,
                    params: {
                        ...params,
                        placement: 'right-end'
                    }
                },
                {
                    key: 'shared',
                    target: '#v-step-b-shared',
                    ht: '一键分享',
                    content: `
                      <div class="tour_content_slot" style="margin-bottom: 30px">
                        <p>物料准备好了开始分享给朋友或客户吧，点击【一键分享】即可，我们提供了四种分享方式：Facebook、Facebook Messenger、WhatsApp和邮件分享，选择其中之一进行分享即可。</p>
                        <div class="_f tour_content_slot_img _j_s" style="height:158px;">
                          <img alt="" title="" width="365px" height="100%" src="${require('@/assets/images/step-tour/briefcase/shared.png')}"/>
                        </div>
                      </div>
                    `,
                    params: {
                        ...params,
                        placement: 'right-end'
                    }
                }
            ];
        },
        defaultOptionsTour() {
            return {};
        }
    }
};
