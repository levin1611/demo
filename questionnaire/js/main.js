
$(function () {
	app.init()
});

var app = function (){
    //处理选择
    var selectHandle = function(){
    	$(".ns-checkbox").each(function (index, element) {
            var thisObj = this;
            $(this).find("input[type!='text']").each(function (index, element) {
                var thisChk = this;
                //处理默认情况
                var chk = "";
                if ($(this).prop("checked")) {
                    chk = " chk";
                }
                $(this).css("display", "none");
                $(this).after("<span class='nschkbox" + chk + "'>" + $(this).attr("title") + "</span> ");
                $(this).next(".nschkbox").off("click").on("click", function () {
                    if ($(thisChk).attr("type") == "radio") {
                        $(thisObj).find("input").prop("checked", false);
                        $(thisChk).prop("checked", true);
                        $(thisObj).find(".nschkbox").removeClass("chk");
                    	$(this).addClass("chk");
                        $(thisChk).change();
                        $(thisObj).find(".input input").val("");
                        $('#submitQusetion').removeClass('disable');
                    }
                    else {
                        if ($(thisChk).prop("checked")) {
							
                            $(thisChk).prop("checked", false);
                            $(this).removeClass("chk");
		                    var n = 0
		                    $(thisObj).find('span').each(function(index, element){
		                    	if(!$(this).hasClass('chk')){
		                    		n++;
		                    		if(n == $(thisObj).find('span').length){
                            			$('#submitQusetion').addClass('disable');
		                    		}
		                    	}
		                    })
                        }
                        else {
                            $(thisChk).prop("checked", true);
                        	$(this).addClass("chk");
                			$('#submitQusetion').removeClass('disable');
                        }
                        $(thisChk).change();
                    }
                });
            });
        });
    }

	return{
		init:function(){
			selectHandle();
		}
	}
}();