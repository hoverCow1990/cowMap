define(['jquery','jqueryMobile'],function($){
	return (function(a,b){
		//参数为默认参数
		return b({
			prop : 1,
			max : 2,
			min : 0.7,
			bgColor: 'rgba(0,0,0,.9)',
		});
	})(window,function(defaultConfig){

		//黑色遮罩构造函数
		function TouchMasker(dom,option){
			this.dom = dom;
			this.option = $.extend('deep',defaultConfig,option,true);
			this.init();
		}

		//黑色遮罩
		TouchMasker.prototype = {
			//构造器
			constructor:'TouchMasker',
			//初始化
			init : function(){
				var This = this;
				this.fn.getSize.call(this);
				this.masker(this,this.option);
			},
			//遮罩事件处理
			masker : function(This,op){
				this.dom.on('click',function(){
					var src = This.fn.getSrc($(this)),
						$div = $('<div></div>').css({'position':'fixed','top':0,'left':0,'width':This.w,'height':100+'%','background-color':op.bgColor,'z-index':9999}),
						$delet = $('<div></div>').css({'position':'absolute','right':10,'top':10,'width':32,'height':32,'background':'url(https://img.alicdn.com/imgextra/i1/700459267/TB2jqYzb9iJ.eBjSspiXXbqAFXa_!!700459267.png)','z-index':99});
						$img = $('<img/>').attr('src',src);

					$div.append($delet).append($img).appendTo($('body')).on('touchmove',function(event) {
					    if(event.target.type == 'range') return;
					    event.preventDefault();
					});
					This.fn.posImg($img,This.w,This.h);
					if (This.constructor == 'TouchScale') This.touch($img,op.prop,op.max,op.min);
					$delet.on('click',function(){
						$div.remove();
						$div = null;
						$delet = null;
						$img = null;
						This.lastScale = 1;
					});
				});
			},
			fn : {
				getSize : function (){
					this.w = $(window).width();
					this.h = $(window).height();
				},
				getSrc : function(dom){
					var dom = dom[0].tagName == 'IMG'?dom:dom.find('img');
					return dom.attr('src');
				},
				posImg : function(dom,w,h){
					dom.on('load',function(){
						var width = $(this).width(),
							height = $(this).height(),
							s = w*8/10,
							bool = width > s,
							domW = bool?s:width,
							domH = bool?height*domW/width:height,
							domL = (w-domW)/2,
							domT = (h-domH)/2,
							json = {'position':'absolute','width':domW,'height':domH,'left':domL,'top':domT};
						$(this).css(json).data('size',json);
					});
				},
				getLength : function(x1,x2,y1,y2){
	    			var r = Math.sqrt( Math.pow(x2-x1,2) + Math.pow(y2-y1,2) );
	    			return r.toFixed(2);
    			}
			}
		}

		//touch事件构造函数
		function TouchScale(dom,option){
			this.lastScale = 1;
			TouchMasker.call(this,dom,option);
		}

		TouchScale.prototype = $.extend('deep',TouchMasker.prototype,{
			//构造器
			constructor: 'TouchScale',
			//判断touch状态
			touch : function(img,prop,max,min){
				var This = this;
				img.on("touchstart",function(ev){
	    			ev.preventDefault();
	    			ev.stopPropagation();
	    			var e = ev.originalEvent;
	    			e.targetTouches[1]?This.scale.call($(this),This,e,prop,max,min):This.move.call($(this),This,e);
	    		});
			},
			//单根手指情况挪动
			move : function(This,e){
				var domDate = this.data('size'),
					domW = domDate.width,
					domH = domDate.height,
					realW = This.lastScale*domW,
					realH = This.lastScale*domH,
					scaleW = (realW - domW)/2,
					scaleH = (realH - domH)/2;
				if(realW <= This.w && realH <= This.h) return;
				This.lastLeft = parseInt(this.css('left'));
				This.lastTop = parseInt(this.css('top'));
				var startX = e.targetTouches[0].screenX,
					startY = e.targetTouches[0].screenY;

				this.off("touchmove").on("touchmove",function(ev){
					ev.preventDefault();
	    			e = ev.originalEvent;
	    			var nowX = e.targetTouches[0].screenX,
	    				nowY = e.targetTouches[0].screenY,
	    				minusX = nowX - startX,
	    				minusY = nowY - startY,
	    				maxX = realW >= This.w?scaleW:This.w - realW + scaleW,
	    				minX = realW >= This.w?This.w - realW + scaleW:scaleW,
	    				maxY = realH >= This.h?scaleH:This.h - realH + scaleH,
	    				minY = realH >= This.h?This.h - realH + scaleH:scaleH,
	    				x = Math.max(Math.min(This.lastLeft + minusX,maxX),minX),
	    				y = Math.max(Math.min(This.lastTop + minusY,maxY),minY);
	    			$(this).css({'left':x,'top':y});	 
				});
				this.off("touchend").on("touchend",function(){
					$(this).off("touchmove");
				});
			},
			//两根手指情况放大缩小
			scale : function(This,e,prop,max,min){
				var x1 = e.targetTouches[0].screenX,
			    	y1 = e.targetTouches[0].screenY,
			    	x2 = e.targetTouches[1].screenY,
			    	y2 = e.targetTouches[1].screenY,
		    		startLength = This.fn.getLength(x1,x2,y1,y2),
		    		nowLength,minus,scale;
    			this.off("touchmove").on("touchmove",function(ev){
    				ev.preventDefault();
    				e = ev.originalEvent,
					x1 = e.targetTouches[0].screenX,
			    	y1 = e.targetTouches[0].screenY,
			    	x2 = e.targetTouches[1].screenY,
		    		y2 = e.targetTouches[1].screenY,
			    	nowLength = This.fn.getLength(x1,x2,y1,y2),
			    	minus = nowLength - startLength,
				    scale = Math.min(Math.max(This.lastScale + (minus/This.w*prop),min),max);
				   	$(this).css("transform","scale(" + scale.toFixed(2) + ")");
    			});
    			this.off("touchend").on("touchend",function(){
					$(this).off("touchMove");
					if(scale<1){
    					$(this).css({"transform":"scale("+1+")"}).addClass('active');
						This.lastScale = 1;
						setTimeout(function(){
							$(this).removeClass("active").data('scale',1);
						},200);
					}else{ 
						This.lastScale = scale;
						$(this).data('scale',scale.toFixed(2));
					}
	    		});
			},
		})


		return function(dom,option,bool){
			bool? new TouchScale(dom,option):new TouchMasker(dom,option);
		};
	});
});
