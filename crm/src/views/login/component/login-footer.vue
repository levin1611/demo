<!-- 顶部logo及切换语言按钮 -->
<template>
    <!-- 底部 -->
    <div class="urlListBox">
        <a :href="item.url" target="_blank" v-for="(item, index) in urlList" :key="index">{{$t(`login.url${index+1}`)}}</a>
        <a href="javascript:void(0)" id="leadscloudAdvisory">{{$t('login.url5')}}</a>
    </div>
    <div class="beianMiit">
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">京ICP备17009200号-10</a>
    </div>
</template>
<script setup>
import { t } from '@/locale';
// 底部数据
const urlList = [
    { title: t('login.url1'), url: 'https://www.leadscloud.com/' },
    { title: t('login.url2'), url: 'https://www.leadscloud.com/about-us/company/' },
    { title: t('login.url3'), url: 'https://www.leadscloud.com/about-us/contact-us/' },
    { title: t('login.url4'), url: 'https://www.leadscloud.com/products/marketing-crm/' }
];
</script>
<style lang="scss" scoped>
.urlListBox {
    margin-bottom: 16px;
    a {
      background: 0 0;
      text-decoration: none;
      outline: 0;
      cursor: pointer;
      transition: color .2s ease;
      display: inline-block;
      margin: 0 12px;
      line-height: 18px;
      color: #333333;
      position: relative;
      &:hover {
        color: #2D63BC; 
      }
      &::after {
        content: ' ';
        position: absolute;
        right: -12px;
        top: 3px;
        width: 1px;
        height: 12px;
        background: #DEDEDE;
      }
    }
    a:last-child {
      &::after {
        display: none;
      }
    }
  }
  .beianMiit {
    a {
      line-height: 18px;
      text-decoration: underline;
      color:rgba(0, 0, 0, 0.6);
      &:hover {
        color: #2D63BC;
      }
    }
  }
</style>