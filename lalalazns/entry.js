
var g_RootLayer = null;
var g_GradLayer = null;

var g_GameRoot = null

var g_SafeWidth = 720
var g_SafeHeight = 950


var g_CommonBG = null;

var g_CfgSnd = true;

var g_Tree = null;


window.onload = function(){
	cc.game.onStart = function(){
		
		cc.Director.sharedDirector.setDisplayStats(false);
		//load resources
		
		var ShouldDownload = [
			"images/sheet2.plist",
			"images/sheet2.png",
			"images/nvshen.plist",
			"images/nvshen.jpg",
			"snd/spear_03.wav",
			"images/help1.png",
			"images/help2.png",
			"images/help3.png",
			"images/share.png",
			];
		
		cc._loaderImage = "data:image/png;base64,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";
		cc.LoaderScene.preload( ShouldDownload , function () {
			var MyScene = cc.Scene.extend({
				onEnter:function () {
					g_GameRoot = this
					this._super();
					
					var listener = cc.EventListener.create({
						event: cc.EventListener.TOUCH_ONE_BY_ONE,
						swallowTouches: true,
						onTouchBegan: function (touch, event) {
							console.log("root_touchbegin");
							return true;
						},
						onTouchMoved: function (touch, event) {
						},
						onTouchEnded: function (touch, event) {
							var target = event.getCurrentTarget();
							console.log("root_touchend");
						}
					});
					cc.eventManager.addListener( listener, g_GameRoot );
					
					var ScreenSize = cc.director.getWinSize();
					var s = ScreenSize.width/g_SafeWidth;
					this.setScale(s)
					this.setAnchorPoint(0,0)
					this.setContentSize(g_SafeWidth,g_SafeHeight);
					
					g_RootLayer = cc.Layer.create()
					g_RootLayer.setContentSize(g_SafeWidth,g_SafeHeight)
					this.addChild(g_RootLayer)
					
					// 加载图片
					cc.spriteFrameCache.addSpriteFrames("images/sheet2.plist");
					
					var oldPixelFormat = cc.Texture2D.defaultPixelFormat;
					cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGB565;
					cc.spriteFrameCache.addSpriteFrames("images/nvshen.plist");
					cc.Texture2D.defaultPixelFormat = oldPixelFormat;
					
					
					g_GradLayer = cc.Layer.create();  //cc.LayerGradient.create(cc.color(0, 128, 255, 255),cc.color(128, 255, 255, 255),cc.p(0,1));
					g_GradLayer.setContentSize(g_SafeWidth,g_SafeHeight);
					this.addChild(g_GradLayer,-1);
					
					// 背景图
					var bgSF = cc.spriteFrameCache.getSpriteFrame("bg.png");
					var spBG = cc.Sprite.createWithSpriteFrame(bgSF);
					spBG.setAnchorPoint(0.0,0.0);
					spBG.setScaleX( g_SafeWidth / spBG.getContentSize().width );
					spBG.setScaleY( g_SafeHeight / spBG.getContentSize().height );
					g_GradLayer.addChild(spBG,-5);
					
					//clouds
					var sf_cloud1 = cc.spriteFrameCache.getSpriteFrame("cloud_1.png");
					var sf_cloud2 = cc.spriteFrameCache.getSpriteFrame("cloud_2.png");
					var arrCld = [sf_cloud1, sf_cloud2];
					
					var const_left = -200
					var const_right = g_SafeWidth + 200
					
					for( var i=0; i< 5 ; i++ ){
						var x = Math.random() * g_SafeWidth;
						var y = (0.5 + (Math.random()*0.5)) * g_SafeHeight;
						console.log(x + "  " + y);
						var idxCld = 0;
						if (Math.random()>0.5)
							idxCld = 1
						if( arrCld[idxCld] == null ){
							console.log("empty! "+ idxCld);
						}
						var cloud = cc.Sprite.createWithSpriteFrame(arrCld[idxCld]);
						cloud.setPosition(x,y);
						g_GradLayer.addChild(cloud,-4);
						
						var distLeft = x - const_left;
						var distRight = const_right - x;
						
						var totalTime = 10 + Math.random() * 10;
						
						var time_left = totalTime * distLeft/(distRight+distLeft);
						var time_right = totalTime - time_left;
						
						var seq = cc.sequence(cc.moveTo(time_left,cc.p(const_left,y)),cc.place(const_right,y),cc.moveTo(time_right,cc.p(x,y)));
						cloud.runAction(cc.repeatForever(seq));
					}
					
					var sfTree = cc.spriteFrameCache.getSpriteFrame("tree.png");
					var spTree = cc.Sprite.createWithSpriteFrame(sfTree);
					spTree.setAnchorPoint(0.5, 0);
					spTree.setPosition(30,120);
					g_GradLayer.addChild(spTree,0,999);
					g_Tree = spTree;
					
					var batchStar = cc.SpriteBatchNode.create("images/sheet2.png");
					g_GradLayer.addChild(batchStar);
					var spStar1 = cc.spriteFrameCache.getSpriteFrame("star.png");
					var spStar2 = cc.spriteFrameCache.getSpriteFrame("star2.png");
					var arrStars = [ spStar1, spStar2 ];
					for( var i=0; i< 15; i++ ){
						var x = Math.random() * g_SafeWidth;
						var y = (0.6 + (Math.random()*0.4)) * g_SafeHeight;
						console.log(x + "  " + y);
						var idxCld = 0;
						if (Math.random()>0.5)
							idxCld = 1
						if( arrCld[idxCld] == null ){
							console.log("empty! "+ idxCld);
						}
						var star = cc.Sprite.createWithSpriteFrame(arrStars[idxCld]);
						star.setPosition(x,y);
						batchStar.addChild(star,-3);
					}
					
					var sfSun = cc.spriteFrameCache.getSpriteFrame("sun.png");
					if( sfSun == null ){
						console.log("null sum");
					}
					var spSun = cc.Sprite.createWithSpriteFrame(sfSun);
					spSun.setPosition(500,460);
					g_GradLayer.addChild(spSun,0);
					
					uiman.ShowUI(UI_LOBBY);
				}
			});
			cc.director.runScene(new MyScene());
		}, this);
	};
	cc.game.run("gameCanvas");
};