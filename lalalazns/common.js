function glb_WorldPtInNode( node, ptWorld ){
	if ( node == null || node == undefined )
		return false;
	// 获取当前点击点所在相对按钮的位置坐标
	var locationInNode = node.convertToNodeSpace(ptWorld)
	var s = node.getContentSize()
	var rect = cc.rect(0, 0, s.width, s.height);
	if (cc.rectContainsPoint(rect, locationInNode)) {       // 点击范围判断检测
		return true;
	}
	
	return false;
}

function glb_ShakeVert( node ){
	var up = cc.moveBy(0.05,0,5);
	var down = cc.moveBy(0.1,0,-10);
	var up2 = cc.moveBy(0.05,0,5);
	node.runAction(cc.repeat(cc.sequence(up,down,up2),3));
}
function glb_ShakeHori( node ){
	
}
function glb_ShakeRandom( node ){
	
}

function glb_AddButtonClickEvent( node, func_cb ){
	var listener = cc.EventListener.create({
		
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: true,
		onTouchBegan: function (touch, event) {
			console.log("button  touchbegin");
			var bIn = glb_WorldPtInNode(node,touch.getLocation());
			if ( bIn == true ){
				node.mCustomPic1.setVisible(false);
				node.mCustomPic2.setVisible(true);
				return true
			}
			return false;
		},
		onTouchMoved: function (touch, event) {
		},
		onTouchEnded: function (touch, event) {
			console.log("button touchend");
			node.mCustomPic1.setVisible(true);
			node.mCustomPic2.setVisible(false);
			var bIn = glb_WorldPtInNode(node,touch.getLocation());
			if ( bIn == true ){
				func_cb(node)
			}
		}
	});
	cc.eventManager.addListener( listener, node );
}
function glb_SetRadioState( node, enable ){
	console.log(enable);
	node.mCustomPic1.setVisible(enable);
	node.mCustomPic2.setVisible(!enable);
}
function glb_AddRadioClickEvent( node, func_cb ){
	var listener = cc.EventListener.create({
		
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: true,
		onTouchBegan: function (touch, event) {
			console.log("button  touchbegin");
			var bIn = glb_WorldPtInNode(node,touch.getLocation());
			if ( bIn == true ){
				node.setScale(1.1)
				if( node.mCustomPic1 == undefined ){
					console.log("erroer");
				}
				return true
			}
			return false;
		},
		onTouchMoved: function (touch, event) {
		},
		onTouchEnded: function (touch, event) {
			console.log("button touchend");
			node.setScale(1.0)
			var bIn = glb_WorldPtInNode(node,touch.getLocation());
			if ( bIn == true ){
				glb_SetRadioState(node,!node.mCustomPic1.isVisible())
				
				var enable = node.mCustomPic1.isVisible();
				func_cb(node, enable)
			}
		}
	});
	cc.eventManager.addListener( listener, node );
}

function glb_GenSpriteFrameButtonEx( pic1, pic2, txt, callback, isRadio ){
	
	var sf1 = cc.spriteFrameCache.getSpriteFrame(pic1);
	var sp1 = cc.Sprite.createWithSpriteFrame(sf1);
	
	var sf2 = cc.spriteFrameCache.getSpriteFrame(pic2);
	var sp2 = cc.Sprite.createWithSpriteFrame(sf2);
	
	if( sf2 == null ){
		console.log("sf2 null");
	}
	
	var node = cc.Node.create();
	node.setAnchorPoint(0.5,0.5);
	node.addChild(sp1,0,1000);
	node.addChild(sp2,0,1001);
	
	node.mCustomPic1 = sp1;
	node.mCustomPic2 = sp2;
	
	sp2.setVisible(false);
	
	var sz = sp1.getContentSize();
	node.setContentSize(sz);
	sp1.setPosition(sz.width*0.5, sz.height*0.5)
	sp2.setPosition(sz.width*0.5, sz.height*0.5)
	
	sp1.setVisible(true);
	sp2.setVisible(false);
	
	if( isRadio == true ){
		glb_AddRadioClickEvent( node, callback );
	}else{
		glb_AddButtonClickEvent( node, callback );
	}
	return node;
	
}


function glb_Rain( parent ){
	// 雨
	var size = parent.getContentSize()
	var RainFile = "ccb/ccbResources/rainstring.png";
	var batch = cc.SpriteBatchNode.create(RainFile);
	var offset = 200;
	parent.addChild(batch);
	for ( var i=0; i<100; i++ ){
		
		var sX = -offset + (size.width+offset) * Math.random(); // 起始 X
		var eX = sX + offset + Math.random() * offset; // 目标X
		
		var ps = cc.p(sX,size.height+100);
		var pe = cc.p(eX, size.height*0.5);
		
		var drop = cc.Sprite.create(RainFile);
		
		var angle = cc.pAngle( cc.pSub(pe, ps),cc.p(0,1) );
		drop.setRotation(cc.radiansToDegrees(angle));
		
		drop.setPosition(ps.x, ps.y);
		var wait = Math.random();
		drop.runAction(cc.repeatForever(cc.sequence( cc.delayTime(wait),cc.moveTo(0.5 + Math.random()*0.2, pe),cc.place(ps))));
		
		drop.setScaleY(0.5 + Math.random());
		drop.setScaleX(0.3 + 0.3 * Math.random());
		drop.setOpacity(128);
		
		batch.addChild(drop);
	}
}

function isString(str){ 
	return (typeof str=='string')&&str.constructor==String; 
} 

function createSpriteWithSpriteFrameName( sfName ){
	var sf = cc.spriteFrameCache.getSpriteFrame(sfName);
	var sp = cc.Sprite.createWithSpriteFrame(sf);
	return sp;
}
