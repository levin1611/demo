<template>
    <div @click.stop="isClickToClose()"
         class="multiTypeCarousel">
        <!-- 查看区域整体 -->
        <div class="multiTypeCarousel-viewContainer">
            <!-- 左箭头 -->
            <div v-if="!single"
                 :class="{ 'multiTypeCarousel-view-btn-hidden': !showViewBtn_left}"
                 class="multiTypeCarousel-view-btn multiTypeCarousel-view-btn-left">
                <Icon custom="custom custom-back"
                      @click.native="toggleNext('left')"/>
            </div>

            <!-- 查看区域 -->
            <transition name="fade">
                <div v-loading="deferLoading"
                     class="multiTypeCarousel-view-content">
                    <!-- 加载失败提示 -->
                    <div v-if="isLoadFail"
                         class="multiTypeCarousel-fail">
                        <Icon custom="custom-icon_picn"></Icon>

                        <div class="multiTypeCarousel-fail-tip">{{ loadFailTip }}</div>
                    </div>

                    <!-- 预览组件渲染区 -->
                    <div v-show="!isLoadFail && (currMedia.type === 'image' || loading_media)"
                         ref="imgArea"
                         class="multiTypeCarousel-view-content-img gallery">
                    </div>

                    <!-- 视频播放按钮(显示视频首图 + 播放按钮 + 不可缩放) -->
                    <div v-if="currMedia.type === 'video'"
                         v-show="!isLoadFail && !loading_media"
                         ref="videoArea"
                         class="multiTypeCarousel-view-content-video">
                        <!-- 视频 -->
                        <video :key="currMedia.id"
                               ref="video"
                               :controls="playing"
                               @click.stop="onVideoCilck"
                               @canplay="handleVideoLoad"
                               @ended="playing = false"
                               @error="handleVideoError">
                            <source :src="currMedia.url"
                                    type="video/ogg">
                            <source :src="currMedia.url"
                                    type="video/mp4">
                            <source :src="currMedia.url"
                                    type="video/3gp">
                            Sorry, your browser doesn't support embedded videos.
                        </video>

                        <!-- 播放按钮遮罩 -->
                        <div v-if="!playing"
                             class="multiTypeCarousel-video-playBtn">
                            <svg aria-hidden="true"
                                 @click.stop="playVideo"
                                 class="svg-icon custom">
                                <use xlink:href="#custom-video-play"></use>
                            </svg>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- 右箭头 -->
            <div v-if="!single"
                 :class="{ 'multiTypeCarousel-view-btn-hidden': !showViewBtn_right}"
                 class="multiTypeCarousel-view-btn multiTypeCarousel-view-btn-right">
                <Icon custom="custom custom-back"
                      @click.native="toggleNext('right')"/>
            </div>

            <!-- 关闭按钮 -->
            <div @click.stop="closeWin"
                 ref="closeBtn"
                 class="multiTypeCarousel-closeBtn">X</div>
        </div>

        <!-- 底部缩略图 -->
        <div v-if="!single"
             class="multiTypeCarousel-thumbContainer">
            <!-- 缩略图左箭头 -->
            <div v-if="!loadEnd_left"
                 @click="loadMore('left')"
                 class="multiTypeCarousel-thumb-btn multiTypeCarousel-thumb-btn-left">
                <Icon custom="custom-prePage"/>
            </div>

            <!-- 缩略图正体 -->
            <div class="multiTypeCarousel-thumb-content">
                <div v-for="item in thumbList"
                     :key="item.id"
                     @click="toggleMedia(item)"
                     :class="{'multiTypeCarousel-thumb-item-active': `${item.id}` === `${currMedia.id}` }"
                     class="multiTypeCarousel-thumb-item">
                    <!-- 图片 -->
                    <!-- 目前优先展示原图 -->
                    <template v-if="item.type === 'image'">
                        <img :src="item.url || item.thumbnailUrl"
                             alt="" />
                    </template>
                    <!-- 视频 -->
                    <!-- 目前优先展示原视频 -->
                    <template v-else-if="item.type === 'video'">
                        <!-- 视频 -->
                        <video v-if="item.url">
                            <source :src="item.url"
                                    type="video/ogg">
                            <source :src="item.url"
                                    type="video/mp4">
                            <source :src="item.url"
                                    type="video/3gp">
                            Sorry, your browser doesn't support embedded videos.
                        </video>

                        <!-- 缩略图 -->
                        <img v-else-if="item.thumbnailUrl"
                             :src="item.thumbnailUrl"
                             alt="" />

                        <!-- 播放按钮遮罩 -->
                        <div class="multiTypeCarousel-video-playBtn">
                            <svg aria-hidden="true"
                                 class="svg-icon custom">
                                <use xlink:href="#custom-video-play"></use>
                            </svg>
                        </div>
                    </template>
                </div>
            </div>

            <!-- 缩略图右箭头 -->
            <div v-if="!loadEnd_right"
                 @click="loadMore('right')"
                 class="multiTypeCarousel-thumb-btn multiTypeCarousel-thumb-btn-right">
                <Icon custom="custom-prePage"/>
            </div>
        </div>
    </div>
</template>

<script>
    import $ from 'jquery';
    import '@/views/main-components/photoGallery.css';

    // 引入预览组件, https://github.com/codingforme/jquery-photo-gallery
    // 对该插件有修改, 但只改了目前需要用的部分, 所以如果有新场景/新功能, 可能会出现 BUG
    $.fn.extend({
        carouselView: function(options) {
            const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
            const MOUSEWHEEL_EVENT = isFirefox ? 'DOMMouseScroll' : 'mousewheel';
            const defaults = {
                // 图片缩放倍率
                ratio: 1.2,
                // 右下角缩略图宽度
                thumbnailsWidth: 180,
                // 右下角缩略图高度
                thumbnailsHeight: 120,
                // HTML模版
                template: {
                    // 操作工具
                    OPERTATION: '<div id="img_tool" class="tool">' +
                        '<div class="toolct">' +
                        //                    '<span class="oper_fullscreen" title="查看全屏"><i class="icon_tool-fullscreen"></i></span>' +
                        '<span class="oper_bigger" title="放大图片"><i class="custom custom-enlarge"></i></span>' +
                        '<span class="oper_smaller" title="缩小图片"><i class="custom custom-shrink"></i></span>' +
                        '<span class="oper_rotate" title="向右旋转"><i class="custom custom-rotate"></i></span>' +
                        //                    '<span class="oper_download" title="下载图片"><i class="icon_tool-download"></i></span>' +
                        '</div>' +
                        '</div>',
                    // 缩略图
                    THUMBNAILS: '<div id=\'img_thumbnails\' class=\'thumbnails\'>' +
                        '<span class="thumbClose" title="关闭缩略图"><i class="icon_close-small"></i></span>' +
                        '<img ondragstart="return false;"/>' +
                        '<div class="thumbDrag"><span class="thumbDrag_span"></span></div>' +
                        '</div>',
                    // 大图
                    IMAGE: '<img id="img_view" class="image" ondragstart="return false;"/>'
                }
            };

            const o = $.extend(defaults, options);
            const $gallery = $(this);
            $gallery.append(o.template.OPERTATION).append(o.template.THUMBNAILS);

            const $tool = $(this).find('.tool');
            const $fullscreen = $(this).find('.oper_fullscreen');
            const $bigger = $(this).find('.oper_bigger');
            const $smaller = $(this).find('.oper_smaller');
            const $rotate = $(this).find('.oper_rotate');
            const $download = $(this).find('.oper_download');
            const $prev = $(this).find('.prev');
            const $next = $(this).find('.next');
            const $thumbnails = $(this).find('.thumbnails');
            let $image;
            let $thumbImg;
            let imageWidth;
            let imageHeight;
            let imgRatio;
            let dragX;
            let dragY;
            let cW;
            let cH;
            let w;
            let h;
            let isVertical;
            let thumbX;
            let thumbY;

            // 上一张
            $prev.on('click', function() {
                if (o.activeIndex > 0) o.activeIndex--;
                toggleImage();
            }).on('mouseover', function(e) {
                if (o.activeIndex > 0) {
                    $(this).addClass('active');
                }
            }).on('mouseout', function(e) {
                $(this).removeClass('active');
            });

            // 下一张
            $next.on('click', function() {
                if (o.activeIndex < o.imgs.length - 1) o.activeIndex++;
                toggleImage();
            }).on('mouseover', function(e) {
                if (o.activeIndex < o.imgs.length - 1) {
                    $(this).addClass('active');
                }
            }).on('mouseout', function(e) {
                $(this).removeClass('active');
            });

            // 缩略图
            $thumbnails.css({
                height: o.thumbnailsHeight,
                width: o.thumbnailsWidth
            }).on('mouseenter', function(e) {
                thumbX = -1;
            }).on('mousedown', function(e) {
                thumbX = e.pageX || e.clientX;
                thumbY = e.pageY || e.clientY;

                cW = document.body.clientWidth;
                cH = document.body.clientHeight;
                e.stopPropagation();
            }).on('mousemove', function(e) {
                if (thumbX > 0) {
                    const nextDragX = e.pageX || e.clientX;
                    const nextDragY = e.pageY || e.clientY;
                    const $td = $(this).find('.thumbDrag');
                    let imageWidth = $image.width();
                    let imageHeight = $image.height();
                    let thumbImgWidth = $thumbImg.width();
                    let thumbImgHeight = $thumbImg.height();
                    let left = parseFloat($td.css('left')) + (nextDragX - thumbX);
                    let top = parseFloat($td.css('top')) + (nextDragY - thumbY);
                    const w = $td.width();
                    const h = $td.height();
                    let it;
                    let il;
                    let maxL;
                    let maxT;

                    if (isVertical) {
                        thumbImgWidth = [thumbImgHeight, thumbImgHeight = thumbImgWidth][0];
                        imageWidth = [imageHeight, imageHeight = imageWidth][0];
                    }
                    it = (o.thumbnailsHeight - thumbImgHeight) / 2,
                    il = (o.thumbnailsWidth - thumbImgWidth) / 2,
                    maxL = o.thumbnailsWidth - w - il - 2, // 减去2像素边框部分
                    maxT = o.thumbnailsHeight - h - it - 2;

                    if (left < il) left = il;
                    else if (left > maxL) left = maxL;

                    if (top < it) top = it;
                    else if (top > maxT) top = maxT;

                    $td.css({
                        left: left,
                        top: top
                    });
                    thumbX = nextDragX;
                    thumbY = nextDragY;

                    if (imageWidth < cW) left = (cW - imageWidth) / 2;
                    else left = -imageWidth * (left - il) / thumbImgWidth;

                    if (imageHeight < cH) top = (cH - imageHeight) / 2;
                    else top = -imageHeight * (top - it) / thumbImgHeight;

                    $image.offset({
                        left: left,
                        top: top
                    });
                }
            }).on('mouseup', function(e) {
                thumbX = -1;
            });

            $thumbnails.find('.thumbClose').on('click', function() {
                $thumbnails.hide();
            });

            // 显示工具栏
            if (!o.single) {
                $gallery.on('mouseover', function(e) {
                    $tool.show();
                }).on('mouseenter', function(e) {
                    dragX = -1;
                }).on('mouseout', function(e) {
                    $tool.hide();
                }).on('mousedown', function(e) {
                    dragX = e.pageX || e.clientX;
                    dragY = e.pageY || e.clientY;

                    cW = document.body.clientWidth;
                    cH = document.body.clientHeight;
                    e.stopPropagation();
                }).on('mousemove', function(e) {
                    if (dragX > 0) {
                        const nextDragX = e.pageX || e.clientX;
                        const nextDragY = e.pageY || e.clientY;
                        const o = $image.offset();
                        let left = o.left + (nextDragX - dragX);
                        let top = o.top + (nextDragY - dragY);
                        let w = $image.width();
                        let h = $image.height();

                        if (isVertical) {
                            w = [h, h = w][0];
                        }
                        if (w > cW) {
                            if (left > 0) {
                                left = 0;
                            } else if (left < cW - w) {
                                left = cW - w;
                            }
                        } else {
                            left = o.left;
                        }
                        if (h > cH) {
                            if (top > 0) {
                                top = 0;
                            } else if (top < cH - h) {
                                top = cH - h;
                            }
                        } else {
                            top = o.top;
                        }

                        $image.offset({
                            left: left,
                            top: top
                        });
                        dragX = nextDragX;
                        dragY = nextDragY;
                        setThumbnails(); // 缩略图拖拽点
                    }
                }).on('mouseup', function(e) {
                    dragX = -1;
                });
            }

            // 全屏
            let isMax, preWidth, preHeight, preTop, preLeft;
            $fullscreen.on('click', function() {
                const parentD = window.parent.document;
                const J = $(parentD.getElementById('J_pg'));
                if (!isMax) {
                    isMax = true;
                    preWidth = document.body.clientWidth;
                    preHeight = document.body.clientHeight;
                    preTop = J.css('top');
                    preLeft = J.css('left');
                    J.css({
                        top: 0,
                        left: 0,
                        width: parentD.body.clientWidth,
                        height: parentD.body.clientHeight
                    });
                } else {
                    isMax = false;
                    J.css({
                        top: preTop,
                        left: preLeft,
                        width: preWidth,
                        height: preHeight
                    });
                }
            });

            // 放大图片
            $bigger.on('click', function() {
                biggerImage();
            });

            // 缩小图片
            $smaller.on('click', function() {
                smallerImage();
            });

            // 旋转
            $rotate.on('click', function() {
                const rotateClass = $image.attr('class').match(/(rotate)(\d*)/);

                if (rotateClass) {
                    const nextDeg = (Number(rotateClass[2]) + 90) % 360;
                    $image.removeClass(rotateClass[0]).addClass(`rotate${nextDeg}`);
                    $thumbImg.removeClass(rotateClass[0]).addClass(`rotate${nextDeg}`);
                    resizeImage(nextDeg);
                    resizeThumbImg(nextDeg);
                    isVertical = nextDeg == 90 || nextDeg == 270;
                } else {
                    $image.addClass('rotate90');
                    $thumbImg.addClass('rotate90');
                    resizeImage('90');
                    resizeThumbImg('90');
                    isVertical = true;
                }
            });

            // 下载
            $download.on('click', function() {
                const imgUrl = $image.attr('src');
                if (!imgUrl) return;
                alert('没有找到兼容所有浏览器方法，所以暂不实现');
            });

            $(window).on('resize', function() {
                // 注释掉原来的方法, 调用 resizeImage 方法, 避免图片超出最大宽高
                // setImagePosition();
                resizeImage();
            });

            if (!o.single) {
                if (document.attachEvent) {
                    document.attachEvent(`on${MOUSEWHEEL_EVENT}`, function(e) {
                        mouseWheelScroll(e);
                    });
                } else if (document.addEventListener) {
                    document.addEventListener(MOUSEWHEEL_EVENT, function(e) {
                        mouseWheelScroll(e);
                    }, false);
                }
            }

            function mouseWheelScroll(e) {
                const _delta = parseInt(e.wheelDelta || -e.detail);
                // 向上滚动
                if (_delta > 0) {
                    biggerImage();
                }
                // 向下滚动
                else {
                    smallerImage();
                }
            }

            // // 键盘左右键
            // document.onkeydown = function(e) {
            //     e = e || window.event;
            //     if (e.keyCode) {
            //         if (e.keyCode == 37) { // left
            //             if (o.activeIndex > 0) o.activeIndex--;
            //             toggleImage();
            //         }
            //         if (e.keyCode == 39) { // right
            //             if (o.activeIndex < o.imgs.length - 1) o.activeIndex++;
            //             toggleImage();
            //         }
            //     }
            // };

            function init() {
                toggleImage();

                const cW = $gallery[0].clientWidth;
                const cH = $gallery[0].clientHeight;
                $(o.imgs).each(function(i, img) {
                    const left = (cW - img.imgWidth) / 2;
                    const top = (cH - img.imgHeight) / 2;
                    $(o.template.IMAGE)
                        .appendTo($gallery)
                        .attr('src', img.url)
                        .attr('index', i)
                        .css({
                            width: img.imgWidth,
                            height: img.imgHeight,
                            left,
                            top
                        }).on('dblclick', function() {
                            // app.window.close();
                        });

                    if (o.single && o.singleCloseEl) {
                        o.singleCloseEl.css('right', `${left}px`).css('top', `${top}px`);
                    }
                });
                $image = $(`.image[index='${o.activeIndex}']`, $gallery).addClass('active');
            }

            function toggleImage() {
                imageWidth = o.imgs[o.activeIndex].imgWidth;
                imageHeight = o.imgs[o.activeIndex].imgHeight;
                imgRatio = imageWidth / imageHeight;
                cW = document.body.clientWidth;
                cH = document.body.clientHeight;
                $('.image', $gallery).removeClass('active');
                $image = $(`.image[index='${o.activeIndex}']`, $gallery).addClass('active').css({
                    width: imageWidth,
                    height: imageHeight
                }).removeClass('rotate0 rotate90 rotate180 rotate270');
                $thumbImg = $thumbnails.find('img').attr('src', o.imgs[o.activeIndex].url);
                $thumbnails.find('img').removeAttr('class').removeAttr('style');
                isVertical = false;
                $thumbnails.hide();
                $prev.removeClass('active');
                $next.removeClass('active');
                setImagePosition();
            }


            function biggerImage() {
                const w = $image.width();
                const h = $image.height();
                let nextW = w * o.ratio;
                let nextH = h * o.ratio;
                if (nextW - w < 1) nextW = Math.ceil(nextW);
                let percent = (nextW / imageWidth * 100).toFixed(0);
                if (percent > 90 && percent < 110) {
                    percent = 100;
                    nextW = imageWidth;
                    nextH = imageHeight;
                } else if (percent > 1600) {
                    percent = 1600;
                    nextW = imageWidth * 16;
                    nextH = imageHeight * 16;
                }

                $image.width(nextW).height(nextH);
                setImagePosition();
                showPercentTip(percent);
                showThumbnails(nextW, nextH);
            }

            function smallerImage() {
                const w = $image.width();
                const h = $image.height();
                let nextW;
                let nextH;
                let percent = (w / o.ratio / imageWidth * 100).toFixed(0);
                if (percent < 5) {
                    percent = 5;
                    nextW = imageWidth / 20;
                    nextH = imageHeight / 20;
                } else if (percent > 90 && percent < 110) {
                    percent = 100;
                    nextW = imageWidth;
                    nextH = imageHeight;
                } else {
                    nextW = w / o.ratio;
                    nextH = h / o.ratio;
                }

                $image.width(nextW).height(nextH);
                setImagePosition();
                showPercentTip(percent);
                showThumbnails(nextW, nextH);
            }

            // 显示缩略图
            function showThumbnails(width, height) {
                if (isVertical) width = [height, height = width][0];
                if (width > document.body.clientWidth || height > document.body.clientHeight) {
                    $thumbnails.show();
                    setThumbnails();
                } else {
                    $thumbnails.hide();
                }
            }

            // 重置图片宽高
            function resizeImage(rotateDeg) {
                // let mH = document.body.clientHeight;
                // let mW = document.body.clientWidth;
                let mH = $gallery[0].clientHeight;
                let mW = $gallery[0].clientWidth;
                if (rotateDeg == '90' || rotateDeg == '270') {
                    mW = [mH, mH = mW][0];
                }

                let width, height;
                width = Math.min(imageWidth, mW);
                height = Math.min(imageHeight, mH);

                if (width / height > imgRatio) {
                    width = height * imgRatio;
                } else {
                    height = width / imgRatio;
                }

                $image.css({
                    width: width,
                    height: height
                });
                setImagePosition();
            }

            function resizeThumbImg(rotateDeg) {
                let maxW = o.thumbnailsWidth;
                let maxH = o.thumbnailsHeight;
                if (rotateDeg == '90' || rotateDeg == '270') {
                    maxW = [maxH, maxH = maxW][0];
                }
                $thumbImg.css({
                    maxWidth: maxW,
                    maxHeight: maxH
                });
                $thumbnails.hide();
            }

            // 显示百分比提示
            function showPercentTip(percent) {
                $gallery.find('.percentTip').remove();
                $(`<div class='percentTip'><span>${percent}%</span></div>`).appendTo($gallery).fadeOut(1500);
            }

            // 设置图片位置
            function setImagePosition() {
                const w = $image.width();
                const h = $image.height();
                // const cW = document.body.clientWidth;
                // const cH = document.body.clientHeight;
                const cW = $gallery[0].clientWidth;
                const cH = $gallery[0].clientHeight;

                const left = (cW - w) / 2;
                const top = (cH - h) / 2;

                $image.css('left', `${left}px`).css('top', `${top}px`);
                if (o.single && o.singleCloseEl) {
                    o.singleCloseEl.css('right', `${left}px`).css('top', `${top}px`).css('display', 'inline-block');
                }
            }

            // 设置缩略图拖拽区域
            function setThumbnails() {
                const $img = $thumbnails.find('img');
                let sW = $img.width();
                let sH = $img.height();
                let w = $image.width();
                let h = $image.height();
                const imf = $image.offset();
                const imfl = imf.left;
                const imft = imf.top;
                const cW = document.body.clientWidth;
                const cH = document.body.clientHeight;
                let tW;
                let tH;
                let tl;
                let tt;

                if (isVertical) {
                    sW = [sH, sH = sW][0];
                    w = [h, h = w][0];
                }

                tW = sW / (w / cW);
                if (w < cW) tW = sW;
                tH = sH / (h / cH);
                if (h < cH) tH = sH;
                tl = (o.thumbnailsWidth - sW) / 2 + -imfl / w * sW;
                if (w < cW) tl = (o.thumbnailsWidth - sW) / 2;
                tt = (o.thumbnailsHeight - sH) / 2 + -imft / h * sH;
                if (h < cH) tt = (o.thumbnailsHeight - sH) / 2;
                $thumbnails.find('.thumbDrag').css({
                    width: tW,
                    height: tH,
                    left: tl,
                    top: tt
                });
            }

            init();
            return this;
        }
    });

    export default {
        name: 'multiTypeCarousel',
        props: {
            // 触发此组件的媒体元素相关信息
            baseMedia: {
                type: Object
            },
            // 仅显示单张图片模式, 此模式下, 不显示遮罩, 不显示图片之外的元素(关闭按钮除外), 不可滚动缩放, 但保留随页面缩放功能
            single: {
                type: Boolean
            },
            // 点击左右按钮加载更多数据数据
            // function({ baseMedia, direction })
            load: {
                type: Function
            },
            /**
             * @Description: 其余可配置项
             * width: 图片初始固定宽度, 但超过容器宽度则无效
             * height: 图片初始固定高度, 其余同上
             * minWidth: 图片初始最小宽度, 但超过容器宽度则无效, 且优先级比固定宽度更低
             * minHeight: 图片初始最小高度, 其余同上
             * @author 汤一飞
             * @date 2022/5/19
             */
            options: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            // 当前元素在缩略图列表中的位置
            currThumbIndex() {
                return this.thumbList.findIndex(item => `${item.id}` === `${this.currMedia.id}`);
            },
            // 左方向所有元素都加载完毕后, 判断当前缩略图是否处于最左侧, 是则隐藏缩略图最左侧按钮, 也与视图左侧按钮的隐藏有关
            loadEnd_left() {
                if (this.boundaryMedia_left) {
                    return Boolean(this.thumbList.find(item => `${item.id}` === `${this.boundaryMedia_left.id}`));
                }

                return false;
            },
            // 右方向所有元素都加载完毕后, 判断当前缩略图是否处于最右侧, 是则隐藏缩略图最右侧按钮, 也与视图右侧按钮的隐藏有关
            loadEnd_right() {
                if (this.boundaryMedia_right) {
                    return Boolean(this.thumbList.find(item => `${item.id}` === `${this.boundaryMedia_right.id}`));
                }

                return false;
            },
            // 左侧视图按钮的显隐
            showViewBtn_left() {
                // 单图模式, 隐藏
                if (this.single) {
                    return false;
                }

                // 当前缩略图列表为左侧最后一屏元素, 显示到最左侧元素时隐藏左侧切换按钮
                if (this.loadEnd_left) {
                    return this.currThumbIndex !== 0;
                }

                // 否则, 显示
                return true;
            },
            // 右侧视图按钮的显隐
            showViewBtn_right() {
                // 单图模式, 隐藏
                if (this.single) {
                    return false;
                }

                // 当前缩略图列表为右侧最后一屏元素, 显示到最右侧元素时隐藏右侧切换按钮
                if (this.loadEnd_right) {
                    return this.currThumbIndex !== this.thumbList.length - 1;
                }

                // 否则, 显示
                return true;
            },
            // 资源加载失败提示
            loadFailTip() {
                let result = this.$t('loadFailure');

                switch (this.currMedia.type) {
                    case 'image':
                        result = this.$t('loadFailure_img');
                        break;
                    case 'video':
                        result = this.$t('loadFailure_video');
                        break;
                }

                return result;
            }
        },
        data() {
            return {
                // 所有 图片/视频 数据数组
                mediaList: [],
                // 当前显示的缩略图列表, 目前限定缩略图区域每次显示十张(首页, 末页, 初次加载等情况可能不符)
                thumbList: [],
                // 当前查看的元素
                currMedia: {},

                // 所有资源都加载完毕后, 资源的左右边界元素
                boundaryMedia_left: null,
                boundaryMedia_right: null,

                // 视频是否播放中
                playing: false,

                // 资源加载中标识
                loading_media: false,
                // 资源加载失败标识
                isLoadFail: false,
                // 延迟显示资源加载中标识
                deferLoading: false,
                // 延迟显示资源加载中标识的 setTimeout 句柄
                deferLoadingTimer: false,
                // 延迟显示资源加载中标识的时间毫秒数间隔
                deferTime: 200
            };
        },
        methods: {
            onVideoCilck (e) {
                e.preventDefault()
                const video = this.$refs.video
                if (video.paused) {
                    this.playing = true
                    video.play()
                } else {
                    this.playing = false
                    video.pause()
                }
            },
            // 全局方法
            handleKeyDown(e) {
                e = e || window.event;
                if (e.keyCode) {
                    if (e.keyCode == 37) { // left
                        this.toggleNext('left');
                    }
                    if (e.keyCode == 39) { // right
                        this.toggleNext('right');
                    }
                }
            },

            // 显示图片/视频
            openMedia(media) {
                // console.log(media,this.options,'ss');
                // 中止之前切换资源相关的动作, 避免受影响
                this.endPrevLoading();

                // 延迟显示 loading 机制, 指定时间内资源未加载完毕, 则显示 loading , 否则不显示, 避免页面闪动
                this.deferLoadingTimer = setTimeout(() => {
                    this.deferLoading = true;
                }, this.deferTime);

                // 不同类型的资源的显示
                this.currMedia = media;
                if (media.type === 'image') {
                    this.loading_media = true;

                    // 资源加载完毕后再打开, 避免图片尺寸出错问题
                    const imgEl = new Image();
                    imgEl.src = media.url;
                    // 资源加载完毕回调
                    imgEl.onload = () => {
                        // 资源已切换, 不用往下执行
                        if (this.currMedia.id !== media.id) {
                            return;
                        }

                        clearTimeout(this.deferLoadingTimer);

                        this.$nextTick(() => {
                            this.openImage(media);
                            setTimeout(() => {
                                this.loading_media = false;
                                this.deferLoading = false;
                            }, 0);
                        });
                    };

                    // 资源加载失败回调
                    imgEl.onerror = () => {
                        console.log('ssss');
                        // 资源已切换, 不用往下执行
                        if (this.currMedia.id !== media.id) {
                            return;
                        }

                        clearTimeout(this.deferLoadingTimer);
                        this.isLoadFail = true;
                        this.loading_media = false;
                        this.deferLoading = false;
                        this.$Message.error(this.$t('loadFailure'));
                        this.destroyGallery();
                    };
                } else {
                    this.loading_media = true;
                }
            },
            // 中止之前切换资源相关的动作
            endPrevLoading() {
                clearTimeout(this.deferLoadingTimer);
                this.isLoadFail = false;
                this.loading_media = false;
                this.deferLoading = false;
                this.playing = false;
            },
            // 视频加载 canplay 回调
            handleVideoLoad() {
                clearTimeout(this.deferLoadingTimer);
                this.isLoadFail = false;
                this.loading_media = false;

                // 加载完毕后才去掉之前的图片(可能存在), 避免闪动
                setTimeout(() => {
                    this.destroyGallery();
                }, 0);
            },
            // 视频加载失败
            handleVideoError() {
                clearTimeout(this.deferLoadingTimer);
                this.isLoadFail = true;
                this.loading_media = false;
                this.deferLoading = false;
                this.$Message.error(this.$t('loadFailure'));
                this.destroyGallery();
            },
            // 播放视频
            playVideo() {
                if (this.loading_media) {
                    this.$Message.warning(this.$t('loading'));
                } else {
                    this.playing = true
                    this.$refs.video.play();
                }
            },
            // 显示图片
            openImage(setting) {
                // 获取图片
                const imgUrl = setting.url;

                // 无图, 退出
                if (!imgUrl) return;

                // 暂存图片宽高
                const imgEl = new Image();
                imgEl.src = imgUrl;
                let imgHeight = imgEl.naturalHeight || imgEl.height || 640;
                let imgWidth = imgEl.naturalWidth || imgEl.width || 640;
                // 计算图片宽高纵横比
                const ratio = imgWidth / imgHeight;

                // 最小宽高度设置
                const minWidth = this.options.minWidth || 0;
                const minHeight = this.options.minHeight || 0;
                if (minWidth > imgHeight) {
                    imgWidth = minWidth;
                    imgHeight = Math.ceil(imgWidth / ratio);
                }
                if (minHeight > imgHeight) {
                    imgHeight = minHeight;
                    imgWidth = Math.ceil(imgHeight * ratio);
                }

                // 固定宽高设置
                if (this.options.width && this.options.height) {
                    imgWidth = this.options.width;
                    imgHeight = this.options.height;
                } else if (this.options.width) {
                    imgWidth = this.options.width;
                    imgHeight = Math.ceil(imgWidth / ratio);
                } else if (this.options.height) {
                    imgHeight = this.options.height;
                    imgWidth = Math.ceil(imgHeight * ratio);
                }


                // 调整图片宽高, 确保图片不超出容器
                const maxHeight = this.$refs.imgArea.clientHeight;
                const maxWidth = this.$refs.imgArea.clientWidth;
                // 如果图片宽度超出最大宽度, 设置图片宽度为最大宽度, 并锁定宽高比调整图片高度
                if (imgWidth > maxWidth) {
                    imgWidth = maxWidth;
                    imgHeight = Math.ceil(imgWidth / ratio);
                }
                // 如果图片高度超出最大高度, 设置图片高度为最大高度, 并锁定宽高比调整图片宽度
                if (imgHeight > maxHeight) {
                    imgHeight = maxHeight;
                    imgWidth = Math.ceil(imgHeight * ratio);
                }

                // 保存图片设置
                const imgSettings = {
                    img: {
                        url: imgUrl,
                        imgHeight,
                        imgWidth
                    },
                    settings: {
                        single: this.options.single,
                        singleCloseEl: $(this.$refs.closeBtn)
                    }
                };
                // 启用插件初始化
                this.initGallery(imgSettings);
            },
            // 调用插件显示图片
            initGallery(imgData) {
                // 先删除插件之前生成的内容
                this.destroyGallery();

                this.$nextTick(() => {
                    $(this.$refs.imgArea).carouselView({
                        imgs: [imgData.img],
                        ...imgData.settings,
                        activeIndex: 0
                    });
                });
            },
            // 清除插件做的修改
            destroyGallery() {
                if (this.$refs.imgArea) {
                    $(this.$refs.imgArea).children().remove();
                    $(this.$refs.imgArea).off('mouseover', 'mouseenter', 'mouseout', 'mousedown', 'mousemove', 'mouseup');
                }
            },
            // 关闭按钮
            closeWin() {
                this.$store.commit('updateFullCarousel', false);
            },

            // 上方点击切换图片/视频
            toggleNext(direction) {
                // 计算想要加载的下一对象的 index
                let index = this.currThumbIndex;
                if (direction === 'left') {
                    index--;
                } else {
                    index++;
                }

                // 切到了最左边还要继续往左
                if (index < 0) {
                    this.loadMore('prev');
                    return;
                }
                // 切到了最右边还要继续往右
                if (index >= this.thumbList.length) {
                    this.loadMore('next');
                    return;
                }
                // 还在已加载数据内, 正常切换
                this.openMedia(this.thumbList[index]);
            },
            // 缩略图点击切换图片/视频
            toggleMedia(media) {
                // 点击当前显示中内容, 无效
                if (media.id === this.currMedia.id) {
                    return;
                }

                // 切换显示内容
                this.openMedia(media);
            },
            // 缩略图点击加载更多图片/视频
            loadMore(direction, step = 10) {
                // 暂存当前缩略图列表边界位置处的媒体元素
                let media;
                if (['left', 'prev'].includes(direction)) {
                    media = this.thumbList[0];

                    // 如果是在已加载资源中翻页, 不需要请求接口, 停止向下执行
                    if (media.id !== this.mediaList[0].id) {
                        this.loadMoreFromCache(media, direction);
                        return;
                    }

                    // 已经加载到最左侧了, 不允许继续请求, 停止向下执行
                    if (this.loadEnd_left) {
                        return;
                    }
                } else {
                    media = this.thumbList[this.thumbList.length - 1];

                    // 如果是在已加载资源中翻页, 不需要请求接口, 停止向下执行
                    if (media.id !== this.mediaList[this.mediaList.length - 1].id) {
                        this.loadMoreFromCache(media, direction);
                        return;
                    }

                    // 已经加载到最右侧了, 不允许继续请求, 停止向下执行
                    if (this.loadEnd_right) {
                        return;
                    }
                }

                // 调用外部方法加载更多数据
                this.load({ media, direction }).then(res => {
                    // 这里面不做错误提示了, 让 load 做

                    if (Array.isArray(res)) {
                        if (res.length) {
                            // 请求得到新数据, 追加数据到已加载元素列表中, 更新缩略图列表内容

                            // 拼接数据, 去重, 排序
                            const temp = {};
                            this.mediaList = res.concat(this.mediaList).filter(item => {
                                if (!temp[item.id]) {
                                    temp[item.id] = true;
                                    return true;
                                }
                            }).sort((a, b) => {
                                return Number(a.timeStamp) - Number(b.timeStamp);
                            });

                            // 已加载元素列表更新后, 剩余的操作和"从已加载元素中抽取元素生成新缩略图列表"逻辑一致, 直接复用
                            this.loadMoreFromCache(media, direction);
                        }

                        // 如果请求得到的数据不等于单次请求数据条数, 说明请求到头了(init 初始化请求除外)
                        if (res.length !== step) {
                            switch (direction) {
                                case 'init':
                                    // 初始加载

                                    // 如果一条数据都没请求到, 更新元素边界为初始元素, 否则忽略, 不隐藏切换按钮
                                    if (!res.length) {
                                        this.boundaryMedia_left = media;
                                        this.boundaryMedia_right = media;
                                    }

                                    // 无数据也应该显示初始元素
                                    this.openMedia(media);
                                    break;
                                case 'left':
                                case 'prev':
                                    // 点击缩略图左侧切换按钮
                                    // 点击视图左侧切换按钮

                                    // 更新元素左边界为最左侧元素
                                    this.boundaryMedia_left = this.mediaList[0];
                                    break;
                                case 'right':
                                case 'next':
                                    // 点击缩略图右侧切换按钮
                                    // 点击视图右侧切换按钮

                                    // 更新元素右边界为最右侧元素
                                    this.boundaryMedia_right = this.mediaList[this.mediaList.length - 1];
                                    break;
                            }
                        }
                    }
                });
            },
            // 从已加载资源中更新缩略图内容
            loadMoreFromCache(media, direction, step = 10) {
                // 计算传入的边界元素在所有已缓存的元素列表中的位置
                const mediaIndex = this.mediaList.findIndex(item => `${item.id}` === `${media.id}`);
                // 暂存左方向切换时, 从已缓存的元素列表中抽取新缩略图列表的起始位置
                let startIndex = 0;

                switch (direction) {
                    case 'init':
                        // 初始化, 加载起始元素前后的资源

                        // 打开起始元素
                        this.openMedia(media);

                        // 缩略图数组此时与缓存数组数据一致
                        this.thumbList = this.mediaList.slice();
                        break;
                    case 'left':
                    case 'prev':
                        // 点击缩略图左侧切换按钮
                        // 点击视图左侧切换按钮

                        if (mediaIndex !== 0) {
                            // 正常情况下, 边界元素不会是所有数据的首项, 往前选取元素组成新缩略图数组

                            // 计算抽取起始位置
                            startIndex = mediaIndex - step;
                            if (startIndex < 0) {
                                startIndex = 0;
                            }

                            // 更新缩略图列表
                            this.thumbList = this.mediaList.slice(startIndex, mediaIndex);

                            // 打开缩略图列表最末元素
                            this.openMedia(this.thumbList[this.thumbList.length - 1]);
                        } else {
                            // 万一是首项, 只能最左侧显示首项了

                            // 从首项开始选取元素组成缩略图元素列表
                            this.thumbList = this.mediaList.slice(0, step);

                            // 打开缩略图列表首个元素
                            this.openMedia(this.thumbList[0]);
                        }
                        break;
                    case 'right':
                    case 'next':
                        // 点击缩略图右侧切换按钮
                        // 点击视图右侧切换按钮

                        if (mediaIndex !== this.mediaList.length - 1) {
                            // 正常情况下, 边界元素不会是所有数据的尾项, 往后选取元素组成新缩略图数组

                            // 更新缩略图列表
                            this.thumbList = this.mediaList.slice(mediaIndex + 1, mediaIndex + 1 + step);

                            // 打开缩略图列表首个元素
                            this.openMedia(this.thumbList[0]);
                        } else {
                            // 万一是尾项, 只能最右侧显示尾项了

                            // 从尾项开始往前选取元素组成缩略图元素列表
                            // 计算抽取起始位置
                            startIndex = mediaIndex + 1 - step;
                            if (startIndex < 0) {
                                startIndex = 0;
                            }

                            // 更新缩略图列表
                            this.thumbList = this.mediaList.slice(startIndex, mediaIndex + 1);

                            // 打开缩略图列表最末元素
                            this.openMedia(this.thumbList[mediaIndex]);
                        }
                        break;
                }
            },
            // 点击图片空白区域 关闭图片预览
            isClickToClose(e) {
                e = e || window.event;
                const EMPTY = ['multiTypeCarousel-view-content-img', 'tool', 'multiTypeCarousel-view-btn', 'multiTypeCarousel-view-content-video'
                ];
                if (e && e.target) {
                    const clickEmpty = Array.from(e.target.classList).find(ele => {
                        return EMPTY.find(item => {
                            return item === ele;
                        });
                    });
                    console.log(clickEmpty);
                    if (clickEmpty) {
                        this.closeWin();
                    }
                }
                console.log(e);
            }
        },
        mounted() {
            // 初始化数据
            this.mediaList = [this.baseMedia];
            this.thumbList = this.mediaList.slice();

            // 根据是否为单图模式, 显示不同内容
            if (this.single) {
                this.openMedia(this.baseMedia);
            } else {
                // 显示遮罩层
                $('.multiTypeCarousel').css('background-color', 'rgba(0, 0, 0, 0.4)');
                // 显示关闭按钮
                $(this.$refs.closeBtn).show();
                // 左右键切换
                document.addEventListener('keydown', this.handleKeyDown);
                // 初始请求第一页数据
                this.loadMore('init');
            }
        },
        beforeDestroy() {
            // 左右键切换
            if (!this.single) {
                document.removeEventListener('keydown', this.handleKeyDown);
            }
        }
    };
</script>

<style lang="less" scoped>
    .multiTypeCarousel {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        z-index: 999;
        display: flex;
        flex-direction: column;

        .gallery {
            background-color: transparent;
            overflow: hidden;

            /deep/ .tool {
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: auto;
            }

            /deep/ .toolct {
                height: 42px;
                background: rgba(0, 0, 0, 0.5);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
                border-radius: 8px;
                padding: 0;
                overflow: hidden;

                > span {
                    display: inline-block;
                    height: 42px;
                    line-height: 42px;
                    width: 52px;
                    margin: 0;
                    cursor: pointer;

                    &:hover {
                        background: rgba(0, 0, 0, 0.6);
                    }
                }

                i {
                    color: white;
                    font-size: 20px;
                }
            }
        }

        &-viewContainer {
            flex: 1;
            overflow: hidden;
            display: flex;
        }

        &-view-btn {
            display: flex;
            align-items: center;
            padding: 0 20px;

            /deep/ i {
                border-radius: 50%;
                width: 40px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                color: white;
                font-size: 14px;
                font-weight: bolder;
                background: rgba(0, 0, 0, 0.4);
                cursor: pointer;

                &:hover {
                    background: rgba(0, 0, 0, 0.6);
                }
            }

            &-hidden {
                /deep/ i {
                    height: 0;
                    overflow: hidden;
                }
            }

            &-left {
                padding-left: 60px;
            }

            &-right {
                padding-right: 60px;

                /deep/ i {
                    transform: rotate(180deg);
                }
            }
        }

        &-view-content {
            flex: 1;
            position: relative;

            &-img, &-video {
                width: 100%;
                height: 100%;
                position: relative;
            }

            &-video {
                display: flex;
                align-items: center;
                justify-content: center;

                video {
                    max-height: 100%;
                    max-width: 100%;
                }

                .multiTypeCarousel-video-playBtn {
                    svg {
                        font-size: 50px;
                        cursor: pointer;
                    }
                }
            }
        }

        &-closeBtn {
            position: absolute;
            top: 0;
            right: 0;
            display: none;
            width: 40px;
            height: 40px;
            line-height: 1;

            background: rgba(0, 0, 0, 0.4);
            color: #F2F2F2;
            border-radius: 0 0 0 40px;
            padding: 10px 0 0 20px;
            cursor: pointer;

            z-index: 999;

            &:hover {
                background: rgba(0, 0, 0, 0.6);
            }
        }

        &-thumbContainer {
            height: 80px;
            position: relative;
        }

        &-thumb-btn {
            width: 30px;
            height: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            &:hover {
                background: rgba(0, 0, 0, 0.6);
            }

            /deep/ i {
                color: white;
                font-size: 14px;
                font-weight: bolder;
            }

            &-left {
                position: absolute;
                top: 0;
                left: 0;
            }

            &-right {
                position: absolute;
                top: 0;
                right: 0;

                /deep/ i {
                    transform: rotate(180deg);
                }
            }
        }

        &-thumb-content {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            text-align: center;
        }

        &-thumb-item {
            width: 60px;
            height: 60px;
            line-height: 60px;
            display: inline-block;
            vertical-align: middle;
            margin: 10px 5px;
            position: relative;
            cursor: pointer;

            &::after {
                position: absolute;
                content: ' ';
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background: rgba(0, 0, 0, 0.2);
            }

            &-active {
                border: 3px solid #4285F2;
                line-height: 54px;
            }

            &-active, &:hover {
                &::after {
                    position: absolute;
                    content: ' ';
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: transparent;
                }
            }

            img {
                height: 100%;
                max-width: 100%;
            }

            video {
                max-width: 100%;
                max-height: 100%;
                vertical-align: middle;
            }

            .multiTypeCarousel-video-playBtn {
                svg {
                    font-size: 26px;
                }
            }
        }

        &-video-playBtn {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
                color: rgba(0, 0, 0, 0.6);
            }
        }

        &-fail {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            /deep/ i {
                color: #FFF;
                font-size: 85px;
            }

            &-tip {
                color: #FFF;
                font-size: 12px;
                line-height: 18px;
                margin-top: 10px;
            }
        }
    }
</style>
