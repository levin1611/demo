var ALLCLASS = [{
        name: '一年级上册',
        poetryList: [{
                title: '咏鹅',
                subtitle: '',
                dynasty: '唐',
                author: '骆宾王',
                sid: '1-1',
                intentionList: [
                    { id: '1-1-intention-1', text: '鹅' },
                    { id: '1-1-intention-2', text: '曲项' },
                    { id: '1-1-intention-3', text: '天' },
                    { id: '1-1-intention-4', text: '白毛' },
                    { id: '1-1-intention-5', text: '绿水' },
                    { id: '1-1-intention-6', text: '红掌' },
                    { id: '1-1-intention-7', text: '清波' }
                ],
                intentionBtn: [{
                        text: '背景释义',
                        pid: 'lefttop1',
                        position: 'left',
                        className: 'top1',
                        childen: [
                            { text: "注释", cid: "12345678", parentid: "lefttop1", link: "fourlevel.html?id=12345678" },
                            { text: "大义", cid: "13572468", parentid: "lefttop1", link: "fourlevel.html?id=13572468" },
                            { text: "背景", cid: "13456789", parentid: "lefttop1", link: "fourlevel.html?id=13456789" },
                            { text: "作者", cid: "43578833", parentid: "lefttop1", link: "fourlevel.html?id=43578833" },
                            { text: "解题", cid: "09903830", parentid: "lefttop1", link: "fourlevel.html?id=09903830" }
                        ]
                    },
                    {
                        text: '吟诵图谱',
                        pid: 'lefttop2',
                        position: 'left',
                        className: 'top2',
                        childen: [
                            { text: "吟诵符号", cid: "57343874", parentid: "lefttop2", link: "fourlevel.html?id=57343874" },
                            { text: "文字谱", cid: "34543235", parentid: "lefttop2", link: "fourlevel.html?id=34543235" }
                        ]
                    },
                    {
                        text: '声韵含义',
                        pid: 'syhy',
                        position: 'left',
                        className: 'top3',
                        childen: [
                            { text: "文体", parentid: "syhy", link: "fourlevel.html?id=1-1&theme=wt" },
                            { text: "入声字", parentid: "syhy", link: "fourlevel.html?id=1-1&theme=rsz" },
                            { text: "韵", parentid: "syhy", link: "withPage.html?id=1-1&theme=yun" },
                            { text: "格律", parentid: "syhy", link: "fourlevel.html?id=1-1&theme=gl" }
                        ]
                    },
                    {
                        text: '诗艺文法',
                        pid: 'righttop1',
                        position: 'right',
                        className: 'top1',
                        childen: [
                            { text: "意象", cid: '65556876', parentid: "righttop1", link: "fourlevel.html?id=65556876" },
                            { text: "修辞", cid: '65556877', parentid: "righttop1", link: "fourlevel.html?id=65556877" },
                            { text: "诗思", cid: '65556878', parentid: "righttop1", link: "fourlevel.html?id=65556878" }
                        ]
                    },

                    {
                        text: '文化教育',
                        pid: 'righttop2',
                        position: 'right',
                        className: 'top2',
                        childen: [
                            { text: "主题分析", cid: '75556876', parentid: "righttop2", link: "fourlevel.html?id=75556876" },
                            { text: "文化精神", cid: '75556877', parentid: "righttop2", link: "fourlevel.html?id=75556876" },
                            { text: "立德树人", cid: '75556878', parentid: "righttop2", link: "fourlevel.html?id=75556876" }
                        ]
                    },
                    {
                        text: '教学实例',
                        pid: 'jxsl',
                        position: 'right',
                        className: 'top3',
                        childen: [
                            { text: "课件", parentid: "jxsl", link: "fourlevel.html?id=1-1&theme=kj" },
                            { text: "参考教案", parentid: "jxsl", link: "fourlevel.html?id=1-1&theme=ja" }
                        ]
                    },
                    {
                        text: '教学资源',
                        pid: 'jxzy',
                        position: 'right',
                        className: 'top4',
                        childen: [
                            { text: "诗教义解", parentid: "jxzy", link: "fourlevel.html?id=1-1&theme=sjyj" },
                            { text: "教学设计", parentid: "jxzy", link: "fourlevel.html?id=1-1&theme=jxsj" },
                            { text: "吟诵资料", parentid: "jxzy", link: "fourlevel.html?id=1-1&theme=yszl" },
                            { text: "吟诵百科", parentid: "jxzy", link: "fourlevel.html?id=1-1&theme=ysbk" }
                        ]
                    }
                ]
            },
            {
                title: '大风歌',
                id: 1,
                subtitle: '',
                dynasty: '汉',
                author: '刘邦'
            },
            {
                title: '静夜思',
                id: 9,
                subtitle: '',
                dynasty: '唐',
                author: '李白'
            },
            {
                title: '池  上',
                subtitle: '',
                dynasty: '唐',
                author: '白居易',
                id: 18
            },
            {
                title: '江  南',
                id: 2,
                subtitle: '',
                dynasty: '',
                author: '汉乐府'
            },
            {
                title: '赠汪伦',
                id: 10,
                subtitle: '',
                dynasty: '唐',
                author: '李白'
            },
            {
                title: '寻隐者不遇',
                subtitle: '',
                dynasty: '唐',
                author: '贾岛',
                id: 19
            },
            {
                title: '咏  鹅',
                id: 3,
                subtitle: '',
                dynasty: '唐',
                author: '骆宾王'
            },
            {
                title: '古朗月行',
                id: 11,
                subtitle: '节选',
                dynasty: '唐',
                author: '李白'
            },
            {
                title: '金缕衣',
                subtitle: '',
                dynasty: '唐',
                author: '杜秋娘',
                id: 15
            },
            {
                title: '风',
                id: 4,
                subtitle: '',
                dynasty: '唐',
                author: '李峤'
            },
            {
                title: '秋浦歌',
                subtitle: '',
                dynasty: '唐',
                author: '李白',
                id: 12
            },
            {
                title: '李商隐李商隐李商隐乐游原·唐·李商',
                subtitle: '',
                dynasty: '',
                author: '',
                id: 20
            },
            {
                title: '渡汉江',
                id: 5,
                subtitle: '',
                dynasty: '唐',
                author: '宋之问'
            },
            {
                title: '听弹琴',
                subtitle: '',
                dynasty: '唐',
                author: '刘长卿',
                id: 13
            },
            {
                title: '山村咏怀',
                subtitle: '',
                dynasty: '宋',
                author: '邵雍',
                id: 21
            },
            {
                title: '送  兄',
                id: 6,
                subtitle: '',
                dynasty: '唐',
                author: '七岁女童'
            },
            {
                title: '前出塞',
                subtitle: '节选',
                dynasty: '唐',
                author: '杜甫',
                id: 14
            },
            {
                title: '小  池',
                subtitle: '',
                dynasty: '宋',
                author: '杨万里',
                id: 22
            },
            {
                title: '春  晓',
                id: 7,
                subtitle: '',
                dynasty: '唐',
                author: '孟浩然'
            },
            {
                title: '悯  农',
                subtitle: '其二',
                dynasty: '唐',
                author: '李绅',
                id: 16
            },
            {
                title: '画  鸡',
                subtitle: '',
                dynasty: '唐',
                author: '唐寅',
                id: 23
            },
            {
                title: '山  中',
                id: 8,
                subtitle: '',
                dynasty: '唐',
                author: '王维'
            },
            {
                title: '问刘十九',
                subtitle: '',
                dynasty: '唐',
                author: '白居易',
                id: 17
            },
            {
                title: '画',
                subtitle: '',
                dynasty: '',
                author: '',
                id: 24
            },
            {
                title: '渔家傲.秋思',
                id: 25,
                subtitle: '',
                dynasty: '宋',
                author: '范仲淹'
            },
            {
                title: '问刘十九',
                subtitle: '',
                dynasty: '唐',
                author: '白居易',
                id: 17
            },
            {
                title: '画',
                subtitle: '',
                dynasty: '',
                author: '',
                id: 24
            },
            {
                title: '山  中',
                id: 8,
                subtitle: '',
                dynasty: '唐',
                author: '王维'
            },
            {
                title: '问刘十九',
                subtitle: '',
                dynasty: '唐',
                author: '白居易',
                id: 17
            },
            {
                title: '画',
                subtitle: '',
                dynasty: '',
                author: '',
                id: 24
            },
            {
                title: '山  中',
                id: 8,
                subtitle: '',
                dynasty: '唐',
                author: '王维'
            },
            {
                title: '问刘十九',
                subtitle: '',
                dynasty: '唐',
                author: '白居易',
                id: 17
            },
            {
                title: '画',
                subtitle: '',
                dynasty: '',
                author: '',
                id: 24
            },
            {
                title: '山  中',
                id: 8,
                subtitle: '',
                dynasty: '唐',
                author: '王维'
            },
            {
                title: '问刘十九',
                subtitle: '',
                dynasty: '唐',
                author: '白居易',
                id: 17
            },
            {
                title: '画',
                subtitle: '',
                dynasty: '',
                author: '',
                id: 24
            }
        ],
        id: 1
    },
    {
        name: '一年级下册',
        poetryList: [],
        id: 2
    },
    {
        name: '二年级上册',
        poetryList: [],
        id: 3
    },
    {
        name: '二年级下册',
        poetryList: [],
        id: 4
    },
    {
        name: '三年级上册',
        poetryList: [],
        id: 5
    },
    {
        name: '三年级下册',
        poetryList: [],
        id: 6
    },
    {
        name: '四年级上册',
        poetryList: [],
        id: 7
    },
    {
        name: '四年级下册',
        poetryList: [],
        id: 8
    },
    {
        name: '五年级上册',
        poetryList: [],
        id: 9
    },
    {
        name: '五年级下册',
        poetryList: [],
        id: 10
    },
    {
        name: '六年级上册',
        poetryList: [],
        id: 11
    },
    {
        name: '六年级下册',
        poetryList: [],
        id: 12
    }
]

function goBack() {
    window.history.back();
}

function getAllClass() {
    var arr = [];
    for (var i = 0; i < ALLCLASS.length; i++) {
        var obj = {
            name: ALLCLASS[i].name,
            id: ALLCLASS[i].id
        }
        arr.push(obj);
    }
    return arr
}

function getClass(id) {
    for (var i = 0; i < ALLCLASS.length; i++) {
        if (ALLCLASS[i].id == id) {
            return ALLCLASS[i];
        }
    }
}

function getPoetryList(id) {
    for (var i = 0; i < ALLCLASS.length; i++) {
        if (ALLCLASS[i].id == id) {
            return ALLCLASS[i].poetryList;
        }
    }
}

function getIntention(parentid, id) {
    var poetryList = getPoetryList(parentid);
    for (var i = 0; i < poetryList.length; i++) {
        if (poetryList[i].sid == id) {
            return poetryList[i];
        }

    }
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var param = window.location.search.substr(1).match(reg);
    if (param != null) {
        return unescape(param[2]);
    }
    return null;
}

function dragFunc(id) {
    var Drag = document.getElementById(id);
    Drag.onmousedown = function(event) {
        var ev = event || window.event;
        event.stopPropagation();
        var disX = ev.clientX - Drag.offsetLeft;
        var disY = ev.clientY - Drag.offsetTop;
        document.onmousemove = function(event) {
            var ev = event || window.event;
            Drag.style.left = ev.clientX - disX + "px";
            Drag.style.top = ev.clientY - disY + "px";
            Drag.style.cursor = "move";
        };
    };
    Drag.onmouseup = function() {
        document.onmousemove = null;
        this.style.cursor = "default";
    };
};

function audioPlay(id) {

    $('#audioBox').fadeIn();
    //dragFunc('audio');
    $('#audioBox').html('')
    var audio1 = 'http://music.163.com/song/media/outer/url?id=435289279.mp3';
    var audio2 = 'https://www.runoob.com/try/demo_source/horse.mp3';
    var html = '';
    if (id == 'ds') {
        html = '<audio id="audio" src="' + audio2 + '" class="audio" controls autoplay>'
    } else {
        html = '<audio id="audio" src="' + audio1 + '" class="audio" controls autoplay>'
    }
    $('#audioBox').html(html)
    addScript();
    //var audio = document.getElementById('audio');
    // if (audio) {
    // if(id == 'ds'){
    //     $('#audio').attr('src',audio1)
    // }else{
    //     $('#audio').attr('src',audio2)
    // }
    //     //audio.load();
    //     //audio.play();
    // }
}

function addScript() {
    var js = document.createElement('script');
    js.type = 'text/javascript';
    js.id = 'html5media'
    js.src = 'https://api.html5media.info/1.2.2/html5media.min.js';
    document.getElementsByTagName('head')[0].appendChild(js);
}

function vedioPlay() {
    var id = getUrlParam('id');
    window.location.href = "video.html?id=" + id;
}

function showLogin() {
    var loginStates = $.cookie('login') ? $.cookie('login') : '';
    if (loginStates) {
        window.location.href = 'firstLevel.html';
        return
    }
    $('#login').fadeIn();
}

function hideLogin() {
    $('#login').fadeOut();
}

function login() {
    var userName = $('#userName').val();
    var passWord = $('#passWord').val();
    window.location.href = 'firstLevel.html';
    if (!userName || !passWord) {
        alert('请输入用户名及密码');
        return
    }
    var data = {
        user: userName,
        pass: passWord
    }
    $.ajax({   
        url: "",
        dataType: "json",
        async: true,
        data: data,
        type: "POST",
        success: function(result) {
            $.cookie('login', result);
        },
        error: function(result) { 
            alert(result);
        }
    });
}