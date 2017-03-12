!(function(window){

	require.config({
		baseUrl: '../js/',
		paths:{
			jquery : 'plug-in/jquery-2.2.0.min',
			jqueryMobile : 'plug-in/jquery.mobile.custom.min',
			dataShop : 'data/data-shops',
			appendInfo : 'lib/appendInfo',
			touchScale : 'lib/touchScale'
		},
	}); 

	require(['jquery','dataShop','appendInfo'],function($,Data,Info){
		var data = Data['mc'],
			dom = $('#top-bar'),
			domArr = [
				dom.find('.title'),
				dom.find('.minGlod').find('span'),
				dom.find('.exGlod').find('span'),
				dom.find('.address').find('span'),
				dom.find('.tele').find('span')],
			dataArr = [data.name,data.minGlod,data.exGlod,data.address,data.tele];
		Info.put(domArr,dataArr);
		Info.putSrc(dom.find('.logo').find('img'),data.logo);
	});

	require(['jquery','touchScale'],function($,touchScale){
		var iframe = document.createElement("iframe"); 
		iframe.src = "BMap.html";
		iframe.id = "iframe";
		iframe.name = "iframe";
		iframe.class = "iframe";
		iframe.width = 100 + '%'; 
		iframe.height = 100 + '%';
		iframe.setAttribute('frameborder','0');
		iframe.onload = function(){ 
			var frame = iframe.contentWindow.document,
				$img = $('.preview-img',$(frame)).find('img');
			$img.each(function(){
				touchScale($(this),{
					prop : 1,
					max : 2,
					min : 0.8,
					bgColor:'rgba(0,0,0,.9)'
				},true);
			});
		}; 
		$('#frame').append(iframe);
		// var iframe = document.getElementById("iframe").contentWindow.document,
		// 	$img = $(iframe).find('img');
		// iframe.onload = function(){
		// 	$img.filter('.scaleImg').each(function(){
		// }
	});
})(window);