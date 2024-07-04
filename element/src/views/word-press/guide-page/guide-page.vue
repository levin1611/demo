<template>
  <div class="swiper-container" style="height: calc(100vh - 65px ); overflow-y: auto;">
    <div class="swiper-wrapper">
      <!-- 轮播图第二页 -->
      <div class="swiper-slide guide-page-2" style="height: 100% ;">
        <!-- 标题 -->
        <div class="guide-page-title" style="height: 20%; ">
          <h1>自助网站建设</h1>
          <p>
            简单几步！即可快速创建响应式网站！基于AMP技术打造极致用户体验
          </p>
        </div>
        <!-- 内容 -->
        <div class="guide-page-body-2" style="height: 70%; ">
            <Row type="flex" justify="center" :gutter="200" style="margin-bottom:40px;margin-left:-50px;" v-for="(item,index) in guidePage2Data" :key="index">
            <Col :span="8" v-for="(childItem,childIndex) in item.children" :key="childIndex">
              <div>
                <span class="guide-number">{{childItem.guidePage2Number}}</span><span>{{childItem.guidePage2Title}}</span>
              </div>
              <div class="guide-step-logo">
                  <img :src="childItem.guidePage2Img" alt="">
              </div>
            </Col>
          </Row>
        </div>
        <!-- 建站按钮 -->
        <div style="height: 10%; ">
          <Button type="primary" @click="toCreateSite" class="amp-site-create">我要建站</Button>
        </div>
      </div>
      <!-- 轮播图第一页 -->
      <div class="swiper-slide guide-page-1" style="height: 100% ;">
        <!-- 标题 -->
        <div class="guide-page-title" style="height: 15%; ">
          <h1>定制化网站建设</h1>
          <p>
            我们用定位精准的创意驱动您的品牌与众不同，让我们一起为您的品牌创造惊艳之作
          </p>
        </div>
        <!-- 内容 -->
        <div class="guide-page-body-1" style="height: 75%; ">
            <Row
            type="flex"
            justify="center"
            :gutter="180"
            style="margin-bottom: 35px; "
            v-for="(item,index) in guidePage1Data"
            :key="index"
          >
            <Col :span="8" v-for="(childItem,childIndex) in item.children" :key="childIndex">
              <div class="guide-logo">
                 <Icon :custom="childItem.guidePage1Icon" style="font-size: 36px;color: #FA8241;"></Icon>
              </div>
              <h3>{{childItem.guidePage1Title}}</h3>
              <p>{{childItem.guidePage1Content}}</p>
            </Col>
          </Row>
        </div>
        <!-- 定制按钮 -->
        <div style="height: 10%; ">
            <Button type="primary" @click="visible_customization=true" class="custom-site-create">我要定制</Button>
        </div>
      </div>
    </div>

    <!-- 轮播图导航按钮 -->
    <div class="swiper-button-prev">
        <svg class="svg-icon custom"  aria-hidden="true" style="display: inline-block;font-size:50px;"><use xlink:href="#custom-left-switch"></use></svg>
    </div>
    <div class="swiper-button-next">
        <svg class="svg-icon custom"  aria-hidden="true" style="display: inline-block;font-size:50px;"><use xlink:href="#custom-right-switch"></use></svg>
    </div>

    <!-- 模态框 -->
    <!-- 我要定制模态框 -->
     <Modal
          :visible.sync="visible_customization"
          title="友情提示"
          :modal-append-to-body="false"
          :styles="{top: '300px'}"
          width="522px">
          <div>定制网站请联系：17600418800</div>
          <span slot="footer">
              <Button type="primary" @click="visible_customization=false">确 定</Button>
          </span>
      </Modal>
  </div>
</template>

<script>
    import Swiper from 'swiper';
    import '../../../../node_modules/swiper/css/swiper.min.css';
    export default {
        name: 'guide_page',
        mounted: function() {
            new Swiper('.swiper-container', {
                // 轮播图导航按钮
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev'
                }
            });
        },
        data() {
            return {
                /* 模态框 */
                visible_customization: false,

                /* 轮播页1 */
                guidePage1Data: [
                    {
                        children: [
                            { guidePage1Icon: 'custom custom-web-scheme', guidePage1Title: '网站策划', guidePage1Content: '根据前期分析报告，为企业定制详细的网站策划方案，包括品牌形象的网络化应用延伸、站点栏内容的设计以及功能设计等' },
                            { guidePage1Icon: 'custom custom-WEB-design', guidePage1Title: 'WEB设计', guidePage1Content: '丰富的制作经验和高超的创意水平，可根据企业的行业类型和产品特点，设计出更加商业化、国际化的网站' }
                        ]
                    },
                    {
                        children: [
                            { guidePage1Icon: 'custom custom-background-operation', guidePage1Title: '系统后台开发', guidePage1Content: '可定制和开发更加安全、稳定的网站后台管理系统，满足用户的各种功能需求，便于用户上传产品内容和实时更新公司新闻动态' },
                            { guidePage1Icon: 'custom custom-SEO-optimize', guidePage1Title: '整站SEO优化', guidePage1Content: '提供SEO整站优化，针对国外主流搜索引擎，获取更多关键词排名，带来更多流量' }
                        ]
                    },
                    {
                        children: [
                            { guidePage1Icon: 'custom custom-web-maintain', guidePage1Title: '网站维护', guidePage1Content: '对于客户网站上线后的维护问题，提供终身技术支持，为客户提供耐心的指导，真正解决客户网站建设、上线和后期维护问题' },
                            { guidePage1Icon: 'custom custom-SSL-certificate', guidePage1Title: 'SSL证书', guidePage1Content: '提供全球可信的SSL安全证书，加密访客与您网站之间的传输信息，防止您和客户之间的交流被监视，增强客户信任感，并有利于广告推广' }
                        ]
                    }
                ],

                /* 轮播页2 */
                guidePage2Data: [
                    {
                        children: [
                            { guidePage2Number: '1', guidePage2Title: '选择模板，选择符合企业标准的模板', guidePage2Img: require('../../../../static/img/zidongjianzhan1.png') },
                            { guidePage2Number: '2', guidePage2Title: '创建网站，给网站取个好听的名字', guidePage2Img: require('../../../../static/img/zidongjianzhan2.png') }
                        ]
                    },
                    {
                        children: [
                            { guidePage2Number: '3', guidePage2Title: '编辑网站，填写内容，将模板页面内容填充完整并保存', guidePage2Img: require('../../../../static/img/zidongjianzhan3.png') },
                            { guidePage2Number: '4', guidePage2Title: '预览发布网站，可随时预览页面，满意就发布吧', guidePage2Img: require('../../../../static/img/zidongjianzhan4.png') }
                        ]
                    }
                ]
            };
        },
        methods: {
            toCreateSite() {
                this.$store.state.showWitchComponent = 'selectTemplate';
                localStorage.setItem('currentSitePage', 'guidePage');
            }
        }
    };
</script>

<style lang="less" scoped>
// 导航按钮
.swiper-button-prev {
    left: 80px;
    width: 40px;
    outline: none;
}
.swiper-button-prev:after {
    content: " ";
}
.swiper-button-next {
    right: 80px;
    width: 40px;
    outline: none;
}
.swiper-button-next:after {
    content: " ";
}
// 轮播内容
.swiper-slide {
  padding: 50px 0;
  font-family: PingFangSC-Medium;
  text-align: center;
  .guide-page-title {
    h1 {
      font-size: 20px;
      color: rgba(0, 0, 0, 0.8);
      letter-spacing: 0;
      height: 35px;
    }
    p {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      letter-spacing: 0;
      height: 60px;
    }
  }
  .guide-page-body-1 {
    font-family: PingFangSC-Regular;
    color: rgba(0, 0, 0, 0.8);
    font-size: 12px;
    .guide-logo {
      margin: 0 auto;
    }
    h3 {
      font-size: 16px;
      height: 30px;
      margin-top: 8px;
    }
  }
  .guide-page-body-2 {
    text-align: left;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: rgba(0,0,0,0.80);
    .guide-number {
      display: inline-block;
      width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      background: #fa8241;
      color: #fff;
      border-radius: 50%;
      margin-right: 10px;
    }
    .guide-step-logo {
        margin: 10px 0 0 30px;
        height: 165px;
        img {
            height: 100%;
        }
    }
  }
}
</style>
