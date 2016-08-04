
var logic = logic || {};
var g_NodeBG = null;

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

var g_HeadSize = 0  // 女神头像的标准大小


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
var g_RightTopTxt_Shadow = null;

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

var g_Grounds = [null,null]

// 配置女神信息结束
/////////////////////////////////////////////////////////////////////////////////

logic.RandomHoleSize = function(){
	g_CurHoleScale = 0.7 + Math.random()*0.3;
	g_HoleBottom = g_FootHeight - g_HeadSize*g_CurHoleScale; // 得到洞底的位置
}

logic.Transition = function(){
	
	var origSize = g_CurBox.getContentSize()
	
	var sameTime = 0.5
	
	var distHori = g_StartX-g_Role.getPositionX()
	var horiMove = cc.p(distHori,0)
	g_Role.runAction(cc.moveBy(sameTime,horiMove));
	
	this.RandomHoleSize();
	
	for( var i=0;i<2;i++ )
	{
		var spGround = g_Grounds[i];
		if( spGround.getPositionX() < 10 ){ //本次即将退出的地面
			spGround.runAction(cc.sequence(cc.moveBy(sameTime,cc.p(distHori,0)), cc.place(cc.p(g_SafeWidth,0))))
		}else{ // 下一个地面
			spGround.runAction(cc.sequence(cc.moveBy(sameTime,cc.p(distHori,0)), cc.callFunc(logic.NewRound)))
			this.PrepareHoldScale(i);
		}
	}
	
	g_CurBox.runAction(cc.sequence(cc.moveBy(sameTime,cc.p(distHori,0)), cc.removeSelf()))
	
	g_CurBox = null;
	
}

logic.ShowFailedUI = function(){
	
	g_RootLayer.removeAllChildren(true);
	
	uiman.ShowUI(UI_RESULT)
	
}


logic.PrepareHoldScale = function(groundIdx){
	console.log("invoked");
	
	var ground = g_Grounds[groundIdx];
	
	var left = ground.getChildByTag(0)
	var right = ground.getChildByTag(1)
	var bottom = ground.getChildByTag(2)
	
	
	var  head = ground.getChildByTag(99);
	if ( head != null ){
		head.setScale(g_CurHoleScale);
	}
	
	var w = ground.getContentSize().width
	var h = ground.getContentSize().height
	var randomW = g_HeadSize * g_CurHoleScale;
	
	var leftX = (w-randomW)*0.5;
	var rightX = (w+randomW)*0.5;
	var bottomY = h-randomW;
	
	
	left.setPosition(leftX, h);
	right.setPosition(rightX,h);
	bottom.setPosition(w*0.5,bottomY);
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
	g_RightTopTxt_Shadow.setString(s);
	
	var seq = cc.sequence(cc.scaleTo(0.1,1.2),cc.scaleTo(0.1,1.0));
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
		var targetx = startx + g_SafeWidth
		
		var lowery = g_CurBox.getPositionY() + (origSize.height*curS*0.5)
	
		var walkTime = 1.5
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

function genGound(){
	var groundPic = createSpriteWithSpriteFrameName("ground.png");
	groundPic.setAnchorPoint(0,0);
	
	var spTree = createSpriteWithSpriteFrameName("tree.png");
	spTree.setAnchorPoint(0.5, 0);
	spTree.setPosition(120,130);
	groundPic.addChild(spTree,-6);
	
	var groundLeft = createSpriteWithSpriteFrameName("hole_left.png");
	checknull(groundLeft)
	var groundRight = createSpriteWithSpriteFrameName("hole_right.png");
	checknull(groundRight)
	var groundBottom = createSpriteWithSpriteFrameName("hole_bottom.png");
	checknull(groundBottom)
	
	//groundLeft.setColor(cc.color(255,0,0,90));
	//groundRight.setColor(cc.color(255,0,0,90));
	//groundBottom.setColor(cc.color(255,0,0,90));
	
	groundPic.addChild(groundLeft,-1,0);
	groundPic.addChild(groundRight,-2,1);
	groundPic.addChild(groundBottom,-3,2);
	
	groundLeft.setAnchorPoint(1.0,1.0);
	groundRight.setAnchorPoint(0.0,1.0);
	groundBottom.setAnchorPoint(0.5,1.0);
	
	
	var gsize = groundPic.getContentSize();
	/*
	var head = createSpriteWithSpriteFrameName("fk1.jpg");
	groundPic.addChild(head,0,99)
	head.setAnchorPoint(0.5,1.0)
	head.setOpacity(100);
	head.setPosition(gsize.width*0.5, gsize.height)
	调试，这段用来看实际的范围
	*/ 
	return groundPic
}

logic.start = function(){
	cc.log("logic.start")
	
	g_bNewRecord = false;
	g_TotalScore = 0;
	g_GainNvshen.splice(0,g_GainNvshen.length);
	
	var temp_head_for_size = createSpriteWithSpriteFrameName("fk1.jpg");
	g_HeadSize = temp_head_for_size.getContentSize().width;
	console.log("standard head size is " + g_HeadSize);
	
	
	g_NodeBG = cc.Node.create();//cc.SpriteBatchNode.create('images/sheet2.png');
	
	g_NodeBG.onEnter = function(){
		cc.Node.prototype.onEnter.call(this);
		if(g_Tree!== null)
			g_Tree.setVisible(false);
	};
	g_NodeBG.onExit = function(){
		cc.Node.prototype.onExit.call(this);
		if(g_Tree!== null)
			g_Tree.setVisible(true);
	};
	
	g_RootLayer.addChild(g_NodeBG,1)
	g_NodeFront = cc.Node.create();
	g_RootLayer.addChild(g_NodeFront,3);
	
	//g_RightTopTxt
	g_RightTopTxt = cc.LabelTTF.create("0","Arial", 40);
	g_RootLayer.addChild(g_RightTopTxt,99);
	g_RightTopTxt.setPosition(600,800);
	
	g_RightTopTxt_Shadow = cc.LabelTTF.create("0","Arial", 40);
	g_RightTopTxt.addChild(g_RightTopTxt_Shadow,-1)
	g_RightTopTxt_Shadow.setAnchorPoint(0,0);
	g_RightTopTxt_Shadow.setColor(cc.color(0,0,0));
	g_RightTopTxt_Shadow.setPosition(2,-2);
	
	console.log("ground");
	
	var ground1 = genGound();
	var ground2 = genGound();
	
	g_Grounds[0] = ground1;
	g_Grounds[1] = ground2;
	
	g_NodeBG.addChild(ground1);
	g_NodeBG.addChild(ground2);
	
	ground1.setPosition(0,0);
	ground2.setPosition(ground1.getContentSize().width,0);
	
	g_FootHeight = ground1.getContentSize().height
	var sf_role = cc.spriteFrameCache.getSpriteFrame("role.png");
	g_Role = cc.Sprite.createWithSpriteFrame(sf_role);
	g_Role.setAnchorPoint(0.5,0.0);
	g_Role.setScale(0.6);
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
					g_CurBox.runAction(cc.scaleTo(1,1.5));
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
						
						g_TotalScore += 1; // 改成每次成功加一分 //g_ResultThisRound;
						
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
					var seq = cc.sequence(cc.jumpTo(0.5,targetPos,150,1),cc.jumpTo(0.1,targetPos,10,1),cbRoleBehave)
					g_CurBox.runAction(seq);
					
					g_CurStep = LOGIC_STEP_TOUCHENDED;
				}
			}
		});
	cc.eventManager.addListener( listener, layerHandleTouch );
	
	// 随机洞口大小
	this.RandomHoleSize();
	this.PrepareHoldScale(0);
	this.NewRound();

	
	var menu = uiman.ShowInGame();
	g_RootLayer.addChild(menu.uinode,9999,0);
	menu.Hide();
}