define(['jquery'],function($){
	return (function(a,b){
		var defaultOption = {
			id : 'BMap',							//显示百度地图的盒子 可传id名或者有id名的dom对象
			zoom : 15,    							//地图起始缩放比例(1-20) 1最大 20最小
			module : '',							//地图模式样式  默认''|| normal 夜间midnight 清新light 黑夜dark 红警redalert 精简googlelite 绿风grassgreen 粉色pink 青春darkgreen 蓝绿bluish 灰风grayscale 强边界hardedge
			backPoints : 'backPoint',				//返回起商铺坐标Id 不要的话就''
			backUserPoints : 'userPoint',			//返回起人物坐标Id 不要的话就''
			control : {								//各类控件
				Switch : true,  					//是否打开控件 false则一律不开 true则进入下边详细列表
				list : {							//控件列表单独设置 仅Switch为true时设置有效
					NavigationControl : [true],		//+ -控件 第一参数boolean为是否开启,第二参数[x,y]内可调整位置
					ScaleControl : [true,[10,10]],	//比例标尺 
					OverviewMapControl : [true],	//小地图
					MapTypeControl : [true]			//卫星模式
				}
			},
			overlay : {                             //覆盖物指针
				Switch : true,						//是否开启
				img : 'https://img.alicdn.com/imgextra/i3/700459267/TB2iTlrcp5N.eBjSZFKXXX_QVXa_!!700459267.png', //指针雪碧图地址 不传则用默认图片
				size : [32,32],						//图片尺寸
				offset : [17,40],					//位置偏移量
				styleIndex : [1,2],					//第一个为商铺样式,第二个为用户样式 参数有1-10种不同样式一一对应
				drug : false,						//指针是否能拖拽
				drugFn : function(e){				//拖拽执行的事件
					console.log("x:" + e.point.lng + ",y:" + e.point.lat);
				},
				click : false,						//指针是否点击事件
				clickFn : function(){				//点击执行的事件
					console.log('welcome');
				}
			},
			msg : {    								//信息窗口
				Switch : false,						//信息窗口开关
				opts : {							//信息窗口样式
					width : 100,					//宽度
					height : 50,					//高度
					title : '',					//标题
				},
				config : {							//具体设置
					info : '',					//内容
					titleSize : 16,					//标题字体大小
					infoSize : 12,					//内容字体大小
				},
			},
			traffic : {								//交通状况
				Switch : false,  					//交通状况开关
			},
			route : {								//交通线路
				Switch : true,						//线路开关
				img : {								//终点起点覆盖物
					Switch : false,					//覆盖物开关
					src : "http://developer.baidu.com/map/jsdemo/img/location.gif",	     //覆盖物图片不填则用默认的
					size : [32,32],					//图片尺寸
				}, 
				list : {
					Switch : true,
				},
			},
		}
		return b(defaultOption);
	})(window,function(defaultOption){

		//大地图构造函数
		function Map(){
			this.markArr = new Array();
		};
		//大地图原型函数
		Map.prototype = {
			//初始化大地图
			init : function(option){
				this.option = $.extend(defaultOption,option);
				this.counter = 0;
				this.map = new BMap.Map(this.fn.getId(this.option.id));
				this.getPoint.call(this,this.option.shopPoints,this.map,'shopPoints');
				this.getPoint.call(this,this.option.userPoints,this.map,'userPoints');
			},
			//获取对应经度纬度
			getPoint : function(points,map,attr){
				var This = this;
				if(typeof(points) === 'string'){
					var localSearch = new BMap.LocalSearch(map);
					localSearch.setSearchCompleteCallback(function(searchResult){
						console.log(searchResult);
				        var poi = searchResult.getPoi(0);
				        This[attr] = [poi.point.lng,poi.point.lat];
				        if(++This.counter == 2) This.handler(This.option);
				    });
					localSearch.search(points);
				}else{
					This[attr] = points;
					(++This.counter == 2) && This.handler(This.option);
				};
			},
			//根据option开关判断是否执行对应函数
			handler : function(op){
				delete this.counter;
				this.create(this.shopPoints,this.userPoints,op);
				if(this.fn.Switch(op,'control')) this.control(op.control.list,op.zoom);
				if(this.fn.Switch(op,'route')) this.route(op.route);
				this.fn.btn.call(this,op.backPoints,op.backUserPoints);
				if(this.fn.Switch(op,'traffic')) this.traffic();
			},
			//创建地图并判断是否需要加坐标指针
			create : function(s,u,op){
				this.shopPoints = new BMap.Point(s[0],s[1]);
				this.userPoints = new BMap.Point(u[0],u[1]);
				this.map.centerAndZoom(this.shopPoints,op.zoom);
				if(op.hasOwnProperty('module') && op.module) this.changeStyle(this.map,op.module);
				if(this.fn.Switch(op,'overlay')){
					var op = op.overlay;
					this.markArr.push(new Overlay().init(this.map,this.shopPoints,op,op.styleIndex[0]));
					if(this.userPoints) this.markArr.push(new Overlay().init(this.map,this.userPoints,op,op.styleIndex[1]));
				};
			},
			//控件执行
			control : function(op,zoom){	
				if(op){
					for (var key in op){
						var pos = op[key][1],
							opts = pos instanceof Array?{offset: new BMap.Size(pos[0],pos[1])}:void 0;
						op[key][0] && this.fn.control.call(this,key,opts);
					}
				}
				if(this.fn.Switch(this.option,'msg')) new Msg().init(this.map,this.option.msg); 
			},
			//改变模式
			changeStyle : function(map,module){
				map.setMapStyle({style:module});
			},
			//线路执行
			route : function(op,fn){
				new Route(op,this.map,this.shopPoints,this.userPoints);
			},
			//返回坐标执行
			backPoint : function(dom,bool){
				if(!dom) return;
				var point = bool?this.userPoints:this.shopPoints,
					This = this;
				dom.addEventListener('click',function(){
					This.map.panTo(point);
				});
			},
			//交通状况执行
			traffic : function(){
				var traffic = new BMap.TrafficLayer();        
				this.map.addTileLayer(traffic);         
			},
			//公用函数
			fn : {
				//获取id
				getId : function(id){
					return id?typeof(id) === 'string'?id:id.id:null;
				},
				//判断option开关
				Switch : function(op,key){
					return op.hasOwnProperty(key) && op[key].hasOwnProperty('Switch') && op[key].Switch === true;
				},
				//执行控件子类
				control : function(key,opts){
					this.map.addControl(new BMap[key](opts));
				},
				//返回坐标按钮dom搜索
				btn : function(){
					var name,dom;
					for(var i=0;i<2;i++){
						name = arguments[i];
						if(!name || typeof(name) != 'string') continue;
						dom = document.getElementById(name);
						this.backPoint(dom,i);
					}
				},
			}
		};

		//覆盖物构造函数
		function Overlay(){}

		//覆盖物原型
		Overlay.prototype = {
			//初始化
			init : function(map,point,op,index){
				return op.img?this.custom(map,point,op,index):this._default(map,point);
			},
			//默认样式
			_default : function(map,point){
				var marker = new BMap.Marker(point);        
				map.addOverlay(marker);
				return marker;                  
			},
			//自定义样式
			custom : function(map,point,op,index){
				var myIcon = new BMap.Icon(op.img,new BMap.Size(op.size[0],op.size[1]),{    
				    anchor: new BMap.Size(op.offset[0],op.offset[1]),   
				    imageOffset: new BMap.Size((1- index)*32,0)    
				}),    
					marker = new BMap.Marker(point, {icon: myIcon});    
				map.addOverlay(marker); 
				if(op.drug === true){ 
					marker.enableDragging();    
					op.drugFn.constructor === Function && marker.addEventListener("dragend",op.drugFn);
				}
				if(op.drug === false && op.clickFn.constructor === Function && op.click === true) marker.addEventListener('click',op.clickFn);
				return marker;
			}
		}

		//信息窗口构造函数
		function Msg(){}

		//信息窗口原型
		Msg.prototype = {
			//初始化
			init : function(map,op){
				var infoWindow = new BMap.InfoWindow(op.config.info||'',op.opts);  
				map.openInfoWindow(infoWindow, map.getCenter());
				if(!op.config || $.isEmptyObject(op.config)) return;
				$('head').append('<style>.BMap_bubble_title{font-size:'+ op.config.titleSize +'px}.BMap_bubble_content{font-size:'+ op.config.infoSize +'px;color:#666;padding-top:10px;}</style>');   
			},
		};

		//线路构造函数
		function Route(op,map,shop,user){
			this.handler(op,map,shop,user);
		};

		Route.prototype = {
			handler : function(op,map,shop,user){
				var bool = this.fn.Switch(op,'img'),
					size = bool?op.img.size:[0,0],
					length = op.img.src.length,
					data = this.fn.Switch(op,'list')?{map: map,panel:this.fn.getId(op.list.id)}:{map: map},
					transit = new BMap.TransitRoute(map, {renderOptions: data});
				transit.search(user,shop);
				if(bool && !length) return; 
				var myIcon = new BMap.Icon(op.img.src, new BMap.Size(size[0],size[1]));
				transit.setMarkersSetCallback(function(result){
						result[0].marker.setIcon(myIcon);
						result[1].marker.setIcon(myIcon);
				});	
			},
			fn : {
			
			}
		};

		Route.prototype.fn.Switch = Map.prototype.fn.Switch;
		Route.prototype.fn.getId = Map.prototype.fn.getId;

		return new Map();
	});
})