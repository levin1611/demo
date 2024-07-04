<template>
  <div class="template-station">
    <!-- 列表内容 -->
    <div style="position: relative;overflow-x: hidden">
      <Scroll
        :on-reach-bottom="handleReachBottom"
        :height="scrollHeight"
        v-if="totalNo > 0">
          <div class="">
              <Row  :gutter="24" class="web-block-inner" >
                  <Col :span="12" v-for="(item, index) in webDate"  :key="index" class="custom-col-12">
                      <Card class="amp-site-card">
                          <div class="amp-site-card-top">
                              <div class="top-left">
                                  <!-- 网站ico -->
                                  <div style="max-width: 64px;max-height: 64px">
                                      <img src="../../../../../public/image/defaultSiteIco.png"
                                           alt=""
                                           width="64"
                                           height="64"
                                           v-if="item.icon === null || item.icon === ''">
                                      <img :src="item.icon"
                                           alt=""
                                           width="64"
                                           height="64"
                                           v-else >
                                  </div>
                                  <!-- 网站名称 -->
                                  <div class="amp-site-title">
                                      <span class="site_title">
                                          <span v-if="item.publish_status==='1'" class="site_unpublished website_unpublish">{{$t('administerAMP.templateStation.unpublishedText')}}</span>
                                          <span v-else-if="item.publish_status==='2'" class="site_publishing">{{$t('administerAMP.templateStation.underText')}}</span>
                                          <span v-else class="site_published website_publish">{{$t('administerAMP.templateStation.publishedText')}}</span>
                                          <div style="display: flex;overflow: hidden" @mouseenter="showChangeName(index)" @mouseleave="hideChangeName(index)">
                                              <Tooltip :content="item.title" placement="top-start">
                                                <span class="site_title_title">{{item.title}}</span>
                                              </Tooltip>
                                              <span style="display: none;margin-left: 8px" ref="changeName" @click="handleChangeSiteName(item.title, item.id)">
                                                <Icon custom="custom-field-edit" size="12" class="website_edit_name"></Icon>
                                              </span>
                                          </div>

                                      </span>
                                      <span class="site_url" @click="handleUrlClick(item)">{{item.online_status === '3' ? item.domain_name : item.publish_domain}}</span>
                                      <div v-if="item.publish_status === '3' && item.online_status === '0'" class="visit-website">
                                          <span>{{$t('administerAMP.templateStation.visitPwdText')}}</span>
                                          <span style="margin-right:10px">
                                            {{
                                            item.publish_password
                                            }}
                                          </span>
                                          <Tooltip :content="$t('administerAMP.templateStation.copyPwdText')" placement="top">
                                              <icon
                                                      custom="custom custom-copy-black"
                                                      style="font-size: 14px;color: #6E819A; cursor: pointer;"
                                                      @click="copyText(item.publish_password)"
                                              ></icon>
                                          </Tooltip>
<!--                                          <div class="visit-website-btn" ">访问站点</div>-->
                                      </div>
                                  </div>
                              </div>
                              <div class="top-right">
                                  <p class="site_create_time">{{$t('administerAMP.templateStation.createdInText')}}{{item.formateCreateTime}}</p>
                                  <p class="site_update_time">{{$t('administerAMP.templateStation.updateInText')}}{{diffTime(item.computedTime)}}</p>
                              </div>
                          </div>
                          <div class="amp-site-card-bottom">
                              <!-- 按钮区域 -->
                              <div class="site_buttons">
                                  <Button class="site_edit website_edit"
                                          @click="openPage(null, item.id, 'site-edit', item.template_id)">
                                      {{$t('administerAMP.templateStation.netEditText')}}
                                  </Button>
                                  <Dropdown style="margin-left: 10px" placement="bottom-start">
                                      <Button class="content_manange website_content_manage" @click.native="openPage(1, item.id, 'product', item.template_id)">{{$t('administerAMP.templateStation.contetnText')}} <i class="custom custom-gengduo"></i> </Button>
                                      <DropdownMenu slot="dropdown" class="amp-custom-dropdown" style="padding: 0">
                                          <DropdownItem v-for="content in item.kinds" @click.native="openPage(content.id, item.id, content.name, item.template_id)" class="custom-dropdown" :class="`kind_content_${content.name}`">{{content.title}}</DropdownItem>
                                          <DropdownItem v-for="kind in content_kinds" @click.native="openPage(null, item.id, kind.name, item.template_id)" class="custom-dropdown" :class="`kind_content_${kind.name}`">{{kind.title}}</DropdownItem>
                                      </DropdownMenu>
                                  </Dropdown>
                                  <Dropdown style="margin-left: 10px" placement="bottom-start">
                                      <Button class="site_operate">{{$t('administerAMP.templateStation.operationText')}} <i class="custom custom-gengduo"></i></Button>
                                      <div @click.stop="mouseoutImg(index)">
                                          <DropdownMenu slot="dropdown" class="qrDropdown amp-custom-dropdown" style="padding: 0">
                                              <DropdownItem v-if="item.publish_status === '3'"
                                                            @click.native="visible_qr_code=true;qr_code_address = item.online_status==='3' ? item.domain_name : item.publish_domain"
                                                            class="custom-dropdown website_qr_scan"
                                              >{{$t('administerAMP.templateStation.phoneScanText')}}</DropdownItem>
                                              <DropdownItem @click.native="handleCopySite(item.id)" class="custom-dropdown website_copy">{{$t('administerAMP.templateStation.copyText')}}</DropdownItem>
                                              <DropdownItem @click.native="visible_confirm_delete=true;siteId=item.id" class="custom-dropdown website_delete">{{$t('administerAMP.templateStation.deleteText')}}</DropdownItem>
                                              <DropdownItem v-if="item.publish_status==='1'" @click.native="handlePublishModal(item)" class="custom-dropdown website_published">{{$t('administerAMP.templateStation.releaseText')}}</DropdownItem>
                                              <DropdownItem v-else-if="item.publish_status==='2'" class="custom-dropdown">{{$t('administerAMP.templateStation.underText')}}</DropdownItem>
                                              <DropdownItem v-else-if="item.publish_status==='3'" @click.native="handleUnpublishModal(item)" class="custom-dropdown website_unpublished">{{$t('administerAMP.templateStation.closeUnderText')}}</DropdownItem>
                                          </DropdownMenu>
                                      </div>
<!--                                      <div style="position: absolute;width: 80px; height: 80px" class="qrCodeArea" ref="qrCodeDiv">-->
<!--                                      </div>-->
                                  </Dropdown>
                              </div>
                              <!-- ssl证书区域-->
                              <div class="site_ssl">
                                  <p v-if="item.online_status !== '3'" class="site_ssl_tip website_bind_domain" @click="visible_bind_domain=true;siteId=item.id;bindDomain=item.domain_name">{{$t('administerAMP.templateStation.unboundText')}}</p>
                                  <p v-else class="site_ssl_tip website_bind_ssl" @click="handleSSLApply(item)"><Icon custom="custom-tip" size="14"></Icon>{{$t('administerAMP.templateStation.sslText')}}</p>
<!--                                  <HelpTip :title="$t('helpTip.domainResolve')"></HelpTip>-->
<!--                                  <p v-if="item.domain_name && item.publish_status === '3'" class="site_ssl_tip" @click="handleSSLApply(item)"><Icon custom="custom-tip" size="14"></Icon>域名解析及ssl证书</p>-->
                              </div>
                          </div>
                      </Card>
                  </Col>
<!--                  <Col :span="12"  v-if="index % 2 !== 0 && index + 1 < webDate.length">-->
<!--                      <Card class="amp-site-card">-->
<!--                          <div class="amp-site-card-top">-->
<!--                              <div class="top-left">-->
<!--                                  &lt;!&ndash; 网站ico &ndash;&gt;-->
<!--                                  <div style="max-width: 64px;max-height: 64px">-->
<!--                                      <img src="../../../../../public/image/defaultSiteIco.png"-->
<!--                                           alt=""-->
<!--                                           width="64"-->
<!--                                           height="64"-->
<!--                                           v-if="item.icon === null || item.icon === ''">-->
<!--                                      <img :src="item.icon"-->
<!--                                           alt=""-->
<!--                                           width="64"-->
<!--                                           height="64"-->
<!--                                           v-else >-->
<!--                                  </div>-->
<!--                                  &lt;!&ndash; 网站名称 &ndash;&gt;-->
<!--                                  <div class="amp-site-title">-->
<!--                                      <p class="site_title" @mouseenter="showChangeName(index)" @mouseleave="hideChangeName(index)">-->
<!--                                          <span>{{item.title}}</span>-->
<!--                                          <span style="display: none;" ref="changeName">-->
<!--                                              <Icon custom="custom-field-edit" size="12"></Icon>-->
<!--                                          </span>-->
<!--                                          <span v-if="item.publish_status==='1'" class="site_unpublished">未发布</span>-->
<!--                                          <span v-else-if="item.publish_status==='2'" class="site_publishing">发布中</span>-->
<!--                                          <span v-else class="site_published">已发布</span>-->
<!--                                      </p>-->
<!--                                      <p class="site_url">{{item.domain_name ? item.domain_name : item.publish_domain}}</p>-->
<!--                                  </div>-->
<!--                              </div>-->
<!--                              <div class="top-right">-->
<!--                                  <p class="site_create_time">创建于{{item.create_time}}</p>-->
<!--                                  <p class="site_update_time">更新于18分钟</p>-->
<!--                              </div>-->
<!--                          </div>-->
<!--                          <div class="amp-site-card-bottom">-->
<!--                              &lt;!&ndash; 按钮区域 &ndash;&gt;-->
<!--                              <div class="site_buttons">-->
<!--                                  <Button class="site_edit"-->
<!--                                          @click="openPage(null, item.id, 'site-edit', item.template_id)">-->
<!--                                      网站编辑-->
<!--                                  </Button>-->
<!--                                  <Dropdown style="margin-left: 10px" placement="bottom-start">-->
<!--                                      <Button class="content_manange" >内容管理 <i class="custom custom-gengduo"></i></Button>-->
<!--                                      <DropdownMenu slot="dropdown">-->
<!--                                          <DropdownItem v-for="content in item.kinds" @click.native="openPage(content.id, item.id, content.name, item.template_id)">{{content.title}}</DropdownItem>-->
<!--                                          <DropdownItem v-for="kind in content_kinds" @click.native="openPage(null, item.id, kind.name, item.template_id)">{{kind.title}}</DropdownItem>-->
<!--                                      </DropdownMenu>-->
<!--                                  </Dropdown>-->
<!--                                  <Dropdown style="margin-left: 10px" placement="bottom-start">-->
<!--                                      <Button class="site_operate">操作 <i class="custom custom-gengduo"></i></Button>-->
<!--                                      <DropdownMenu slot="dropdown">-->
<!--                                          <DropdownItem>手机扫码</DropdownItem>-->
<!--                                          <DropdownItem>复制</DropdownItem>-->
<!--                                          <DropdownItem>删除</DropdownItem>-->
<!--                                          <DropdownItem>发布</DropdownItem>-->
<!--                                      </DropdownMenu>-->
<!--                                  </Dropdown>-->
<!--                              </div>-->
<!--                              &lt;!&ndash; ssl证书区域&ndash;&gt;-->
<!--                              <div class="site_ssl">-->
<!--                                  <p v-if="item.ssl_status === '0'" class="site_ssl_tip">未绑定自定义域名？</p>-->
<!--                                  <p v-else class="site_ssl_tip"><Icon custom="custom-tip" size="14"></Icon>域名解析及ssl证书</p>-->
<!--                              </div>-->
<!--                          </div>-->
<!--                      </Card>-->
<!--                  </Col>-->
              </Row>

          </div>
      <!-- <div v-if="totalNo > 0" :style="{'height':`${scrollHeight}px`,'overflow':'auto'}" v-infinite-scroll="handleReachBottom" infinite-scroll-immediate="false" :infinite-scroll-distance="10"> -->


      <!-- </div> -->
      </Scroll>
      <!-- 加载图标 -->
      <Spin fix v-show="spinShow" size="large"></Spin>
      <!-- 暂无数据 -->
      <!-- <div
        style="text-align: center;padding-top:300px;height:750px;"
        v-if="spinShow === false && totalNo === 0"
      >暂无数据</div> -->
      <div
        style="text-align: center;padding-top:300px;height:750px;"
        v-if="spinShow === false && totalNo === 0"
      >{{$t('crm.Table.noData')}}</div>
    </div>

    <!-- 模态框 -->
    <!-- 确认发布 -->
    <Modal
      :visible.sync="visible_confirm_pulish"
      :modal-append-to-body="false"
      width="522px"
      :styles="{ top: '300px' }"
      title="发布"
      :close-on-click-modal="false"
    >
      <span style="font-size: 12px;color:  rgba(0,0,0,0.80)">{{$t('administerAMP.templateStation.haveNotText')}}</span>
      <Input v-model="publishDomain" :readonly="true"></Input>
      <span style="font-size: 12px;color:  rgba(0,0,0,0.80)">{{$t('administerAMP.templateStation.definitionText')}}<span style="font-size: 12px;color:#4285F4" @click="goSetting()">{{$t('administerAMP.templateStation.setUpText')}}</span></span>
      <span slot="footer" class="dialog-footer">
        <Button @click="visible_confirm_pulish=false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
        <Button type="primary" @click="publishWebsite(0)" class="website-publish-confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
<!--        <Button type="primary" class="website-publish-confirm" v-else>发布中</Button>-->
    </span>
    </Modal>
    <!-- 发布中系统提示 -->
<!--    <Modal :visible.sync="visible_system_pulishing" :styles="{ top: '300px' }" title="系统提示" width="522px" :modal-append-to-body="false">-->
<!--      <div>网站发布中，请稍后查看网站状态。</div>-->
<!--      <div>发布过程中请不要随意编辑内容以免产生内容异常。</div>-->
<!--      <span slot="footer">-->
<!--        <Button type="primary" @click="visible_system_pulishing = false">确 定</Button>-->
<!--      </span>-->
<!--    </Modal>-->
    <!-- 确认上线 -->
    <Modal
      :visible.sync="visible_confirm_online"
      :modal-append-to-body="false"
      :title="$t('administerAMP.templateStation.onlineText')"
      :styles="{ top: '300px' }"
      width="522px"
      :close-on-click-modal="false"
    >
<!--      <div>您确定要上线网站么？</div>-->
        <Form :model="onlineDomainForm" label-width="50px">
            <FormItem :label="$t('administerAMP.templateStation.domainText')">
                <Input v-model="onlineDomainForm.domainName" placeholder="www.example.com" @blur="handleDomainBlur"/>
                <Tag type="warning" v-if="domainBlur">{{$t('administerAMP.templateStation.pleaseDomainText')}}</Tag>
            </FormItem>
            <FormItem>
                <Input v-model="onlineDomainForm.chatDomainName" placeholder="chat.example.com" @blur="handleChatBlur" :disabled="true"/>
                <Tag type="warning" v-if="chatBlur">{{$t('administerAMP.templateStation.secDomainText')}}</Tag>
            </FormItem>
            <FormItem label="解析">
                <div>{{$t('administerAMP.templateStation.netDomainText')}} {{onlineDomainForm.domainName}} {{$t('administerAMP.templateStation.cNameText')}}web.leadscloud.com</div>
                <div>{{$t('administerAMP.templateStation.chatDomainText')}} {{onlineDomainForm.chatDomainName}} {{$t('administerAMP.templateStation.cNameText')}}chat.leadscloud.com</div>
            </FormItem>
        </Form>
      <span slot="footer" class="dialog-footer">
        <Button @click="visible_confirm_online=false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
        <Button type="primary" @click="onlineWebsite(2)" class="website-online-confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
    </span>
    </Modal>
    <!-- 上线中系统提示 -->
    <Modal :visible.sync="visible_system_onlining" :styles="{ top: '300px' }" :title="$t('administerAMP.templateStation.systemText')" width="522px" :modal-append-to-body="false" :close-on-click-modal="false">
      <div>{{$t('administerAMP.templateStation.onlinIngText')}}</div>
      <div>{{$t('administerAMP.templateStation.doNotEditText')}}</div>
      <span slot="footer">
        <Button type="primary" @click="visible_system_onlining = false">{{$t('administerAMP.templateStation.defineText')}}</Button>
      </span>
    </Modal>
    <!--  确认删除 -->
    <Modal :visible.sync="visible_confirm_delete"
           :title="$t('administerAMP.templateStation.deletionText')"
           :styles="{top: '300px'}"
           width="522px"
           v-loading="deleteLoading"
           :modal-append-to-body="false"
           :close-on-click-modal="false">
        <span>{{$t('administerAMP.templateStation.doYouDelText')}}</span>
        <span slot="footer" class="dialog-footer">
            <Button @click="visible_confirm_delete = false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
            <Button @click="deleteWebsite" type="primary" class="website-delete-confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
        </span>
    </Modal>
    <!-- 确认下线 -->
    <Modal
      :visible.sync="visible_confirm_outline"
      :modal-append-to-body="false"
      :title="$t('administerAMP.templateStation.offlineText')"
      :styles="{ top: '300px' }"
      width="522px"
      :close-on-click-modal="false"
    >
      <div>{{$t('administerAMP.templateStation.doYouOffText')}}</div>
      <span slot="footer" class="dialog-footer">
        <Button @click="visible_confirm_outline=false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
        <Button type="primary" @click="visible_confirm_outline=false;onlineWebsite(4)" class="website-offline-confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
    </span>
    </Modal>
    <!-- 下线中系统提示 -->
    <Modal :visible.sync="visible_system_outlining" :styles="{ top: '300px' }" :title="$t('administerAMP.templateStation.systemText')" width="522px" :modal-append-to-body="false" :close-on-click-modal="false">
      <div>{{$t('administerAMP.templateStation.offliningText')}}</div>
      <span slot="footer">
        <Button type="primary" @click="visible_system_outlining = false">{{$t('administerAMP.templateStation.defineText')}}</Button>
      </span>
    </Modal>
      <!-- 上线成功 -->
      <Modal :visible.sync="visible_success_online"
             :modal-append-to-body="false"
             :title="$t('administerAMP.templateStation.onlineSuccessText')"
             :styles="{top: '300px'}"
             width="522px"
             :close-on-click-modal="false">
          <div>
              <span>{{$t('administerAMP.templateStation.websiteText')}}“{{onlineSuccessData.title}}”{{$t('administerAMP.templateStation.workText')}}</span>
          </div>
          <div>
              <div>
                  <span>1. {{$t('administerAMP.templateStation.work1')}} {{onlineSuccessData.domain_name}} {{$t('administerAMP.templateStation.workafter1')}} web.leadscloud.com；</span>
              </div>
              <div>
                  <span>2. {{$t('administerAMP.templateStation.work2')}} chat.{{onlineSuccessData.chat_domain_name}} {{$t('administerAMP.templateStation.workafter2')}} chat.leadscloud.com.</span>
              </div>
              <div>
                  <span>3. {{$t('administerAMP.templateStation.work3')}}{{onlineSuccessData.domain_name}}、chat.{{onlineSuccessData.chat_domain_name}} {{$t('administerAMP.templateStation.workafter3')}}</span>
              </div>

          </div>
          <div>
              <span>{{$t('administerAMP.templateStation.finishText')}}</span>
          </div>
          <span slot="footer" class="dialog-footer">
<!--              <Button @click="visible_success_online = false;" type="primary">确 定</Button>-->
              <Button @click="visibleSuccessOnline()" type="primary">{{$t('administerAMP.templateStation.defineText')}}</Button>
          </span>
      </Modal>
      <!-- 修改网站名称  -->
      <Modal :visible.sync="visible_change_name"
             :modal-append-to-body="false"
             :title="$t('administerAMP.templateStation.editNetNameText')"
             width="500px"
             :styles="{top: '300px'}"
             :close-on-click-modal="false">
          <Input v-model="changingName"></Input>
          <span slot="footer" class="dialog-footer">
              <Button @click="visible_change_name=false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
              <Button type="primary" @click="handleChangeName()" class="website_edit_confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
          </span>
      </Modal>
      <!--  复制网站    -->
      <Modal :visible.sync="visible_copy_site"
             :modal-append-to-body="false"
             :title="$t('administerAMP.templateStation.copyDefineText')"
             width="500px"
             :styles="{top: '300px'}"
             :close-on-click-modal="false">
          <span>{{$t('administerAMP.templateStation.doYouCopyNetText')}}</span>
          <span slot="footer" class="dialog-footer">
              <Button @click="visible_copy_site=false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
              <Button type="primary" @click="copySiteConfirm()" class="copy_confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
          </span>
      </Modal>
      <!-- 公开发布弹窗     -->
      <Modal :visible.sync="visible_confirm_public_publish"
             :modal-append-to-body="false"
             :title="$t('administerAMP.templateStation.releaseText')"
             width="500px"
             :styles="{top: '300px'}"
             :close-on-click-modal="false">
          <Radio v-model="publishRadio" label="1" style="margin-bottom: 20px">
              <span style="font-size: 12px;color: rgba(0,0,0,0.80);">{{$t('administerAMP.templateStation.selectText')}}</span>
              <div style="margin-top: 12px">
                  <Input v-model="publishDomain" :readonly="true" style="width: 450px"></Input>
              </div>
          </Radio>
          <Radio v-model="publishRadio" label="2">
              <span style="font-size: 12px;color: rgba(0,0,0,0.80);">{{$t('administerAMP.templateStation.selectCustom')}}</span>
              <div style="margin-top: 12px">
                  <Select v-model="bindDomain" style="width: 450px">
                      <Option v-for="item in domainUrl" :key="item.value" :label="item.label" :value="item.value">{{item.label}}</Option>
                  </Select>
              </div>

          </Radio>
          <span slot="footer" class="dialog-footer">
              <Button @click="visible_confirm_public_publish=false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
              <Button type="primary" @click="public_publish_confirm()" :disabled="publishRadio==='2' && bindDomain===''" class="website_publish_confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
<!--              <Button type="primary" v-else>发布中</Button>-->
          </span>
      </Modal>
      <!-- 取消发布     -->
      <Modal :visible.sync="visible_confirm_unpublish"
             :modal-append-to-body="false"
             :title="$t('administerAMP.templateStation.unpublishText')"
             width="500px"
             :styles="{top: '300px'}"
             :close-on-click-modal="false">
          <span style="font-size: 12px;color: rgba(0,0,0,0.80);">{{$t('administerAMP.templateStation.doYouUnpublishText')}}</span>
          <span slot="footer" class="dialog-footer">
              <Button @click="visible_confirm_unpublish=false">{{$t('administerAMP.templateStation.cancelText')}}</Button>
              <Button type="primary" @click="unpublishConfirm" class="website_unpublish_confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
          </span>
      </Modal>
      <!-- 绑定自定义域名     -->
      <Modal :visible.sync="visible_bind_domain"
             :modal-append-to-body="false"
             :title="$t('administerAMP.templateStation.bindText')"
             width="500px"
             :styles="{top: '300px'}"
             :close-on-click-modal="false"
             @opened="getDomainUrls">
          <Select v-model="bindDomain" style="width: 445px">
              <Option v-for="item in domainUrl" :key="item.value" :label="item.label" :value="item.value" class="amp-custom-option" style="padding: 0 0 0 5px">{{item.label}}</Option>
          </Select>
          <div style="margin-top: 18px">
              <span style="font-size: 12px;color:  rgba(0,0,0,0.80)">{{$t('administerAMP.templateStation.haveBindText')}}<span style="font-size: 12px;color:#4285F4" @click="goSetting()" class="website_go_setting">{{$t('administerAMP.templateStation.goBingText')}}</span></span>
          </div>
          <span slot="footer" class="dialog-footer">
              <Button @click="visible_bind_domain=false;bindDomain=''">{{$t('administerAMP.templateStation.cancelText')}}</Button>
              <Button type="primary" @click="bindDomainConfirm()" :disabled="!bindDomain" class="bind_domain_confirm">{{$t('administerAMP.templateStation.defineText')}}</Button>
          </span>
      </Modal>
      <!--域名解析以及SSL证书      -->
      <Modal :visible.sync="visible_apply_ssl"
             :modal-append-to-body="false"
             width="740px"
             :styles="{top: '300px'}"
             :close-on-click-modal="false">
          <h3 slot="title" class="ssl_modal_title">
              <span>{{$t('administerAMP.templateStation.sslSetText')}}</span>
              <HelpTip :title="$t('helpTip.domainResolve')" style="position: relative;top: -2px;margin-left: 8px"></HelpTip>
          </h3>
          <span style="font-size: 12px;color: rgba(0,0,0,0.80);">{{$t('administerAMP.templateStation.websitePublishedText')}}</span>
          <div style="margin-top: 20px;margin-bottom: 20px">
              <span style="font-size: 14px;color: rgba(0,0,0,0.80);font-weight: 900">{{$t('administerAMP.templateStation.firstText')}}</span>
          </div>
          <div style="display: flex;justify-content: space-between;align-items: center" class="ssl-div">
              <Input v-model="domainName" :readonly="true"></Input>
              <span style="font-size: 12px;color: rgba(0,0,0,0.80);">{{$t('administerAMP.templateStation.cnameBigText')}}</span>
              <Input value="web.leadscloud.com" :readonly="true"></Input>
          </div>
          <div style="display: flex;justify-content: space-between;align-items: center" class="ssl-div">
              <Input v-model="chatDomainName" :readonly="true"></Input>
              <span style="font-size: 12px;color: rgba(0,0,0,0.80);">{{$t('administerAMP.templateStation.cnameBigText')}}</span>
              <Input value="chat.leadscloud.com" :readonly="true"></Input>
          </div>
          <!-- todo 判断domainName是否含有www  -->
          <div style="display: flex;justify-content: space-between;align-items: center" class="ssl-div" v-if="checkUrl(domainName)">
              <Input v-model="computedDomainName" :readonly="true"></Input>
              <span style="font-size: 12px;color: rgba(0,0,0,0.80);">{{$t('administerAMP.templateStation.cnameBigText')}}</span>
              <Input value="web.leadscloud.com" :readonly="true"></Input>
          </div>
          <span style="font-size: 14px;color: rgba(0,0,0,0.80);font-weight: 900">
              {{$t('administerAMP.templateStation.secondText')}}
              <Tooltip :content="$t('administerAMP.templateStation.secondDescribeText')" placement="right">
                  <Icon custom="custom-tip" size="16"></Icon>
              </Tooltip>
          </span>
          <div style="display: flex;justify-content: space-between;margin-top: 16px;margin-bottom: 21px">
              <Input v-model="domainName" style="width: 42%" class="width_42" :readonly="true"></Input>
              <Input v-model="chatDomainName" :readonly="true" style="width: 42%" class="width_42"></Input>
          </div>
          <span style="font-size: 12px;color: rgba(0,0,0,0.80);">
              <svg class="svg-icon custom" aria-hidden="true" style="width:20px;height:20px"><use xlink:href="#custom-warning"></use></svg>
             <span style="display: inline-block;margin-left: 8px">{{$t('administerAMP.templateStation.clickSSLText')}}</span>
          </span>
          <span slot="footer" class="dialog-footer">
              <Button type="primary" @click="applySSL" v-if="!visible_isApplied" class="apply_ssl_confirm">{{$t('administerAMP.templateStation.applyText')}}</Button>
              <Tooltip placement="right" :content="visible_isApplied ? sslAppliedTip : sslNotApplyTip">
                  <Button type="primary" plain class="applied_button" v-if="visible_isApplied">{{$t('administerAMP.templateStation.appliedText')}}</Button>
              </Tooltip>
          </span>
      </Modal>
      <!-- 网站二维码弹窗 -->
      <Modal :visible.sync="visible_qr_code"
             :modal-append-to-body="false"
             width="250px"
             :styles="{top: '300px'}"
             @opened="handleQRCode(qr_code_address)"
             @closed="mouseoutImg()"
             :close-on-click-modal="true"
             :show-close="false"
             class="qrcode_modal_dialog"   >
          <h3 slot="title" style="margin: 0 auto">{{$t('administerAMP.templateStation.scanCodeText')}}</h3>
          <div style="width: 200px; height: 200px; margin: 15px auto" class="qrCodeArea" ref="qrCodeDiv">
          </div>
      </Modal>
  </div>
</template>
<script>
    import util from '@/libs/util';
    import QRCode from 'qrcodejs2';
    const clickoutside = {
        bind(el, binding, vnode) {
            function documentHandler(e) {
                // 判断是否点击元素本身
                if (el.contains(e.target)) {
                    return false;
                }
                // 判断指令中是否绑定了函数
                if (binding.expression) {
                    binding.value(e);
                }
            }
            el.__vueClickOutside__ = documentHandler;
            document.addEventListener('click', documentHandler);
        },
        update() {},
        unbind(el, binding) {
            document.removeEventListener('click', el.__vueClickOutside__);
            delete el.__vueClickOutside__;
        }
    };
    export default {
        name: 'template_station',
        props: ['openTemplateData', 'category', 'searchVal', 'searchResult'],
        data() {
            return {
                setTimer: null,
                setInterval: null,
                onlineSuccessData: {},
                deleteLoading: true,
                onlineDomainForm: {
                    domainName: '', // 网站域名
                    chatDomainName: '' // 网站聊天二级域名
                },
                domainBlur: false,
                chatBlur: false,
                spinShow: true,
                /* 站点列表 */
                webDate: [],
                pageNo: 1, // 默认显示第一页
                pageSize: 100, // 设置每页显示条数
                totalNo: 0, // 返回数据总条数
                totalPages: 0, // 返回数据页数

                /* 站点信息 */
                id: '', // 站点id
                domainName: '', // 站点域名
                publishDomain: '', // 站点域名（询盘云）

                /* 模态框 */
                // 确认发布
                visible_confirm_pulish: false,
                visible_system_pulishing: false,
                visible_confirm_public_publish: false,
                // 确认上线
                visible_confirm_online: false,
                visible_system_onlining: false,
                visible_confirming_online_new: false, // 自动建站V1.1.0 控制新增确认上线弹窗
                // 确认下线
                visible_confirm_outline: false,
                visible_system_outlining: false,
                // 确认删除
                visible_confirm_delete: false,
                visible_system_deleting: false,
                // 上线成功
                visible_success_online: false,
                // 修改网站名称
                visible_change_name: false,
                // 复制网站
                visible_copy_site: false,
                // 绑定自定义域名
                visible_bind_domain: false,
                // SSL证书申请
                visible_apply_ssl: false,
                // 取消发布
                visible_confirm_unpublish: false,
                // 二维码弹窗
                visible_qr_code: false,
                qr_code_address: '',
                // 内容管理固定部分
                content_kinds: [
                    {
                        name: 'pics-management',
                        title: this.$t('administerAMP.templateStation.imgText')
                    },
                    {
                        name: 'video-management',
                        title: this.$t('administerAMP.templateStation.videoText')
                    },
                    {
                        name: 'files-management',
                        title: this.$t('administerAMP.templateStation.fileText')
                    },
                    {
                        name: 'site-settings',
                        title: this.$t('administerAMP.templateStation.netSetText')
                    }
                ],
                changingName: '',
                siteId: null,
                publishRadio: '1',
                domainUrl: [],
                bindDomain: '',
                chatDomainName: '',
                visible_isApplied: false,
                sslAppliedTip: this.$t('administerAMP.templateStation.sslIsItValidText'),
                sslNotApplyTip: this.$t('administerAMP.templateStation.sslNotYetText')
            };
        },
        computed: {
            scrollHeight() {
                return document.documentElement.clientHeight - 120;
            },
            computedDomainName() {
                // 如果使用到这个变量 那么一定是以www.开头的 所以直接按照索引截取即可
                return this.domainName.slice(4);
            }
        },
        methods: {
            /* 删除站点 */
            deleteWebsite() {
                // util.ajax({
                //     url: `${util.AutomaticSiteUrl}/trunk/site/remove`,
                //     method: 'post',
                //     data: {
                //         siteId: Number(this.siteId) // 站点id
                //     }
                // })
                util.ajaxAMP({
                    url: '/trunk/site/remove',
                    method: 'post',
                    data: {
                        siteId: Number(this.siteId) // 站点id
                    }
                })
                    .then(res => {
                        if (res.data.code === 0) {
                            // 删除弹窗停止loading
                            this.visible_system_deleting = true;
                            this.visible_confirm_delete = false;
                            this.deleteLoading = false;
                            this.webDate = [];
                            this.pageNo = 1;
                            this.getWebUrl();
                            // 删除网站拉取网站列表同时更新分类数量
                            this.postParentCom();
                            this.$Message.success(this.$t('administerAMP.templateStation.msg1'));
                        // 弹出删除成功的弹窗
                        } else {
                            // this.$Message.error({
                            //     message: '下载失败，请重试！'
                            // });
                            this.$Message.error(res.data.msg);
                            this.deleteLoading = false;
                            this.visible_confirm_delete = false;
                        // 弹出删除失败的弹窗
                        // 删除弹窗停止loading
                        }
                    });
            },
            handleDomainBlur() {
                if (this.onlineDomainForm.domainName === '') {
                    this.domainBlur = true;
                } else {
                    this.domainBlur = false;
                }
            },
            handleChatBlur() {
                if (this.onlineDomainForm.chatDomainName === '') {
                    this.chatBlur = true;
                } else {
                    this.chatBlur = false;
                }
            },
            /* 鼠标移入显示二维码 */
            mouseoverImg(address) {
                // console.log('index is ', index);
                // console.log('address is ', address);
                console.log(this.$refs.qrCodeDiv);
                // let temp = Number(index)
                // document.querySelectorAll('.qrDropdown')[index].style.display = 'none'
                this.$refs.qrCodeDiv.style.display = 'block';
                this.handleQRCode(address);
            },
            /* 鼠标移除隐藏二维码 */
            mouseoutImg() {
                // this.$refs.qrCodeDiv.style.display = 'none';
                this.$refs.qrCodeDiv.innerHTML = '';
                // document.querySelectorAll('.qrDropdown')[index].style.display = 'block'
            },
            handleQRCode(address) {
                // console.log('11111', this.$refs.qr);
                const qrcode = new QRCode(this.$refs.qrCodeDiv, {
                    width: 200,
                    height: 200,
                    text: `https://${address}`
                });
                console.log(qrcode);
            },
            // 访问站点
            visitWebsite(domain) {
                window.open(`//${domain}`, '_blank'); // 新窗口打开外链接
            },
            // 复制文本
            copyText(text) {
                const createInput = document.createElement('input');
                createInput.value = text;
                document.body.appendChild(createInput);
                createInput.select(); // 选择对象
                document.execCommand('Copy'); // 执行浏览器复制命令
                createInput.style.display = 'none';
                this.$Message.success(this.$t('administerAMP.templateStation.msg2'));
            },
            // 发布网站
            publishWebsite(online) {
                this.visible_confirm_pulish = false;
                util
                    .ajax({
                        url: `${util.AutomaticSiteUrl}/trunk/site/publish`,
                        method: 'post',
                        data: {
                            siteId: this.siteId, // 站点id
                            online: online
                        }
                    })
                    .then(response => {
                        if (response.data.code === 0) {
                            this.webDate = [];
                            this.getWebUrl();
                            this.visible_system_pulishing = true;
                            const _this = this;
                            this.setInterval = window.setInterval(() => {
                                _this.setTimer = setTimeout(this.pollingSiteStatus(this.siteId), 0);
                            }, 5000);
                        } else {
                            this.$Message({
                                message: response.data.msg,
                                type: 'error',
                                duration: 3000
                            });
                        }
                    })
                    .catch(error => {
                        this.$Message({
                            message: this.$t('administerAMP.templateStation.msg3'),
                            type: 'error',
                            duration: 3000
                        });
                    });
            },
            // 上/下线网站
            onlineWebsite(onOrOut) {
                if (onOrOut == 2) {
                    if (!this.onlineDomainForm.domainName) {
                        console.log('!!!!!!');
                        this.$Message.error({
                            message: this.$t('administerAMP.templateStation.msg4')
                        });
                        return;
                    }
                    util.ajax({
                        url: `${util.AutomaticSiteUrl}/trunk/site/editDomain`,
                        method: 'post',
                        data: {
                            id: this.id,
                            domain_name: this.onlineDomainForm.domainName
                        }
                    }).then(res => {
                        if (res.data.code === 0) {
                            this.visible_confirm_online = false;
                            this.webDate = [];
                            this.getWebUrl();
                            if (onOrOut === 2) {
                                this.visible_system_onlining = true;
                                const _this = this;
                                this.setInterval = window.setInterval(() => {
                                    _this.setTimer = setTimeout(this.pollingSiteStatus(this.id, 0), 0);
                                }, 5000);
                            } else {
                                this.visible_system_outlining = true;
                            }
                        } else {
                            this.$Message.error({
                                message: res.data.msg
                            });
                        }
                    }).catch(error => {
                        if (onOrOut === 2) {
                            this.$Message.error({
                                message: this.$t('administerAMP.templateStation.msg5')
                            });
                        } else {
                            this.$Message.error({
                                message: this.$t('administerAMP.templateStation.msg6')
                            });
                        }
                    });
                } else {
                    util
                        .ajax({
                            url: `${util.AutomaticSiteUrl}/trunk/site/setOnline`,
                            method: 'post',
                            data: {
                                id: this.id, // 站点id
                                online_status: onOrOut // 上线状态，上线时设置为2，下线时设置为4
                            }
                        })
                        .then(response => {
                            if (response.data.code === 0) {
                                this.webDate = [];
                                this.getWebUrl();
                                if (onOrOut === 4) {
                                    this.visible_system_onlining = true;
                                    const _this = this;
                                    this.setInterval = window.setInterval(() => {
                                        _this.setTimer = setTimeout(this.pollingSiteStatus(this.id, 1), 0);
                                    }, 5000);
                                } else {
                                    this.visible_system_outlining = true;
                                }
                            } else {
                                this.$Message({
                                    message: response.data.msg,
                                    type: 'error',
                                    duration: 3000
                                });
                            }
                        })
                        .catch(erro => {
                            if (onOrOut === 2) {
                                this.$Message({
                                    message: this.$t('administerAMP.templateStation.msg5'),
                                    type: 'error',
                                    duration: 3000
                                });
                            } else {
                                this.$Message({
                                    message: this.$t('administerAMP.templateStation.msg6'),
                                    type: 'error',
                                    duration: 3000
                                });
                            }
                        });
                }
            },
            /* 轮询获得网站状态 */
            pollingSiteStatus(id) {
                // util.ajax({
                //     url: `${util.AutomaticSiteUrl}/trunk/site/info`,
                //     method: 'post',
                //     data: {
                //         siteId: id
                //     }
                // })
                util.ajaxAMP({
                    url: '/trunk/site/info',
                    method: 'post',
                    data: {
                        siteId: id
                    }
                })
                    .then(res => {
                        if (res.data.code === 0) {
                            console.log('worked');
                            const data = res.data.data;
                            // 上线状态变为已上线时，停止轮询
                            if (data.publish_status === '3') {
                                // 停止轮询
                                this.$Message.success(this.$t('administerAMP.templateStation.msg7'));
                                this.setTimer = null;
                                clearInterval(this.setInterval);
                                this.webDate = [];
                                this.getWebUrl();
                                // 调用弹窗
                                this.visible_system_pulishing = false;
                                this.visible_confirm_pulish = false;
                            // 传参给弹窗
                            // this.onlineSuccessData = data;
                            // if (data.domain_name) {
                            //     const domain_name = data.domain_name;
                            //     this.onlineSuccessData.chat_domain_name = domain_name.substring(domain_name.indexOf('.') + 1);
                            // }
                            }

                        // this.webDate = [];
                        // this.getWebUrl();
                        // 停止轮询并修改响应状态 拉去他的状态 或者直接调用getlist方法
                        }
                    });
            },
            // 获取站点列表
            getWebUrl() {
                // util
                //     .ajax({
                //         url: `${util.AutomaticSiteUrl}/trunk/site/list`,
                //         method: 'post',
                //         data: {
                //             page: this.pageNo,
                //             page_size: this.pageSize
                //         }
                //     })
                util.ajaxAMP({
                    url: '/trunk/site/list',
                    method: 'post',
                    data: {
                        page: this.pageNo,
                        page_size: this.pageSize
                    }
                })
                    .then(response => {
                        // debugger;
                        this.spinShow = false;
                        if (response.data.code === 0) {
                            this.totalNo = response.data.data.total;
                            this.totalPages = response.data.data.pages;
                            const tempIds = this.webDate.map(item => item.id);
                            const result = response.data.data.items.filter(item => !tempIds.includes(item.id));
                            this.webDate = this.webDate.concat(result);
                            let temp = this.webDate;
                            if (temp.length > 0 && Array.isArray(temp)) {
                                temp.forEach(item => {
                                    item.kinds.forEach(kind => {
                                        if (!kind.title.includes('管理')) {
                                            kind.title = `${kind.title}管理`;
                                        }
                                    });
                                    const computedTime = this.computeUpdateTime(item.last_update_time);
                                    const formateCreateTime = this.getFormatDate(item.create_time);
                                    this.$set(item, 'computedTime', computedTime);
                                    this.$set(item, 'formateCreateTime', formateCreateTime);
                                });
                            }
                            if (this.category === 'unpublished') {
                                temp = temp.filter(item => item.publish_status === '1');
                            } else if (this.category === 'published') {
                                temp = temp.filter(item => item.publish_status === '3');
                            } else {
                                // do nothing
                                this.postParentCom();
                            }
                            this.webDate = temp;
                            this.$store.state.TemplateStationNum = response.data.data.total;
                        } else {
                            this.$Message({
                                message: response.data.msg,
                                type: 'error',
                                duration: 3000
                            });
                        }
                    })
                    .catch(erro => {
                        console.log('erro', erro);
                        this.spinShow = false;
                        this.$Message({
                            message: this.$t('administerAMP.templateStation.msg8'),
                            type: 'error',
                            duration: 3000
                        });
                    });
            },
            // 滚到底部刷新
            handleReachBottom() {
                console.log('reached down');
                if (this.pageNo < this.totalPages) {
                    this.pageNo += 1;
                    const _this = this;
                    return new Promise(resolve => {
                        _this.getWebUrl();
                    });
                } else {
                    this.$Message.info(this.$t('administerAMP.templateStation.msg9'));
                }
            },
            /**
             * kindId:kind_id
             * id:站点id
             * kindName:kind的name值
             * templateId:template_id
             */
            openPage(kindId, id, kindName, templateId, title) {
                const url = `${util.AutomaticSiteDomainUrl}/#`;
                // const url = 'http://localhost:9528/#';
                const orgId = this.$store.state.enterpriseId;
                let page = '';
                switch (kindName) {
                    case 'site-edit':
                        page = `/site-edit/site-edit?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'site-settings':
                        page = `/site-settings/site-settings?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'news':
                        page = `/news-management/news-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'product':
                        page = `/product-management/product-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'solution':
                        page = `/solution-management/solution-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'case':
                        page = `/case-management/case-list?kind_id=${kindId}&id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'pics-management':
                        page = `/pics-management/pics-management?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'video-management':
                        page = `/video-management/video-management?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                    case 'files-management':
                        page = `/files-management/files-management?id=${id}&template_id=${templateId}&orgId=${orgId}`;
                        break;
                }
                // 用户鉴权
                // util
                //     .ajax({
                //         url: `${util.AutomaticSiteUrl}/auth/verifyFirst`,
                //         method: 'post',
                //         data: {
                //             site_id: id
                //         }
                //     })
                util
                    .ajaxAMP({
                        url: '/auth/verifyFirst',
                        method: 'post',
                        data: {
                            site_id: id
                        }
                    })
                    .then(response => {
                        if (response.data.code === 0) {
                            window.open(url + page, '_blank'); // 新窗口打开外链接
                        } else {
                            this.$Message({
                                message: response.data.msg,
                                type: 'error',
                                duration: 3000
                            });
                        }
                    })
                    .catch(erro => {
                        this.$Message({
                            message: this.$t('administerAMP.templateStation.msg10'),
                            type: 'error',
                            duration: 3000
                        });
                    });
            },
            visibleSuccessOnline() {
                this.visible_success_online = false;
                // this.webDate = [];
                // this.getWebUrl();
            },
            showNotice(item) {
                this.visible_success_online = true;
                this.onlineSuccessData = item;
                if (item.domain_name) {
                    const domain_name = item.domain_name;
                    this.onlineSuccessData.chat_domain_name = domain_name.substring(domain_name.indexOf('.') + 1);
                }
            },
            showChangeName(index) {
                this.$refs.changeName[index].style.display = 'inline-block';
            },
            hideChangeName(index) {
                this.$refs.changeName[index].style.display = 'none';
            },
            /* 处理改名 */
            handleChangeSiteName(title, id) {
                this.changingName = title;
                this.siteId = id;
                this.visible_change_name = true;
            },
            handleChangeName() {
                // util
                //     .ajax({
                //         url: `${util.AutomaticSiteUrl}/trunk/site/rename`,
                //         method: 'post',
                //         data: {
                //             title: this.changingName,
                //             siteId: this.siteId
                //         }
                //     })
                util
                    .ajaxAMP({
                        url: '/trunk/site/rename',
                        method: 'post',
                        data: {
                            title: this.changingName,
                            siteId: this.siteId
                        }
                    })
                    .then(res => {
                        if (res.data.code === 0) {
                            // message成功
                            this.$Message.success(this.$t('administerAMP.templateStation.msg11'));
                            this.webDate = [];
                            this.getWebUrl();
                            this.visible_change_name = false;
                            // 刷新当前页面
                        } else {
                            this.$Message.error(res.data.msg);
                            this.visible_change_name = false;
                        }
                    });
            },
            handleCopySite(id) {
                this.siteId = id;
                this.visible_copy_site = true;
            },
            copySiteConfirm() {
                // util.ajax({
                //     url: `${util.AutomaticSiteUrl}/trunk/site/clone`,
                //     method: 'post',
                //     data: {
                //         from: this.siteId
                //     }
                // })
                util.ajaxAMP({
                    url: '/trunk/site/clone',
                    method: 'post',
                    data: {
                        from: this.siteId
                    }
                })
                    .then(res => {
                        if (res.data.code === 0) {
                            this.$Message.success(this.$t('administerAMP.templateStation.msg12'));
                            this.webDate = [];
                            this.getWebUrl();
                            // 更新分类的数量
                            this.postParentCom();
                            this.visible_copy_site = false;
                        } else {
                            this.$Message.error(res.data.msg);
                            this.visible_copy_site = false;
                        }
                    });
            },
            handlePublishModal(site) {
                util.ajaxAMP({
                    url: '/trunk/site/info',
                    method: 'post',
                    data: {
                        siteId: site.id
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        // 更新webDate数据
                        this.webDate.forEach(item => {
                            if (site.id === item.id) {
                                item.domain_name = res.data.data.domain_name;
                            }
                        });

                        // 暂存 site 数据
                        const siteInfo = res.data.data;

                        // 获取下拉选项
                        util.ajaxAMP({
                            url: '/trunk/domain/list',
                            method: 'post'
                        }).then(res => {
                            if (res.data.code === 0) {
                                // 获取域名下拉选项数据
                                const domainList = res.data.data;
                                const tempArr = [];
                                for (const key in domainList) {
                                    const obj = {
                                        label: key,
                                        value: domainList[key]
                                    };
                                    tempArr.push(obj);
                                }
                                if (siteInfo && siteInfo.domain_name && siteInfo.piwik_id) {
                                    if (!tempArr.find(item => `${item.value}` === `${siteInfo.piwik_id}`)) {
                                        tempArr.unshift({
                                            value: Number(siteInfo.piwik_id),
                                            label: siteInfo.domain_name
                                        });
                                    }
                                }
                                this.domainUrl = tempArr;

                                if (this.domainUrl.length) {
                                    this.domainName = siteInfo.domain_name;
                                    this.publishDomain = site.publish_domain;
                                    this.siteId = site.id;
                                    this.publishRadio = this.domainName ? '2' : '1';
                                    this.bindDomain = this.domainName;
                                    this.visible_confirm_public_publish = true;
                                } else {
                                    this.publishDomain = site.publish_domain;
                                    this.siteId = site.id;
                                    this.visible_confirm_pulish = true;
                                }
                            }
                        });
                    }
                });
            },
            handleUnpublishModal(site) {
                this.domainName = site.domain_name;
                this.publishDomain = site.publish_domain;
                this.siteId = site.id;
                this.visible_confirm_unpublish = true;
            },
            goSetting() {
                window.open(this.$router.resolve({
                    name: 'chat_code'
                }).href, '_blank');
            },
            public_publish_confirm() {
                this.visible_confirm_public_publish = false;
                if (this.publishRadio === '1') {
                    this.publishWebsite(0);
                } else {
                    // 首先绑定域名
                    let domain = '';
                    this.domainUrl.forEach(item => {
                        if (item.value === this.bindDomain) {
                            domain = item.label;
                        }
                    });
                    util.ajax({
                        url: `${util.AutomaticSiteUrl}/trunk/domain/bind`,
                        method: 'post',
                        data: {
                            siteId: this.siteId,
                            domain: domain || this.bindDomain
                        }
                    }).then(res => {
                        if (res.data.code === 0) {
                            this.publishWebsite(1);
                        } else {
                            this.$Message.error(res.data.data.msg);
                        }
                    });
                    // 发布网站
                    this.visible_confirm_public_publish = false;
                }
            },
            getDomainUrls() {
                // util.ajax({
                //     url: `${util.AutomaticSiteUrl}/trunk/domain/list`,
                //     method: 'post'
                // })
                util.ajaxAMP({
                    url: '/trunk/domain/list',
                    method: 'post'
                })
                    .then(res => {
                        if (res.data.code === 0) {
                            // debugger
                            const temp = res.data.data;
                            const tempArr = [];
                            for (const key in temp) {
                                const obj = {
                                    label: key,
                                    value: temp[key]
                                };
                                tempArr.push(obj);
                            }
                            this.domainUrl = tempArr;
                        }
                    });
            },
            bindDomainConfirm() {
                let domain = '';
                this.domainUrl.forEach(item => {
                    if (item.value === this.bindDomain) {
                        domain = item.label;
                    }
                });
                util.ajax({
                    url: `${util.AutomaticSiteUrl}/trunk/domain/bind`,
                    method: 'post',
                    data: {
                        siteId: this.siteId,
                        domain: domain || this.bindDomain
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.$Message.success(this.$t('administerAMP.templateStation.msg13'));
                        this.webDate = [];
                        this.getWebUrl();
                        this.visible_bind_domain = false;
                    } else {
                        this.$Message.error(res.data.msg);
                        this.visible_bind_domain = false;
                    }
                });
            },
            handleSSLApply(site) {
                this.visible_isApplied = site.ssl_status !== '0';
                this.siteId = site.id;
                this.domainName = site.domain_name;
                this.visible_apply_ssl = true;
                const index = this.domainName.indexOf('.');
                this.chatDomainName = `chat${this.domainName.substring(index, this.domainName.length)}`;
            },
            applySSL() {
                // util.ajax({
                //     url: `${util.AutomaticSiteUrl}/trunk/domain/sslApply`,
                //     method: 'post',
                //     data: {
                //         siteId: this.siteId
                //     }
                // }).
                util.ajaxAMP({
                    url: '/trunk/domain/sslApply',
                    method: 'post',
                    data: {
                        siteId: this.siteId
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.visible_isApplied = true;
                        // 刷新页面并且重新更新分类数量
                        // 更新数量
                        this.postParentCom();
                        // 刷新页面
                        this.pageNo = 1;
                        this.webDate = [];
                        this.getWebUrl();
                    } else {
                        this.$Message.error(res.data.msg);
                        this.visible_isApplied = false;
                    }
                });
            },
            unpublishConfirm() {
                util.ajax({
                    url: `${util.AutomaticSiteUrl}/trunk/site/cancel`,
                    method: 'post',
                    data: {
                        siteId: this.siteId
                    }
                }).then(res => {
                    if (res.data.code === 0) {
                        this.$Message.success(this.$t('administerAMP.templateStation.msg14'));
                        this.webDate = [];
                        this.pageNo = 1;
                        this.getWebUrl();
                        this.postParentCom();
                        this.visible_confirm_unpublish = false;
                    }
                });
            },
            computeUpdateTime(time) {
                const dateBegin = new Date(time.replace(/-/g, '/'));
                const dateEnd = new Date();
                const dateDiff = dateEnd.getTime() - dateBegin.getTime();// 时间差的毫秒数
                const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));// 计算出相差天数
                const leave1 = dateDiff % (24 * 3600 * 1000); // 计算天数后剩余的毫秒数
                const hours = Math.floor(leave1 / (3600 * 1000));// 计算出小时数
                // 计算相差分钟数
                const leave2 = leave1 % (3600 * 1000); // 计算小时数后剩余的毫秒数
                const minutes = Math.floor(leave2 / (60 * 1000));// 计算相差分钟数
                // 计算相差秒数
                const leave3 = leave2 % (60 * 1000); // 计算分钟数后剩余的毫秒数
                const seconds = Math.round(leave3 / 1000);
                return {
                    seconds: seconds,
                    minutes: minutes,
                    hours: hours,
                    days: dayDiff
                };
            },
            diffTime(time) {
                // if (time.hours > 24 && time.days > 0) {
                //     return `${time.days}天前`;
                // } else if (time.minutes > 60 && time.hours < 24) {
                //     return `${time.hours}小时前`;
                // } else if (time.minutes <= 60 && time.minutes > 0) {
                //     return `${time.minutes}分钟前`;
                // } else if (time.hours + time.days + time.minutes === 0) {
                //     return `${time.seconds}秒前`;
                // }
                if (time.days > 0) {
                    return `${time.days}${this.$t('administerAMP.templateStation.daysAgoText')}`;
                } else if (time.days === 0 && time.hours > 0) {
                    return `${time.hours}${this.$t('administerAMP.templateStation.hoursAgoText')}`;
                } else if (time.days + time.hours === 0 && time.minutes > 0) {
                    return `${time.minutes}${this.$t('administerAMP.templateStation.minutesAgoText')}`;
                } else {
                    return `${time.seconds}${this.$t('administerAMP.templateStation.secondsAgoText')}`;
                }
            },
            handleUrlClick(site) {
                if (site.publish_status === '1') {
                    this.$Message.warning(this.$t('administerAMP.templateStation.msg15'));
                    return;
                }
                window.open(`https://${site.online_status === '3' ? site.domain_name : site.publish_domain}`, '_blank');
            },
            validateTextLength(value) {
                // 中文、中文标点、全角字符按1长度，英文，英文符号、数字按0.5长度计算
                const cnReg = /([\u4e00-\u9fa5]|[\u3000-\u303F]|[\uFF00-\uFF60])/g;
                const mat = value.match(cnReg);
                let length = 0;
                if (mat) {
                    length = (mat.length + (value.length - mat.length) * 0.5);
                    return length;
                } else {
                    return value.length * 0.5;
                }
            },
            getSiteTitle(val) {
                console.log('the val is', val);
                console.log('the val is', this.validateTextLength(val));
                // return this.validateTextLength(val) > 17 ? val.substring(0, 17) + '...' : val
                if (val.length > 17) {
                    return `${val.substring(0, 17)}...`;
                } else {
                    return val;
                }
            },
            getFormatDate(str) {
                const date = new Date(str);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                // day = day < 10 ? `0${day}`: day;
                let hours = date.getHours();
                hours = hours < 10 ? `0${hours}` : hours;
                let minutes = date.getMinutes();
                minutes = minutes < 10 ? `0${minutes}` : minutes;
                return `${year}年${month}月${day}日 ${hours}:${minutes}`;
            },
            postParentCom() {
                const date = new Date().getTime();
                this.$emit('getCategoryNum', date);
            },
            handleSearch(val) {
                this.webDate = [];
                this.totalNo = 1;
                this.pageNo = 1;
                // util
                //     .ajax({
                //         url: `${util.AutomaticSiteUrl}/trunk/site/list`,
                //         method: 'post',
                //         data: {
                //             page: this.pageNo,
                //             page_size: this.pageSize,
                //             title: val
                //         }
                //     })
                util.ajaxAMP({
                    url: '/trunk/site/list',
                    method: 'post',
                    data: {
                        page: this.pageNo,
                        page_size: this.pageSize,
                        title: val
                    }
                })
                    .then(response => {
                        this.spinShow = false;
                        if (response.data.code === 0) {
                            this.totalNo = response.data.data.total;
                            this.totalPages = response.data.data.pages;
                            this.webDate = this.webDate.concat(response.data.data.items);
                            let temp = this.webDate;
                            const all = this.totalNo;
                            let unpublishNum = 0;
                            let publishNum = 0;
                            if (temp.length > 0 && Array.isArray(temp)) {
                                temp.forEach(item => {
                                    item.kinds.forEach(kind => {
                                        kind.title = `${kind.title}管理`;
                                    });
                                    const computedTime = this.computeUpdateTime(item.last_update_time);
                                    const formateCreateTime = this.getFormatDate(item.create_time);
                                    this.$set(item, 'computedTime', computedTime);
                                    this.$set(item, 'formateCreateTime', formateCreateTime);
                                    if (item.publish_status === '1') {
                                        unpublishNum++;
                                    } else if (item.publish_status === '3') {
                                        publishNum++;
                                    }
                                });
                            }
                            this.$emit('updateCategoryNum', {
                                all,
                                unpublishNum,
                                publishNum
                            });
                            if (this.category === 'unpublished') {
                                temp = temp.filter(item => item.publish_status === '1');
                            } else if (this.category === 'published') {
                                temp = temp.filter(item => item.publish_status === '3');
                            } else {
                                // do nothing
                            }
                            this.webDate = temp;
                            this.$store.state.TemplateStationNum = response.data.data.total;
                        } else {
                            this.$Message({
                                message: response.data.msg,
                                type: 'error',
                                duration: 3000
                            });
                        }
                    })
                    .catch(erro => {
                        console.log('erro', erro);
                        this.spinShow = false;
                        this.$Message({
                            message: this.$t('administerAMP.templateStation.msg8'),
                            type: 'error',
                            duration: 3000
                        });
                    });
            },
            checkUrl(domain) {
                if (!domain) {
                    return false;
                }
                let arr = domain.split('.');
                return arr.length && arr[0] === 'www';
            }
        },
        mounted() {},
        created() {
            // 切换amp模板站与定制站时 需要判断是否处于搜索状态
            if (this.searchVal) {
                // 处于搜索状态
                this.handleSearch(this.searchVal);
            } else {
                this.getWebUrl();
            }
            this.getDomainUrls();
        },
        watch: {
            openTemplateData: {
                handler(val) {
                    if (val) {
                        this.openPage(null, val.id, 'site-edit', val.template_id);
                        this.$nextTick(() => {
                            this.$emit('update:openTemplateData', null);
                        });
                    }
                },
                immediate: true,
                deep: true
            },
            'onlineDomainForm.domainName': {
                handler(val) {
                    console.log('val', val);
                    if (val) {
                        this.onlineDomainForm.domainName = val;
                        // const str = val.split('.')[1];
                        const str = val.substring(val.indexOf('.') + 1);

                        console.log('str', str);
                        this.onlineDomainForm.chatDomainName = `chat.${str}`;
                    } else if (val === '') {
                        this.onlineDomainForm.domainName = '';
                        this.onlineDomainForm.chatDomainName = '';
                    }
                }
            },
            category: {
                handler(val) {
                    // this.webDate = [];
                    // this.getWebUrl();
                    this.pageNo = 1;
                    this.webDate = [];
                    if (this.searchVal) {
                        this.handleSearch(this.searchVal);
                    } else {
                        this.getWebUrl();
                    }
                },
                immediate: true,
                deep: true
            },
            // searchResult: {
            // 	handler(val) {
            // 		// debugger
            // 		this.webDate = [];
            // 		this.webDate = val
            //     },
            //     immediate: true,
            //     deep: true
            // }
            searchVal: {
                handler(val) {
                    if (val) {
                        this.handleSearch(val);
                    } else {
                        this.pageNo = 1;
                        this.webDate = [];
                        this.getWebUrl();
                        this.postParentCom();
                    }
                }
            }
        },
        directives: { clickoutside }
    };
</script>
<style lang="less">
.web-block {
    position: relative !important;
    .el-table {
        position: static !important;
        .el-table__body-wrapper {
            position: static !important;
            td {
                position: static !important;
            }
        }
    }
}
.btn-ui {
  .ivu-btn {
    font-size: 12px;
    height: 33px;
    padding: 1px 10px;
    vertical-align: middle;
    text-align: center;
  }
  .ivu-btn:hover {
    background-color: #ebf0f7;
    color: rgba(0, 0, 0, 0.8);
    border: 1px solid #cbd6e2;
  }
  .ivu-btn:active {
    background-color: #dce6ef;
    color: rgba(0, 0, 0, 0.8);
    border: 1px solid #cbd6e2;
    outline: #dce6ef;
    box-shadow: 2px 2px #dce6ef;
  }
  .ivu-btn:focus {
    box-shadow: 0 0 0 2px #dce6ef;
  }
}
.table-title-ui {
  .ivu-table-header th {
    text-align: center;
    background-color: #f7f9fe !important;

  }
  .ivu-table td {
    text-align: center;
  }
}
.ssl-div {
    .el-input {
        width: 42%;
    }
    margin-bottom: 16px;
}
.amp-custom-dropdown {
    padding: 0 !important;
    .el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
        background-color: #F6F7FA !important;
        color: #4385F3 !important;
    }
    .el-dropdown-menu__item {
        &:hover {
            background-color: #F6F7FA !important;
            color: #4385F3 !important;
        }
        &:focus {
            background-color: #F6F7FA !important;
            color: #4385F3 !important;
        }
    }
}
.amp-custom-option {
    padding: 0 0 0 5px !important;
}
/*.web-block {*/
/*    position: relative !important;*/
/*}*/
.custom-dropdown {
    &:hover {
        background-color: #F6F7FA !important;
        color: #4385F3 !important;
    }
}
</style>
<style lang="less" scoped>
.template-station {
  .el-table td,
  .el-table th {
      position: static !important;
  }
    .el-table__body-wrapper {
        position: static !important;
        .el-table td {
            position: static !important;
        }
        .el-table th {
            position: static !important;
        }
    }
    .el-table__row {
         td {
            position: static !important;
        }
    }
  height: 90%;
  /deep/ .ivu-scroll-wrapper {
    margin: -10px auto 0;
  }
  /deep/ .ivu-table th {
    border-bottom: 1px solid #dde1e6;
  }
  /deep/ .ivu-table-border th {
    border-right: 1px solid #dde1e6;
  }
  /deep/ .ivu-table-border td {
    border-right: 1px solid #dde1e6;
  }
  /deep/ .table-title-ui .ivu-table-header th {
    border-top: 1px solid #dde1e6;
  }
    /deep/ .table-title-ui .el-table__header th {
        /*border-top: 1px solid #dde1e6;*/
        text-align: center;
    }
    /deep/ .table-title-ui .el-table__row td {
        /*border-top: 1px solid #dde1e6;*/
        text-align: center;
    }
    /deep/ .table-title-ui {
      /*border-top: 1px solid #dde1e6;*/
    border-left: 1px solid #dde1e6;
  }
  /deep/ .ivu-table-border:after {
    background-color: #dde1e6;
  }
  /deep/ .ivu-table:before {
    background-color: #dde1e6;
  }
}
.operate_ico:hover {
  color: #3b78de;
}
.web-block {
  padding: 20px 30px 35px 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px 0 rgba(186, 186, 186, 0.5);
  border-radius: 4px;
  border-radius: 4px;
  /*display: flex;*/
  /*background-color: #fff;*/

}
.visit-website {
    font-size: 12px;
    .visit-website-btn {
        display: inline-block;
        border-radius: 4px;
        height: 33px;
        line-height: 33px;
        padding: 1px 10px;
        text-align: center;
        background-color: #6e819a;
        color: #fff;
        margin-left: 20px;
        cursor: pointer;
    }
    .visit-website-btn:hover {
        background-color: rgb(135, 158, 189);
    }
}
.url-hover {
  color: #3b78de;
}
.url-hover:hover {
  color: #2d63bc;
}
.qrCodeArea {
    /*display: none;*/
    /*z-index: 1;*/
    /*top: -40px;*/
    /*margin: 0 auto;*/
}
.amp-site-card {
    width: auto;
    height: 187px;
    margin-left: 10px;
    margin-bottom: 20px;
    .amp-site-card-top {
        height: 103px;
        display: flex;
        justify-content: space-between;
        /*align-items: center;*/
        width: 100%;
        .top-left {
            display: flex;
            width: 60%;
            img {
                border: 1px solid #EAEAEA;
                border-radius: 4px;
                object-fit: cover;
            }
        }
        .top-right {
            width: 30%;
            white-space: nowrap;
        }
    }
    .amp-site-card-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
    }
    .site_title {
        font-size: 18px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 22px;
        /*margin-top: 10px;*/
        display: flex;
        .site_unpublished {
            display: inline-block;
            background: #FBBC04;
            border-radius: 4px;
            border-radius: 4px;
            font-size: 12px;
            color: #FFFFFF;
            letter-spacing: 0;
            /*line-height: 18px;*/
            width: 44px;
            min-width: 44px;
            height: 20px;
            text-align: center;
            /*margin-left: 30px;*/
            margin-right: 10px;
        }
        .site_published {
            display: inline-block;
            background: #00CC99;
            border-radius: 4px;
            border-radius: 4px;
            font-size: 12px;
            color: #FFFFFF;
            letter-spacing: 0;
            /*line-height: 18px;*/
            width: 44px;
            min-width: 44px;
            height: 20px;
            text-align: center;
            /*margin-left: 30px;*/
            margin-right: 10px;
        }
        .site_publishing {
            display: inline-block;
            background: #4E80F5;
            border-radius: 4px;
            border-radius: 4px;
            font-size: 12px;
            color: #FFFFFF;
            letter-spacing: 0;
            /*line-height: 18px;*/
            width: 44px;
            min-width: 44px;
            height: 20px;
            text-align: center;
            /*margin-left: 30px;*/
            margin-right: 10px;
        }
    }
    .site_url {
        font-size: 13px;
        color: #4285F4;
        letter-spacing: 0;
        line-height: 18px;
        margin-top: 10px;
        /*text-overflow: ellipsis;*/
        overflow: hidden;
        text-overflow: ellipsis; // text-overflow css3的属性，当文本溢出时，显示省略号
        display: -webkit-box;
        -webkit-line-clamp: 2; // 设置两行文字溢出
        -webkit-box-orient: vertical;
        width: 100%;
        word-break: break-all;
        &:hover {
            cursor: pointer;
        }
    }
    .site_buttons {
        display: flex;
        .site_edit {
            background: #7B98B6;
            border-radius: 15px;
            border-radius: 4px;
            font-size: 12px;
            color: #FFFFFF;
            border-color: #7B98B6;
            padding-left: 11px;
            padding-right: 11px;
        }
        .content_manange {
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            border: 1px solid #ABBFD5;
            border-radius: 15px;
            border-radius: 4px;
        }
        .site_operate {
            border: 1px solid #ABBFD5;
            border-radius: 15px;
            border-radius: 4px;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
        }
    }
    .site_ssl_tip {
        font-size: 13px;
        color: #4285F4;
        letter-spacing: 0;
        line-height: 18px;
    }
    .amp-site-title {
        margin-left: 12px;
        width: 100%;
        overflow: hidden;
        .site_title {
            /*margin-bottom: 8px;*/
            .site_title_title {
                text-overflow: ellipsis;
                overflow: hidden;
                /*width: 80%;*/
                display: inline-block;
                white-space: nowrap;
                /*max-width: 281px;*/
            }
        }
    }
    .top-right {
        max-width: 154px;
        .site_create_time {
            font-size: 12px;
            color: rgba(0,0,0,0.60);
            text-align: right;
            line-height: 18px;
        }
        .site_update_time {
            font-size: 12px;
            color: rgba(0,0,0,0.60);
            text-align: right;
            line-height: 18px;
            margin-top: 12px;
        }
    }
}
/deep/ .web-block-inner {
    /*float: left;*/
    .custom-col-12 {
        padding-right: 0 !important;
    }
}
.site_ssl {
    &:hover {
        cursor: pointer;
    }
}
/deep/ .el-dropdown-menu {
    padding: 0;
}
/deep/ .amp-custom-option {
    padding: 0 0 0 5px !important;
}
.width_42 {
    width: 42%;
}
.ssl_modal_title {
    font-size: 18px;
    color: rgba(0,0,0,0.8);
    letter-spacing: 0;
    line-height: 26px;
    margin-bottom: 10px;
}
.applied_button {
    background: #fff;
    color: #FA8241;
    &:hover {
        background: #fff;
        color: #FA8241;
    }
    &:focus {
        background: #fff;
        color: #FA8241;
    }
}
/deep/ .qrcode_modal_dialog {
    .el-dialog__header {
        text-align: center;
    }
}
/deep/ .site_buttons {
    .el-button {
        height: 33px;
        span {
            font-weight: 400;
            i {
                color: #989a9c;
            }
        }
    }
    .content_manange:hover {
        background-color: #fff;
    }
    .site_operate:hover {
        background-color: #fff;
    }
}
.amp-site-card-bottom {
    padding-bottom: 10px;
}
/deep/ .content_manange {
    width: 88px;
    padding-left: 12px;
}
/deep/ .site_operate {
    width: 65px;
    padding-left: 12px;
}


</style>
