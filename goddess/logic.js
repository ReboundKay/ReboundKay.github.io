
var logic = logic || {};
var g_NodeBG = null;
var g_ClippingNode = null;
var g_NodeFront = null;
var g_FootHeight = 0.0;
var g_HoleBottom = 0.0;
var g_Role = null;

var g_CurBox = null;
var g_CurHoleScale = 1
var g_CurNvShenIdx = -1

var g_bNewRecord = false;
var g_TotalScoreBest = 0
var g_TotalScore = 0
var g_StartX = 160


var RESULT_FAIL_HIT_WALL = -1 // 撞上
var RESULT_FAIL_IN_HOLE= -2 // 掉进沟里
var RESULT_INVALID = 0 // default value
var RESULT_SUCC_NARROW = 1 // 磕磕绊绊能过
var RESULT_SUCC_GOOD = 2 // 几乎平坦
var RESULT_SUCC_PERFECT = 3 // 完美通过！

var g_ResultThisRound = RESULT_INVALID

var LOGIC_STEP_READY = 0;
var LOGIC_STEP_TOUCHBEGAN = 1;
var LOGIC_STEP_TOUCHENDED = 2;
var g_CurStep = LOGIC_STEP_READY;

var g_RightTopTxt = null;

var GAP_DIST_NARROW = 20
var GAP_DIST_GOOD = 10
var GAP_DIST_PERFECT = 5

var temp_Stencil_x = 0

/////////////////////////////////////////////////////////////////////////////
// 配置女神信息开始
function NvshenInfo(_name, _title, _url, _pic, _slogan) {
	this.name = _name;
	this.title = _title;
	this.slogan = _slogan;
	this.url = _url;
	this.pic = _pic;
}
var g_AllNvshen = new Array() // 所有配置的女神信息
g_AllNvshen.push(new NvshenInfo("小九九","紫霞仙子","10002726","fk1.jpg","我的盖世英雄在哪里？"));
g_AllNvshen.push(new NvshenInfo("FY久儿","暖心女神","10002661","fk2.jpg","始于心动，终于白首，拥之则安，伴之则暖。"));
g_AllNvshen.push(new NvshenInfo("菲宝","健身达人","10002669","fk3.jpg","优于过去的生活才是人生。"));
g_AllNvshen.push(new NvshenInfo("小满月","童颜女神","10002618","fk4.jpg","童颜巨乳什么的最讨厌了！"));
g_AllNvshen.push(new NvshenInfo("小苹果er","热辣女神","10002615","fk5.jpg","点亮你生命的火火火火火火！"));
g_AllNvshen.push(new NvshenInfo("叶小翻车鱼","百变女神","10002824","fk6.jpg","今天又有多少妹子想嫁给我？"));
g_AllNvshen.push(new NvshenInfo("周纣纣","励志女神","10002658","fk7.jpg","生活就是战斗。"));
g_AllNvshen.push(new NvshenInfo("天山童姥徐静蕾","全能女神","10002671","fk8.jpg","荣耀之前必有谦卑。"));
g_AllNvshen.push(new NvshenInfo("爱宣真是太好了","游戏女神","10002679","fk9.jpg","和我玩个游戏怎么样？"));
g_AllNvshen.push(new NvshenInfo("汐CC","微笑女神","10002899","fk10.jpg","越努力，越幸运。"));
g_AllNvshen.push(new NvshenInfo("Xiaonini","音乐女神","10002745","fk11.jpg","我把我唱给你听。"));
g_AllNvshen.push(new NvshenInfo("乔家小乔","吉隆坡女神","10002831","fk12.jpg","我在吉隆坡等你。"));
g_AllNvshen.push(new NvshenInfo("扇子","二次元女神","10002876","fk13.jpg","超能力少女。"));
g_AllNvshen.push(new NvshenInfo("萌萌的包子妹妹","篮球女神","10002667","fk14.jpg","一起看篮球怎么样？"));
g_AllNvshen.push(new NvshenInfo("姜得得","嗲音女神","10002813","fk15.jpg","老司机开车污污污。"));
g_AllNvshen.push(new NvshenInfo("欧阳仙仙","超人气女神","10002749","fk16.jpg","一颗行走的春药。"));
g_AllNvshen.push(new NvshenInfo("东城悯","彩虹女神","10002987","fk17.jpg","斯人若彩虹，遇上方知有。"));


var g_GainNvshen = new Array(); // 已获得的女神



// 配置女神信息结束
/////////////////////////////////////////////////////////////////////////////////

logic.RandomHoleSize = function(){
	g_CurHoleScale = 0.6+ Math.random()*0.4;
}

logic.Transition = function(){
	
	var origSize = g_CurBox.getContentSize()
	
	var sameTime = 0.5
	
	var distHori = g_StartX-g_Role.getPositionX()
	var horiMove = cc.p(distHori,0)
	g_Role.runAction(cc.moveBy(sameTime,horiMove));
	
	var speedSten = Math.abs(distHori)/sameTime
	var outScreenX = -(origSize.width*0.5*g_CurHoleScale)
	var distOutScreen = g_SafeWidth * 0.5 - outScreenX 
	var t1 = distOutScreen/speedSten
	
	this.RandomHoleSize();
	
	var t2 = sameTime-t1
	var distRight = t2*speedSten
	var newStenX = g_SafeWidth*0.5 + distRight
	
	console.log("distRight " + distRight + " " + newStenX)
	temp_Stencil_x = newStenX
	var stenSeq = cc.sequence(
		cc.moveBy(t1,cc.p(-distOutScreen,0)),
		cc.callFunc(logic.ResetStencilPosAndSize ),
		cc.moveBy(t2,cc.p(-distRight, 0)),
		cc.callFunc(logic.NewRound)
	)
	
	
	var stencil = g_ClippingNode.getStencil()
	stencil.runAction(stenSeq);
	
	g_CurBox.runAction(cc.sequence(
		cc.moveBy(sameTime,horiMove),
		cc.removeSelf()
	))
	g_CurBox = null;
	
}

logic.ShowFailedUI = function(){
	
	g_RootLayer.removeAllChildren(true);
	
	uiman.ShowUI(UI_RESULT)
}


logic.ResetStencilPosAndSize = function(){
	
	console.log("invoked");
	
	var stencil = g_ClippingNode.getStencil();
	stencil.setScale(g_CurHoleScale);
	var stenSize = stencil.getContentSize()
	stencil.setPositionY( g_FootHeight - stenSize.height*g_CurHoleScale*0.5 )
	stencil.setPositionX(temp_Stencil_x)
	
	console.log("stencil x is set to " + temp_Stencil_x)
	
	g_HoleBottom = g_FootHeight - stenSize.height*g_CurHoleScale;
}
	

logic.NewRound = function(){
	
	console.log("new round invoked");
	
	// 重置跟round相关的所有变量
	g_CurNvShenIdx = (0 | Math.random() * g_AllNvshen.length);
	var nvshen = g_AllNvshen[g_CurNvShenIdx];
	console.log(nvshen.name, nvshen.pic);
	
	var strPng = nvshen.pic;
	var sf_Box = cc.spriteFrameCache.getSpriteFrame(strPng);
	g_CurBox = cc.Sprite.createWithSpriteFrame(sf_Box);
	
	g_NodeFront.addChild(g_CurBox,2);
	g_CurBox.setScale(g_CurHoleScale * 0.5);
	
	g_CurBox.setPosition(g_SafeWidth*0.5,g_SafeHeight * 0.5);
	
	g_ResultThisRound = RESULT_INVALID
	g_CurStep = LOGIC_STEP_READY;
	logic.UpdateScoreLabel();
}

function checknull( obj, keyword ){
	if( obj == null ){
		console.log(keyword + " is null");
	}
}

logic.UpdateScoreLabel = function(){
	var s = "" + g_TotalScore
	g_RightTopTxt.setString(s);
	
	var seq = cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1.0));
	g_RightTopTxt.runAction( seq )
}

logic.PlayEndOfThisRound = function(){
	
//window.alert("call");
	
	var _func_fall_forward = function(){
		g_Role.runAction(cc.rotateTo(0.1,90));
	};
	var _func_fall_back = function(){
		g_Role.runAction(cc.rotateTo(0.1,-90));
	}
	var _func_shake = function(){
		var seq = cc.sequence(
			cc.moveBy(0.05,cc.p(5,5)),
			cc.moveBy(0.05,cc.p(-5,-5))
		);
		
		g_RootLayer.runAction(seq);
	};
	
	var origSize = g_CurBox.getContentSize()
	var curS = g_CurBox.getScale()
	// 后续的步骤
	var startx = g_Role.getPositionX();
	var gapLeft = g_CurBox.getPositionX() - (origSize.width*curS*0.5);
	var starty = g_Role.getPositionY();
	if ( g_ResultThisRound > 0 ){
		var cb = cc.callFunc(logic.Transition,logic)
		var startx = g_Role.getPositionX()
		var gapLeft = g_CurBox.getPositionX() - (origSize.width*curS*0.5)
		var gapRight = g_CurBox.getPositionX() + (origSize.width*curS*0.5)
		var targetx = g_SafeWidth
		
		var lowery = g_CurBox.getPositionY() + (origSize.height*curS*0.5)
	
		var walkTime = 2.0
		var allDist = targetx - startx
		var t1 = walkTime * (gapLeft-startx)/allDist
		var t2 = walkTime * (gapRight-gapLeft)/allDist
		var t3 = walkTime - t1 - t2
		
		var seq = cc.sequence(
			cc.moveTo(t1,cc.p(gapLeft,starty)),
			cc.place(cc.p(gapLeft,lowery)),
			cc.moveTo(t2,cc.p(gapRight,lowery)),
			cc.place(cc.p(gapRight,starty)),
			cc.moveTo(t3,cc.p(targetx,starty)),
			cb
		)
		g_Role.runAction(seq);
		
		
	}else if( g_ResultThisRound == RESULT_FAIL_HIT_WALL ){
		var seq = cc.sequence(
			cc.moveTo(0.5,cc.p(gapLeft,starty)),
			cc.callFunc(_func_shake),
			cc.callFunc(_func_fall_back),
			cc.delayTime(1.0),
			cc.callFunc(logic.ShowFailedUI)
		)
		g_Role.runAction(seq);
	}else if( g_ResultThisRound == RESULT_FAIL_IN_HOLE ){
		var seq = cc.sequence(
			cc.moveTo(0.5,cc.p(gapLeft,starty)),
			cc.moveTo(0.2,cc.p(gapLeft,g_HoleBottom)),
			cc.callFunc(_func_shake),
			cc.callFunc(_func_fall_forward),
			cc.delayTime(1.0),
			cc.callFunc(logic.ShowFailedUI)
		)
		g_Role.runAction(seq);
	}
}

logic.start = function(){
	cc.log("logic.start")
	
	g_bNewRecord = false;
	g_TotalScore = 0;
	g_GainNvshen.splice(0,g_GainNvshen.length);
	
	g_NodeBG = cc.Node.create();//cc.SpriteBatchNode.create('images/sheet1.png');
	g_RootLayer.addChild(g_NodeBG,1)
	g_NodeFront = cc.Node.create();
	g_RootLayer.addChild(g_NodeFront,3);
	
	//g_RightTopTxt
	g_RightTopTxt = cc.LabelTTF.create("0","Arial", 40);
	g_RootLayer.addChild(g_RightTopTxt,99);
	g_RightTopTxt.setPosition(600,800);
	
	console.log("stencil");
	
	// stencil 
	var sf_stencil = cc.spriteFrameCache.getSpriteFrame("fk1.jpg");
	checknull(sf_stencil,"sf_stencil")
	var stencil = cc.Sprite.createWithSpriteFrame(sf_stencil);
	checknull(stencil,"stencil")
	
	g_ClippingNode = cc.ClippingNode.create(stencil)
	stencil.setPositionX(g_SafeWidth * 0.5);
	g_RootLayer.addChild(g_ClippingNode,2);
	g_ClippingNode.setInverted(true);
	
	console.log("ground");
	var sf_ground = cc.spriteFrameCache.getSpriteFrame("ground.png");
	checknull(sf_ground,"sf_ground")
	var ground = cc.Sprite.createWithSpriteFrame(sf_ground);
	checknull(ground,"ground")
	
	ground.setAnchorPoint(0,0);
	ground.setPosition(0,0);
	g_ClippingNode.addChild(ground);
	
	g_FootHeight = ground.getContentSize().height
	var sf_role = cc.spriteFrameCache.getSpriteFrame("role.png");
	g_Role = cc.Sprite.createWithSpriteFrame(sf_role);
	g_Role.setAnchorPoint(0.5,0.0);
	g_Role.setScale(0.8);
	g_Role.setPosition(g_StartX,g_FootHeight);
	g_NodeFront.addChild(g_Role,3);
	
	
	var layerHandleTouch = cc.Layer.create();
	g_RootLayer.addChild(layerHandleTouch);
	var listener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,                       // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞没
			onTouchBegan: function (touch, event) {     //实现 onTouchBegan 事件回调函数
				console.log("touchbegin");
				if (g_CurStep == LOGIC_STEP_READY){
					g_CurBox.runAction(cc.scaleTo(2,1.5));
					g_CurStep = LOGIC_STEP_TOUCHBEGAN;
				}
					
				
				return true;
			},
			onTouchMoved: function (touch, event) {         // 触摸移动时触发
			},
			onTouchEnded: function (touch, event) {         // 点击事件结束处理
				var target = event.getCurrentTarget();
				console.log("touchend");
				
				if ( g_CurStep == LOGIC_STEP_TOUCHBEGAN){
					g_CurBox.stopAllActions();
					
					var curS = g_CurBox.getScale();
					var origSize = g_CurBox.getContentSize();
					
					var result_gap = origSize.width * (g_CurHoleScale-curS);
					if ( result_gap < 0 ){
						g_ResultThisRound = RESULT_FAIL_HIT_WALL;
					}else{
						if ( result_gap > GAP_DIST_NARROW )
							g_ResultThisRound = RESULT_FAIL_IN_HOLE;
						else if( result_gap > GAP_DIST_GOOD )
							g_ResultThisRound = RESULT_SUCC_NARROW;
						else if( result_gap > GAP_DIST_PERFECT )
							g_ResultThisRound = RESULT_SUCC_GOOD;
						else
							g_ResultThisRound = RESULT_SUCC_PERFECT;
					}
					
					console.log( "gap: " + result_gap );
					console.log( "result: " + g_ResultThisRound );
					
					if ( g_ResultThisRound > 0 ){
						
						var bAlready = false;
						for ( var iAlready=0;iAlready<g_GainNvshen.length;iAlready++ ){
							if ( g_GainNvshen[iAlready] == g_CurNvShenIdx ){
								bAlready = true;
								break;
							}
						}
						if( bAlready == false )
							g_GainNvshen.push(g_CurNvShenIdx);
						
						g_TotalScore += g_ResultThisRound;
						
						if ( g_TotalScore > g_TotalScoreBest ){
							g_TotalScoreBest = g_TotalScore; // 记录最佳分数
						}
					}
					
					var targetBoxY = 0
					if (g_CurHoleScale < curS){ // 架在半空中国
						targetBoxY = g_FootHeight + origSize.height * curS * 0.5
					}else{
						targetBoxY = g_HoleBottom + origSize.height * curS * 0.5
					}
					
					var cbRoleBehave = cc.callFunc(logic.PlayEndOfThisRound)
					var targetPos = cc.p(g_SafeWidth * 0.5,targetBoxY)
					var seq = cc.sequence(cc.jumpTo(0.5,targetPos,100,1),cc.jumpTo(0.1,targetPos,10,1),cbRoleBehave)
					g_CurBox.runAction(seq);
					
					g_CurStep = LOGIC_STEP_TOUCHENDED;
				}
			}
		});
	cc.eventManager.addListener( listener, layerHandleTouch );
	
	// 随机洞口大小
	this.RandomHoleSize();
	temp_Stencil_x = g_SafeWidth*0.5
	this.ResetStencilPosAndSize( );
	this.NewRound();

	
	var menu = uiman.ShowInGame();
	g_RootLayer.addChild(menu.uinode,9999,0);
	menu.Hide();
}