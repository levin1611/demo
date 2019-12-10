var ALLCLASS = [{
    name: '一年级',
    poetryList: [{
            title: '大风歌',
            id: 1
        },
        {
            title: '江  南',
            id: 2
        },
        {
            title: '咏  鹅',
            id: 3
        },
        {
            title: '风',
            id: 4
        },
        {
            title: '渡汉江',
            id: 5
        },
        {
            title: '送  兄',
            id: 6
        },
        {
            title: '春  晓',
            id: 7
        },
        {
            title: '山  中',
            id: 8
        },
        {
            title: '静夜思',
            id: 9
        },
        {
            title: '赠汪伦',
            id: 10
        },
        {
            title: '古朗月行(节选)',
            id: 11
        },
        {
            title: '秋浦歌',
            id: 12
        },
        {
            title: '听弹琴',
            id: 13
        },
        {
            title: '前出塞(节选)',
            id: 14
        },
        {
            title: '游子吟',
            id: 15
        },
        {
            title: '悯  农(其二)',
            id: 16
        },
        {
            title: '问刘十九',
            id: 17
        },
        {
            title: '池  上',
            id: 18
        },
        {
            title: '寻隐者不遇',
            id: 19
        },
        {
            title: '乐游原',
            id: 20
        },
        {
            title: '山  村',
            id: 21
        },
        {
            title: '小  池',
            id: 22
        },
        {
            title: '画  鸡',
            id: 23
        },
        {
            title: '画',
            id: 24
        },
    ],
    id: 1
}, {
    name: '二年级',
    poetryList: [],
    id: 2
}, {
    name: '三年级',
    poetryList: [],
    id: 3
}, {
    name: '四年级',
    poetryList: [],
    id: 4
}, {
    name: '五年级',
    poetryList: [],
    id: 5
}, {
    name: '六年级',
    poetryList: [],
    id: 6
}, {
    name: '七年级',
    poetryList: [],
    id: 7
}, {
    name: '八年级',
    poetryList: [],
    id: 8
}, {
    name: '九年级',
    poetryList: [],
    id: 9
}]

function goBack() {
    window.history.back();
}

function getAllClass() {
    var arr = [];
    for (var i = 0; i < ALLCLASS.length; i++) {
        var obj = {
            name: ALLCLASS[i].name,
            id: ALLCLASS[i].id,
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
    dragFunc('audio');
    var audio1 = 'http://music.163.com/song/media/outer/url?id=435289279.mp3';
    var audio2 = 'https://www.runoob.com/try/demo_source/horse.mp3';
    
    var audio = document.getElementById('audio');
    if (audio) {
        if(id == 'audioYin'){
            $('#audio').attr('src',audio1)
        }else{
            $('#audio').attr('src',audio2)
        }
        
        $('#' + id).fadeIn();
        audio.load();
        audio.play();
    }
}
function showAudio(id) {
    $('#' + id).fadeIn();
}

function hideAudio(id) {
    $('#' + id).fadeOut();
}
function next(){
    var id = getUrlParam('id');
    var location = window.location.href.substr(0,window.location.href.indexOf('?'));
    window.location.href = location+'?id='+(Number(id)+1)
}
function pre(){
    var id = getUrlParam('id');
    var location = window.location.href.substr(0,window.location.href.indexOf('?'));
    window.location.href = location+'?id='+(Number(id)-1)
}