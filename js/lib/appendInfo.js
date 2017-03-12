define(['jquery'],function($){
	return (function(a,b){
		return b();
	})(window,function(){
		function Info(){};
		//Info原型
		Info.prototype = {
			put: function(dom,data){
				var domLen = dom.length,
					dataLen = data.length,
					domArr = Array.isArray(dom),
					dataArr = Array.isArray(dom);
				if(domArr && dataArr && domLen != dataLen){
					throw new Error('Number of nodes is not in accordance with data');
					return;
				}
				if(dom.length == 1){
					dom.append(data);
				}else{
					if(domArr){
						for(var i=0;i<domLen;i++){
							dom[i].append(data[i]);
						}
					}
				}
				return dom;
			},
			putSrc : function(dom,data){
				var length = dom.length,
					test = this.fn.testSrc(data);
				if(test == 2 || test == 1 && data.length != length) return;
				if(!length){
					throw new Error('dom is not exist');
					return;
				}
				if(test){
					for(var i = 0;i < length;i++){
						dom[i].setAttribute('src',data[i]);
					}
				}else{
					dom = dom.constructor == $?dom[0]:dom;
					dom.setAttribute('src',data);
				}
				return dom;
			},
			creat : function(dom,json){
				console.log(json);
			},
			fn : {
				testSrc : function(data){
					if('string' === typeof(data)){
						return 0;
					}else if(data instanceof Array){
						for(var i = 0;i < data.length;i++){
							if('string' != typeof(data[i])) return 2;
						}
						return 1;
					}
					return 2;
				}
			}
		}
	
		return new Info;
	});
})