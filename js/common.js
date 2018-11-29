$(function(){
     var ua = window.navigator.userAgent;
    if(ua.match(/MicroMessenger/i) != 'MicroMessenger'){
      document.body.innerHTML = '请在微信手机端打开';
      window.location.href = "demo1.html"
      return
    }else{
      var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
          isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
          isAndroid = ua.match(/(Android)\s+([\d.]+)/),
          isMobile = isIphone || isAndroid;
          //alert(isMobile);
      if(!isMobile){
        //document.getElementById('warp').style.display = 'none';
        document.body.innerHTML = '请在微信手机端打开';
        window.location.href = "demo1.html"
      }
    }
    $('#showRule').click(function(){
      $('#rule').fadeIn();
    })
    $('#knowBtn').click(function(){
      $('#rule').fadeOut();
    })
     var avatar = new Mavatar({el: '#avatar', fileOnchange: function (e) {
      if($('#Mavatar-img')){
        setTimeout(function(){
          bgStart($('#Mavatar-img').attr('src'));
          $('#generateBtn').removeClass('grey').attr('onClick','generate()')
        },500)
      }
     }});
    $('.swiper-wrapper>.swiper-slide').click(function(){
      $('#showImg').attr('src',$(this).children('img').attr('src'))
    })
    var reqAnimationFrame = (function () {
        return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
      })();
      var bg = document.getElementById("imgbj");
      var xy = getxy(bg);
      var bgP = {
              x:0,y:0,dx:0,dy:0,
              s:1,ls:1,bdw:xy[0],bdh:xy[1]
      };
      var mc = new Hammer.Manager(bg);
      function getxy(e){
      var a=new Array()
      var t=e.offsetTop;
      var l=e.offsetLeft;
      var w=e.offsetWidth;
      var h=e.offsetHeight;
      while(e=e.offsetParent){
          t+=e.offsetTop;
          l+=e.offsetLeft;
      }
      a[0]=w;a[1]=h;
      a[2]=l;a[3]=t;
      return a;
    }
  
  function imgLoaded(){
    bgP.bgw = this.width;
    bgP.bgh = this.height;
 
    if(bgP.bgw / bgP.bgh > bgP.bdw / bgP.bdh)
      bgP.useW = false;
    else
      bgP.useW = true;
 
    this.style.display = 'none';
 
    bg.style.backgroundImage = 'url('+this.src+')';
    bg.style.backgroundRepeat = 'no-repeat';
    bg.style.backgroundSize = bgP.useW? (bgP.bgw+'px auto') : ('auto '+bgP.bgh+'px');
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
 
    mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'));
    mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);
 
    mc.on("panstart panmove", onPan);
    //mc.on("rotatestart rotatemove", onRotate);
    mc.on("pinchstart pinchmove", onPinch);
 
    mc.on("hammer.input", function(ev) {
      if(ev.isFinal) {
        bgP.dx = 0;
        bgP.dy = 0;
        bgP.ls = 1;
      }
    });
  }
 
    function onPan(ev) {
      bgP.x += ev.deltaX - bgP.dx;
      bgP.y += ev.deltaY - bgP.dy;
      bgP.dx = ev.deltaX;
      bgP.dy = ev.deltaY;
      // if(bgP.x>0) bgP.x = 0;
      // if(bgP.y>0) bgP.y = 0;
      // if(bgP.x+bgP.bgw*bgP.s<bgP.bdw){
      //   bgP.x = bgP.bdw - bgP.bgw*bgP.s;
      // }
      // if(bgP.y+bgP.bgh*bgP.s<bgP.bdh){
      //   bgP.y = bgP.bdh - bgP.bgh*bgP.s;
      // }
      var pos = bgP.x+'px '+bgP.y+'px';
      bg.style.backgroundPosition = pos;
    }
 
      var initScale = 1;
    function onPinch(ev) {
        if(ev.type == 'pinchstart') {
            initScale = transform.scale || 1;
        }
      var add = ev.scale - bgP.ls;
      bgP.s += add;
      bgP.ls = ev.scale;

      if(bgP.useW){
        var w = (bgP.bgw*bgP.s);
        /*if(w<bgP.bdw)
        {
          bgP.s = bgP.bdw/bgP.bgw;
          w = (bgP.bgw*bgP.s);
        }*/
        bg.style.backgroundSize = w +'px auto';
       
      }else{
        var h = (bgP.bgh*bgP.s);
        /*if(h<bgP.bdh)
        {
          bgP.s = bgP.bdh/bgP.bgh;
          h = (bgP.bgh*bgP.s);
        }*/
        bg.style.backgroundSize = 'auto '+h +'px';
      }
    }
 
    function bgStart(src){
      var img = document.createElement('img');
      img.src = src;
      img.style.opacity = '0.01';
      img.onload = imgLoaded;
    }
    
    
  })
  function generate(){
      $('#showLoad').show();
       var copyDom = $("#imgbj");
      var width = copyDom.offsetWidth;//dom宽
      var height = copyDom.offsetHeight;//dom高
      var scale = 2;//放大倍数
      var canvas = document.createElement('canvas');
      canvas.width = width*scale;//canvas宽度
      canvas.height = height*scale;//canvas高度
      var content = canvas.getContext("2d");
      content.scale(scale,scale);
      var rect = copyDom.get(0).getBoundingClientRect();//获取元素相对于视察的偏移量
      content.translate(-rect.left,-rect.top);
      setTimeout(function(){
        html2canvas(copyDom[0],{
            dpi: window.devicePixelRatio*2,
            scale:scale,
            canvas:canvas,
            width:width,
            heigth:height,
        }).then(canvas => {
          $('#imgBox').show();
          $('#generateImg').attr('src',canvas.toDataURL());
          $('#showLoad').fadeOut();
        });
      },1500)
      
  }