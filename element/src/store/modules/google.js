const google = {
    state: {
        isGoogleBind: false,
        customerId: '',
        // Google 绑定已失效
        isGoogleInvalid: false,

        /* google 广告 */
        // 设备类型
        deviceTypes: [
            'CONNECTED_TV',
            'DESKTOP',
            'MOBILE',
            'OTHER',
            'TABLET',
            'UNKNOWN',
            'UNSPECIFIED'
        ],
        lang_deviceTypes: {
            CONNECTED_TV: 'GA.deviceType.CONNECTED_TV',
            DESKTOP: 'GA.computer',
            MOBILE: 'GA.mobileDevice',
            OTHER: 'GA.deviceType.UNKNOWN',
            TABLET: 'GA.tablet',
            UNKNOWN: 'GA.unknown',
            UNSPECIFIED: 'GA.unspecified'
        },
        // 广告网络类型
        adNetworkTypes: [
            'CONTENT',
            'MIXED',
            'SEARCH',
            'SEARCH_PARTNERS',
            'UNKNOWN',
            'UNSPECIFIED',
            'YOUTUBE_SEARCH',
            'YOUTUBE_WATCH'
        ],
        lang_adNetworkTypes: {
            CONTENT: 'GA.adNet',
            MIXED: 'GA.adNetworkType.MIXED',
            SEARCH: 'GA.searchNet',
            SEARCH_PARTNERS: 'GA.adNetworkType.SEARCH_PARTNERS',
            UNKNOWN: 'GA.unknown',
            UNSPECIFIED: 'GA.unspecified',
            YOUTUBE_SEARCH: 'GA.YouTubeSearch',
            YOUTUBE_WATCH: 'GA.YouTubeVideo'
        },
        // 状态类型
        campaignStatus: [
            'UNSPECIFIED',
            'UNKNOWN',
            'ENABLED',
            'PAUSED',
            'REMOVED'
        ],
        lang_campaignStatus: {
            UNSPECIFIED: 'GA.unspecified',
            UNKNOWN: 'GA.unknown',
            ENABLED: 'GA.enabled',
            PAUSED: 'GA.suspend',
            REMOVED: 'GA.remove'
        }
    },
    mutations: {
        setIsGoogleBind(state, data) {
            state.isGoogleBind = data;
        },
        setCustomerId(state, data) {
            state.customerId = data;
        },
        // 设置"Google 绑定已失效"状态
        setIsGoogleInvalid(state, data) {
            state.isGoogleInvalid = data;
        }
    }
};
export default google;
