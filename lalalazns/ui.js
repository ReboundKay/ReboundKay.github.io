
var uiman = uiman || {};

var mCurUI = null;

var UI_LOBBY = 1
var UI_RESULT = 2
var UI_HELP = 3

function __GenContent(){
	var descContent = "";
	if (g_TotalScore > 0 ){
		descContent = "我得了" + g_TotalScore + "分，求超越";
	}else{
		descContent = "据说得到100分的都是神！!";
	}
	return descContent;
}

function onBridgeReady(){

	wx.onMenuShareTimeline({
    title: __GenContent(), // 分享标题
    link: 'https://reboundkay.github.io/lalalazns/index.html', // 分享链接
    imgUrl: 'https://reboundkay.github.io/lalalazns/images/logo300.png', // 分享图标
    success: function () {
        window.alert('分享成功')
    },
    cancel: function () {
        // 用户取消分享后执行的回调函数
    }
	});
	
	
	wx.onMenuShareAppMessage({
    title: __GenContent(), // 分享标题
    desc: '啦啦啦种女神', // 分享描述
    link: 'https://reboundkay.github.io/lalalazns/index.html', // 分享链接
    imgUrl: 'https://reboundkay.github.io/lalalazns/images/logo300.png', // 分享图标
    success: function () {
        // 用户确认分享后执行的回调函数
    },
    cancel: function () {
        // 用户取消分享后执行的回调函数
    }
	});

	/*
	WeixinJSBridge.on('menu:share:appmessage', function (argv) {
		
        WeixinJSBridge.invoke('sendAppMessage', {			
			"title": __GenContent(), 
			"link": "https://reboundkay.github.io/lalalazns/index.html", 
			"desc": "啦啦啦种女神",
			"img_url": "https://reboundkay.github.io/lalalazns/images/logo300.png", 
        }, function (res) {
			_report('send_msg', res.err_msg);
		})
	});
	WeixinJSBridge.on('menu:share:timeline', function (argv) {
        WeixinJSBridge.invoke('shareTimeline', {			
			"title": __GenContent(), 
			"link": "https://reboundkay.github.io/lalalazns/index.html", 
			"desc": "啦啦啦种女神",
			"img_url": "https://reboundkay.github.io/lalalazns/images/logo300.png", 
        }, function (res) {
			_report('send_msg', res.err_msg);
		})
	});
	*/
}

uiman.ShowUILobby = function(){
	var obj = {
		
	};
	obj.uinode = cc.Layer.create()
	var w = g_SafeWidth
	var h = g_SafeHeight
	obj.uinode.setContentSize(w,h);
	
	// title
	var gameLogoSF = cc.spriteFrameCache.getSpriteFrame("game_logo.png");
	var gameLogo = cc.Sprite.createWithSpriteFrame(gameLogoSF);
	obj.uinode.addChild(gameLogo);
	gameLogo.setPosition(w*0.5, h* 0.75);
	
	var ttf1 = cc.LabelTTF.create("你和哪个女神最有缘？","Arial",28);
	ttf1.setColor(cc.color(0,0,0));
	obj.uinode.addChild(ttf1);
	ttf1.setAnchorPoint(0.0,0.5);
	ttf1.setPosition(w*0.2,h*0.25 + 30);
	
	var ttf2 = cc.LabelTTF.create("今天种下一个女神，明天将收获很多女神","Arial",20);
	ttf2.setColor(cc.color(0,0,0));
	obj.uinode.addChild(ttf2);
	ttf2.setAnchorPoint(1.0,0.5);
	ttf2.setPosition(w*0.8,h*0.25 - 30);
	
	// start 按钮
	var btn_start = glb_GenSpriteFrameButtonEx("btn_start_1.png","btn_start_2.png","",function(){
		
		uiman.CloseUI(UI_LOBBY);
		
		logic.start();
	});
	obj.uinode.addChild( btn_start,0 );
	btn_start.setPosition(w*0.5, h*0.1);
	
	// snd 按钮
	var btn_snd = glb_GenSpriteFrameButtonEx("btn_snd_1.png","btn_snd_2.png","",function(btn,enable){
		if( enable == true )
			cc.audioEngine.playEffect("snd/spear_03.wav");
		//WeiXinShareBtn();
		
		g_CfgSnd = enable;
		
		console.log(enable);
	},true);
	obj.uinode.addChild( btn_snd,0 );
	btn_snd.setPosition(w*0.5+ 200, h*0.5);
	
	glb_SetRadioState(btn_snd,g_CfgSnd);
	
	var sfRole = cc.spriteFrameCache.getSpriteFrame("role.png");
	var spRole = cc.Sprite.createWithSpriteFrame(sfRole);
	spRole.setPosition(w*0.5, h*0.5);
	obj.uinode.addChild(spRole);
	
	
	// help 按钮
	var btn_help = glb_GenSpriteFrameButtonEx("btn_help_1.png","btn_help_2.png","",function(btn,enable){
		uiman.ShowUI(UI_HELP);
	});
	obj.uinode.addChild( btn_help,0 );
	btn_help.setPosition(w*0.5 - 200, h*0.1);
	
	// 注册微信分享相关
	//document.addEventListener('WeixinJSBridgeReady', onBridgeReady(), false)
	//onBridgeReady();
	
	return obj
}

uiman.ShowInGame = function(){
	var obj = {
		
	};
	var sf_bg = cc.spriteFrameCache.getSpriteFrame("ingame_board.png");
	obj.uinode = cc.Sprite.createWithSpriteFrame(sf_bg);
	obj.uinode.setAnchorPoint(0,0);
	var size = obj.uinode.getContentSize();
	
	obj.isShow = false;
	var clickRange = cc.Layer.create();
	clickRange.setContentSize(64,64);
	clickRange.setPosition(0,94)
	obj.uinode.addChild(clickRange);
	
	var listener = cc.EventListener.create({
		
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: true,
		onTouchBegan: function (touch, event) {
			console.log("range  touchbegin");
			var bIn = glb_WorldPtInNode(clickRange,touch.getLocation());
			if ( bIn == true ){
				return true
			}
			return false;
		},
		onTouchMoved: function (touch, event) {
		},
		onTouchEnded: function (touch, event) {
			console.log("range touchend");
			var bIn = glb_WorldPtInNode(clickRange,touch.getLocation());
			if ( bIn == true ){
				if ( obj.isShow == true ){
					obj.Hide();
				}else{
					obj.Show();
				}
			}
		}
	});
	cc.eventManager.addListener( listener, clickRange );
	
	obj.btn_home = glb_GenSpriteFrameButtonEx("btn_home_1.png","btn_home_2.png",null,function(){
		g_RootLayer.removeAllChildren(true);
		uiman.ShowUI(UI_LOBBY);
	});
	obj.uinode.addChild(obj.btn_home);
	obj.btn_home.setPosition(40,50);
	var btn_snd = glb_GenSpriteFrameButtonEx("btn_snd_1.png","btn_snd_2.png",null,function(who, enable){
		if( enable == true )
			cc.audioEngine.playEffect("snd/spear_03.wav");
		g_CfgSnd = enable;
	},true);
	obj.uinode.addChild(btn_snd);
	btn_snd.setPosition(120,50);
	
	glb_SetRadioState(btn_snd,g_CfgSnd);
	
	obj.Hide = function(){
		obj.isShow = false;
		obj.uinode.runAction(cc.moveTo(0.1,cc.p(0,-100)));
	};
	obj.Show = function(){
		obj.isShow = true;
		obj.uinode.runAction(cc.moveTo(0.1,cc.p(0,0)));
	}
	
	return obj;
}

uiman.ShowUIResult = function(){
	
	var obj = {
		
	};
	
	obj.uinode = cc.Layer.create()
	var w = g_SafeWidth;
	var h = g_SafeHeight;
	obj.uinode.setContentSize(w,h);
	
	var heightUp = h * 0.15
	var heightBottom = h * 0.1
	var heightCenter = h - heightUp - heightBottom
	var YCenter = heightBottom
	var Yup = heightBottom + heightCenter
	
	// 上面部分
	var topPart = cc.LayerColor.create(cc.color(0,0,0,100));
	topPart.setContentSize(g_SafeWidth, heightUp);
	topPart.setPositionY( Yup );
	obj.uinode.addChild(topPart,10);
	
	var ttf_score = cc.LabelTTF.create("本次分数："+g_TotalScore,"Arial",30);
	ttf_score.setAnchorPoint(0.0,0.5);
	ttf_score.setPosition(50,heightUp*0.6666);
	topPart.addChild(ttf_score);
	
	var ttf_highest = cc.LabelTTF.create("最高分数："+g_TotalScoreBest,"Arial",30);
	ttf_highest.setAnchorPoint(1.0,0.5);
	ttf_highest.setPosition(w - 50,heightUp*0.6666);
	topPart.addChild(ttf_highest);
	
	var ttf_gain = cc.LabelTTF.create("","Arial",30);
	ttf_gain.setAnchorPoint(0.0,0.5);
	ttf_gain.setPosition(50,heightUp*0.33333);
	topPart.addChild(ttf_gain);
	if ( g_GainNvshen.length > 0 )
		ttf_gain.setString("本次您获得了以下女神：");
	else
		ttf_gain.setString("很遗憾，本次未获得任何女神。。。");
	
	obj.ttf_page = cc.LabelTTF.create("?/?","Arial",25);
	obj.ttf_page.setPosition(w - 100,heightUp*0.33333);
	topPart.addChild(obj.ttf_page);
	
	// 下面部分
	var bottomPart = cc.LayerColor.create(cc.color(0,0,0,100));
	bottomPart.setContentSize(g_SafeWidth, heightBottom);
	bottomPart.setPositionY( 0 );
	obj.uinode.addChild(bottomPart,10);
	
	var btn_next = glb_GenSpriteFrameButtonEx("btn_next_1.png","btn_next_2.png",null,function(){
		console.log("next");
		var nextPage = obj.curPage+1
		var maxPage = Math.ceil(g_GainNvshen.length/3)
		if( nextPage >= maxPage )
			nextPage = 0;
		obj.gotoPage(nextPage);
	});
	btn_next.setPosition(260,heightBottom*0.5)
	bottomPart.addChild(btn_next);
	
	var btn_again = glb_GenSpriteFrameButtonEx("btn_again_1.png","btn_again_2.png",null,function(){
		console.log("again");
		uiman.CloseUI(UI_RESULT)
		logic.start();
	});
	
	btn_again.setPosition(460,heightBottom*0.5)
	bottomPart.addChild(btn_again);
	
	//　中间内容部分
	var centerPart = cc.Layer.create();
	centerPart.setContentSize(g_SafeWidth, heightCenter);
	centerPart.setPositionY( YCenter );
	obj.uinode.addChild(centerPart,0);
	
	//　中间内容部分
	var txtLeft = 240
	var txtSize = 23
	for ( var i=0;i<3;i++ ){
		var nodeLoad = cc.Layer.create();
		var nodeW = w;
		var nodeH = heightCenter*0.3
		nodeLoad.setContentSize(nodeW, nodeH);
		nodeLoad.setPositionY( heightCenter - (i+1)*heightCenter*0.33 );
		centerPart.addChild( nodeLoad,0,i );
		
		var headSp = cc.Sprite.create();
		nodeLoad.addChild(headSp,0,0);
		headSp.setPosition(130,nodeH * 0.5);
		
		var txtName = cc.LabelTTF.create("aaa","Arial",txtSize);
		txtName.setColor(cc.color(0,0,0));
		txtName.setAnchorPoint(0,0.5);
		nodeLoad.addChild(txtName,0,1);
		txtName.setPosition(txtLeft,nodeH * 0.8);
		
		var txtSlogan = cc.LabelTTF.create("aaa","Arial",txtSize);
		txtSlogan.setColor(cc.color(0,0,0));
		txtSlogan.setAnchorPoint(0,0.5);
		nodeLoad.addChild(txtSlogan,0,2);
		txtSlogan.setPosition(txtLeft,nodeH * 0.6);
		
		var txtFix = cc.LabelTTF.create("英雄与我如此有缘，来企鹅看我直播吧。","Arial",txtSize);
		txtFix.setColor(cc.color(0,0,0));
		txtFix.setAnchorPoint(0,0.5);
		nodeLoad.addChild(txtFix,0,3);
		txtFix.setPosition(txtLeft,nodeH * 0.4);
		
		var txtURL = cc.LabelTTF.create("aaa","Arial",txtSize);
		txtURL.setColor(cc.color(0,0,0));
		txtURL.setAnchorPoint(0,0.5);
		nodeLoad.addChild(txtURL,0,4);
		txtURL.setPosition(txtLeft,nodeH * 0.2);
		
	}
	
	obj.curPage = 0;
	obj.gotoPage = function( idxPage ){
		obj.curPage = idxPage;
		var maxPage = Math.ceil(g_GainNvshen.length/3)
		var strPage = "" + (obj.curPage+1) + "/" + maxPage;
		obj.ttf_page.setString(strPage);
		obj.ttf_page.runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1.0)));
		
		for( var i=0;i<3;i++ ){
			var nodeLoad = centerPart.getChildByTag(i);
			var idx = obj.curPage * 3 + i;
			if ( idx < g_GainNvshen.length ){
				nodeLoad.setVisible(true);
				var nvshenIdx = g_GainNvshen[idx];
				var nvshenInfo = g_AllNvshen[nvshenIdx];
				
				var headSp = nodeLoad.getChildByTag(0);
				var txtName = nodeLoad.getChildByTag(1);
				var txtSlogan = nodeLoad.getChildByTag(2);
				var txtURL = nodeLoad.getChildByTag(4);
				
				var sf = cc.spriteFrameCache.getSpriteFrame(nvshenInfo.pic);
				headSp.setSpriteFrame(sf);
				
				txtName.setString(nvshenInfo.title + "：" + nvshenInfo.name);
				txtSlogan.setString(nvshenInfo.slogan);
				txtURL.setString("企鹅直播间号："+ nvshenInfo.url);
				
			}else{
				nodeLoad.setVisible(false);
			}
		}
	}
	
	obj.gotoPage(0);
	//onBridgeReady()
	
	return obj;
}

uiman.ShowHelpUI = function(){
	var obj = {
		
	};
	
	obj.uinode = cc.LayerColor.create(cc.color(128,128,128,128))
	var w = g_SafeWidth;
	var h = g_SafeHeight;
	obj.uinode.setContentSize(w,h);
	
	var btn_home = glb_GenSpriteFrameButtonEx("btn_home_1.png","btn_home_2.png","",function(){
		console.log("lobby");
		uiman.ShowUI(UI_LOBBY);
	});
	obj.uinode.addChild(btn_home);
	btn_home.setPosition(50,h-50);
	
	var btn_start = glb_GenSpriteFrameButtonEx("btn_start_1.png","btn_start_2.png","",function(){
		uiman.CloseUI();
		logic.start();
	});
	obj.uinode.addChild(btn_start);
	btn_start.setPosition(w*0.5,h*0.1);
	
	var btn_next = glb_GenSpriteFrameButtonEx("btn_helpnext_1.png","btn_helpnext_2.png","",function(){
		obj.NextPage();
	});
	obj.uinode.addChild(btn_next);
	btn_next.setPosition(w*0.5 + 260, h*0.5-200);
	
	obj.CurPage = 0;
	obj.PicHolder = cc.Node.create()
	obj.uinode.addChild(obj.PicHolder);
	obj.PicHolder.setPosition(w*0.5, h*0.5);
	

	obj.NextPage = function(){
		obj.CurPage++;
		if ( obj.CurPage > 3 )
			obj.CurPage = 1;
		
		var picFile = "images/help" + obj.CurPage + ".png";
		obj.PicHolder.removeAllChildren(true);
		
		var pic = cc.Sprite.create(picFile);
		obj.PicHolder.addChild(pic);
	}
	obj.NextPage();
	return obj;
}

/////////////////////////////////////////
uiman.ShowUI = function( uitype ){
	
	this.CloseUI()
	
	console.log( "show ui " + uitype )
	if ( uitype == UI_LOBBY ){
		mCurUI = this.ShowUILobby();
	}else if( uitype == UI_RESULT ){
		mCurUI = this.ShowUIResult();
	}else if( uitype == UI_HELP ){
		mCurUI = this.ShowHelpUI();
	}
	
	if( mCurUI !== null ){
		g_GameRoot.addChild(mCurUI.uinode,999);
		
		/*
		var uisize = mCurUI.uinode.getContentSize()
		mCurUI.uinode.setPosition((g_SafeWidth-uisize.width)*0.5, (g_SafeHeight-uisize.height)*0.5)
		mCurUI.uinode.setScale(0.5)
		var seq = cc.sequence( cc.scaleTo(0.1,1.1), cc.scaleTo(0.2,1.0) )
		mCurUI.uinode.runAction(seq)
		*/
	}else{
		console.log("not create " + uitype);
	}
}

///////////////////////////////////////
uiman.CloseUI = function( uitype ){
	if( mCurUI !== null ){
		mCurUI.uinode.removeFromParent(true);
	}
}

//////////////////////////////////////////////