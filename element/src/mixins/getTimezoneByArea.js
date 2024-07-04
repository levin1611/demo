import util from '@/libs/util';
export default {
    data() {
        return {
            // 多久更新一次时间
            timeStepFroTimeZone: 60000 * 5
        };
    },
    methods: {
        // 查询中国的服务器时间并且更新会话列表时区的时间
        getServeTime() {
            return util.ajaxWAJson({
                url: '/minor/waReport/getServerTime',
                method: 'get',
                params: { t: new Date() }
            });
        },
        getFriendsTime(timeZone, time) {
            // time = 1687934153098;
            const minutes = 3600000 * (Number(timeZone)); // 1小时
            // console.log(ele,timeZone,'ddd');
            // return timeZone;
            return new Date(time + minutes).format('hh') + '时';
            // new Date(time - minutes).format('yyyy/MM/dd hh');
        }
    }
};