var ALLCLASS = [{
        name: '一年级上册',
        poetryList: [{
                title: '咏鹅',
                subtitle: '',
                dynasty: '唐',
                author: '骆宾王',
                id: '1-1',
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
                        id: 'bjsy',
                        position: 'left',
                        className: 'top1',
                        childen: [
                            { text: "注释", link: "fourlevel.html?id=1-1&theme=zs" },
                            { text: "大义", link: "fourlevel.html?id=1-1&theme=dy" },
                            { text: "背景", link: "fourlevel.html?id=1-1&theme=bj" },
                            { text: "作者", link: "fourlevel.html?id=1-1&theme=zz" },
                            { text: "解题", link: "fourlevel.html?id=1-1&theme=jt" }
                        ]
                    },
                    {
                        text: '吟诵图谱',
                        id: 'ystp',
                        position: 'left',
                        className: 'top2',
                        childen: [
                            { text: "吟诵符号", link: "fourlevel.html?id=1-1&theme=ysfh" },
                            { text: "文字谱", link: "fourlevel.html?id=1-1&theme=wzp" }
                        ]
                    },
                    {
                        text: '声韵含义',
                        id: 'syhy',
                        position: 'left',
                        className: 'top3',
                        childen: [
                            { text: "文体", link: "fourlevel.html?id=1-1&theme=wt" },
                            { text: "入声字", link: "fourlevel.html?id=1-1&theme=rsz" },
                            { text: "韵", link: "withPage.html?id=1-1&theme=yun" },
                            { text: "格律", link: "fourlevel.html?id=1-1&theme=gl" }
                        ]
                    },
                    {
                        text: '诗艺文法',
                        id: 'sywf',
                        position: 'right',
                        className: 'top1',
                        childen: [
                            { text: "意象", link: "fourlevel.html?id=1-1&theme=yx" },
                            { text: "修辞", link: "fourlevel.html?id=1-1&theme=xc" },
                            { text: "诗思", link: "fourlevel.html?id=1-1&theme=ss" }
                        ]
                    },

                    {
                        text: '文化教育',
                        id: 'whjy',
                        position: 'right',
                        className: 'top2',
                        childen: [
                            { text: "主题分析", link: "fourlevel.html?id=1-1&theme=ztfx" },
                            { text: "文化精神", link: "fourlevel.html?id=1-1&theme=whjs" },
                            { text: "立德树人", link: "fourlevel.html?id=1-1&theme=ldsr" }
                        ]
                    },
                    {
                        text: '教学实例',
                        id: 'jxsl',
                        position: 'right',
                        className: 'top3',
                        childen: [
                            { text: "课件", link: "fourlevel.html?id=1-1&theme=kj" },
                            { text: "参考教案", link: "fourlevel.html?id=1-1&theme=ja" }
                        ]
                    },
                    {
                        text: '教学资源',
                        id: 'jxzy',
                        position: 'right',
                        className: 'top4',
                        childen: [
                            { text: "诗教义解", link: "fourlevel.html?id=1-1&theme=sjyj" },
                            { text: "教学设计", link: "fourlevel.html?id=1-1&theme=jxsj" },
                            { text: "吟诵资料", link: "fourlevel.html?id=1-1&theme=yszl" },
                            { text: "吟诵百科", link: "fourlevel.html?id=1-1&theme=ysbk" }
                        ]
                    }
                ]
            },
            {
                title: '江南 汉乐府',
                subtitle: '',
                dynasty: '',
                author: '',
                id: '1-2'
            },
            {
                title: '画',
                subtitle: '',
                dynasty: '',
                author: '',
                id: '1-3'
            },
            {
                title: '悯农',
                subtitle: '其二',
                dynasty: '唐',
                author: '李绅',
                id: '1-4'
            },
            {
                title: '古朗月行',
                subtitle: '节选',
                dynasty: '唐',
                author: '李白',
                id: '1-5'
            },
            {
                title: '风',
                subtitle: '',
                dynasty: '唐',
                author: '李峤',
                id: '1-6'
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
        if (poetryList[i].id == id) {
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