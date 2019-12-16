var ALLCLASS = [
    {
        name: '一年级上册',
        poetryList: [
            {title:'咏鹅',subtitle:'',dynasty:'唐',author:'骆宾王',id:'1-1'},
            {title:'江南 汉乐府',subtitle:'',dynasty:'',author:'',id:'1-2'},
            {title:'画',subtitle:'',dynasty:'',author:'',id:'1-3'},
            {title:'悯农',subtitle:'其二',dynasty:'唐',author:'李绅',id:'1-4'},
            {title:'古朗月行',subtitle:'节选',dynasty:'唐',author:'李白',id:'1-5'},
            {title:'风',subtitle:'',dynasty:'唐',author:'李峤',id:'1-6'}
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