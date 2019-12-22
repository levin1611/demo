var ALLCLASS = [{
        name: '一年级上册',
        poetryList: [{
                title: '咏鹅',
                subtitle: '',
                dynasty: '唐',
                author: '骆宾王',
                id: '1-1',
                intentionList:[
                    { id:'1-1-intention-1',text:'鹅'},
                    { id:'1-1-intention-2',text:'曲项'},
                    { id:'1-1-intention-3',text:'天'},
                    { id:'1-1-intention-4',text:'白毛'},
                    { id:'1-1-intention-5',text:'绿水'},
                    { id:'1-1-intention-6',text:'红掌'},
                    { id:'1-1-intention-7',text:'清波'}
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
function getIntention(parentid,id){
    var poetryList = getPoetryList(parentid);
    for(var i=0;i<poetryList.length;i++){
        if(poetryList[i].id == id){
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
    Drag.onmousedown = function (event) {
        var ev = event || window.event;
        event.stopPropagation();
        var disX = ev.clientX - Drag.offsetLeft;
        var disY = ev.clientY - Drag.offsetTop;
        document.onmousemove = function (event) {
            var ev = event || window.event;
            Drag.style.left = ev.clientX - disX + "px";
            Drag.style.top = ev.clientY - disY + "px";
            Drag.style.cursor = "move";
        };
    };
    Drag.onmouseup = function () {
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
function vedioPlay(){
    var id = getUrlParam('id');
    window.location.href = "video.html?id=" + id;
}