<template>
    <div class="followUpPlan-component" v-loading="loading">
        <div class="noDataList" style="position: absolute;" v-if="!loading && totlePage === 0">
            <img :src="require('@/assets/images/nodata.png')" alt="">
            <p>{{$t('crm.Table.noData')}}</p>
        </div>
        <div class="map-pagination" v-if="totlePage>0">
            <Icon custom="custom-menu-arrow-forward" class="prePage cursor-pointer" color="#7B98B6" size="10px" @click="handlePre"></Icon>
            <span>第 {{curPage}} 页</span>
            <Icon custom="custom-menu-arrow-forward" class="cursor-pointer" color="#7B98B6" size="10px" @click="handleNext"></Icon>
        </div>
        <div id="myMap" class="myMap" ref="allmap"></div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmFollowupPlan } from '@/api/crm/index';

    export default {
        name: 'followUpRoute',
        components: {
        },
        props: [
            'planId'
        ],
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                followupTypes: state => state.crm.followUpType
            })
        },
        data() {
            return {
                loading: true,
                mapContainer: null,
                curPage: 1,
                totlePage: 0
            };
        },
        methods: {
            getPoint() {
                this.loading = true;
                crmFollowupPlan.planDetailLine({
                    pageSize: 10,
                    pageNo: this.curPage,
                    orgId: this.orgId,
                    createUserId: this.userId,
                    id: this.planId
                }).then(res => {
                    if (res.code === '1' && res.data.count) {
                        this.totlePage = Math.ceil(res.data.count / 10);
                        const pointList = res.data.list;
                        if (this.mapContainer) {
                            this.drowMap(pointList);
                        } else {
                            this.initMap(pointList);
                        }
                    } else {
                        this.totlePage = 0;
                        this.loading = false;
                    }
                });
            },
            initMap(pointList) {
                this.mapContainer = new window.BMapGL.Map('myMap');
                // this.mapContainer.enableScrollWheelZoom(true);
                this.drowMap(pointList);
            },
            drowMap(pointList) {
                const point = new window.BMapGL.Point(Number(pointList[0].longitude), Number(pointList[0].latitude)); // 创建点坐标
                this.mapContainer.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
                // this.mapContainer.clearOverlays(); 删不全
                const allOverlays = this.mapContainer.getOverlays();
                if (allOverlays && allOverlays.length) {
                    for (let i = 0; i < allOverlays.length; i++) {
                        this.mapContainer.removeOverlay(allOverlays[i]);
                    }
                }
                const PolylinePoint = [];
                for (let i = 0; i < pointList.length; i++) {
                    const text = i + 1;
                    PolylinePoint.push(new window.BMapGL.Point(Number(pointList[i].longitude), Number(pointList[i].latitude)));
                    const customOverlay = new window.BMapGL.CustomOverlay(createDOM, {
                        point: new window.BMapGL.Point(Number(pointList[i].longitude), Number(pointList[i].latitude)),
                        properties: {
                            text: text
                        }
                    });
                    this.mapContainer.addOverlay(customOverlay);
                }
                const polyline = new window.BMapGL.Polyline(PolylinePoint, {
                    strokeColor: '#04B4FF',
                    strokeWeight: 2,
                    strokeOpacity: 0.5
                });
                this.mapContainer.addOverlay(polyline);
                this.loading = false;
                function createDOM() {
                    const div = document.createElement('div');
                    const origin = location.origin;
                    div.style.position = 'absolute';
                    div.style.height = '34px';
                    div.style.width = '30px';
                    div.style.top = '-34px';
                    div.style.left = '-15px';
                    div.style.background = `url(${origin}/Front-Vue/image/mapAddress.png) no-repeat center center`;
                    div.style.backgroundSize = 'cover';
                    div.style.color = '#fff';
                    div.style.textAlign = 'center';
                    div.innerText = this.properties.text;
                    return div;
                }
            },
            handlePre() {
                if (this.curPage > 1) {
                    this.curPage--;
                    this.getPoint();
                }
            },
            handleNext() {
                if (this.curPage < this.totlePage) {
                    this.curPage++;
                    this.getPoint();
                }
            }
        },
        created() {
            this.getPoint();
        },
        mounted() {
        },
        beforeDestroy() {
            if (this.mapContainer) {
                this.mapContainer.destroy();
                this.mapContainer = null;
            }
        },
        watch: {}
    };
</script>

<style lang="less">
    .map-pagination{
        position: absolute;
        top: 12px;
        right: 15px;
        width: 118px;
        height: 40px;
        line-height: 40px;
        background: #FFFFFF;
        box-shadow: 1px 0px 4px rgba(90, 122, 198, 0.16), 2px 4px 8px rgba(99, 130, 202, 0.16);
        border-radius: 12px;
        z-index: 100;
        text-align: center;
        span {
            padding: 0 10px;
        }
    }
    .prePage {
        transform: rotate(-180deg);
    }
    #myMap{
        width: 100%;
        height: 100%;
    }
</style>
