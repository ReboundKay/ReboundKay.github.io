function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  function drawColorSquare(canvas, color, imageObj) {
    var colorSquareSize = 32;
    var padding = 5;
    var context = canvas.getContext('2d');
    var squareX = (canvas.width - colorSquareSize + 200) / 2;
    var squareY = (canvas.height - colorSquareSize) / 2;

    context.beginPath();
    context.fillStyle = color;
    context.fillRect(squareX, squareY, colorSquareSize, colorSquareSize);
    context.strokeRect(squareX, squareY, colorSquareSize, colorSquareSize);
  }
  
  function UpdateLuminToUI( tagName ){
	  var sliderCtrl = document.getElementById("sld_" + tagName)
	  var val_l = document.getElementById('val_l_' + tagName)
	  
	  val_l.value = sliderCtrl.value
  }
	function UpdateRGBFromPickerToTxt( tagName, r,g,b ){
		var val_r = document.getElementById('val_r_' + tagName)
		var val_g = document.getElementById('val_g_' + tagName)
		var val_b = document.getElementById('val_b_' + tagName)
		val_r.value = r;
		val_g.value = g;
		val_b.value = b;
  }
  
  function init(imageObj, tagName, colorCallback) {
	 var canvasName = 'canvas_' + tagName
	 
    var padding = 5;
    var canvas = document.getElementById(canvasName);
    var context = canvas.getContext('2d');
    var mouseDown = false;

    context.strokeStyle = '#444';
    context.lineWidth = 1;

	// 滑块的事件处理
	var sliderName = "sld_" + tagName;
	var sliderCtrl = document.getElementById(sliderName)
	sliderCtrl.onchange = sliderCtrl.oninput = function(){
		UpdateLuminToUI(tagName)
		colorCallback();
	}
	
	var func_onChange = function(mousePos){
		var color = undefined;
		if(mouseDown && mousePos !== null && mousePos.x > padding && mousePos.x < padding + imageObj.width && mousePos.y > padding && mousePos.y < padding + imageObj.height) {
        // color picker image is 256x256 and is offset by 10px
        // from top and bottom
        var imageData = context.getImageData(padding, padding, imageObj.width, imageObj.width);
        var data = imageData.data;
        var x = mousePos.x - padding;
        var y = mousePos.y - padding;
        var red = data[((imageObj.width * y) + x) * 4];
        var green = data[((imageObj.width * y) + x) * 4 + 1];
        var blue = data[((imageObj.width * y) + x) * 4 + 2];
        var color = 'rgb(' + red + ',' + green + ',' + blue + ')';
        drawColorSquare(canvas, color, imageObj);

		colorCallback();
		UpdateRGBFromPickerToTxt(tagName,red,green,blue);
      }
	};
	
    canvas.addEventListener('mousedown', function(evt) {
      mouseDown = true;
	  var mousePos = getMousePos(canvas, evt);
      func_onChange(mousePos);
    }, false);

    canvas.addEventListener('mouseup', function(evt) {
      mouseDown = false;
    }, false);

    canvas.addEventListener('mousemove', function(evt) {
      var mousePos = getMousePos(canvas, evt);
      func_onChange(mousePos);
    }, false);
	
    context.drawImage(imageObj, padding, padding,200,200);
    drawColorSquare(canvas, 'white', imageObj);
	
	
	// 按钮处理
	var btnRecName = "btnRec_" + tagName
	var btnRec = document.getElementById(btnRecName)
	btnRec.onclick = function(){
		setValueToPicker( tagName, 1.0,1.0,1.0,1.0 );
		drawColorSquare(canvas, 'white', imageObj);
		colorCallback()
	};
  }

  function CreatePickerManually( preText, tagName, colorCallback ){

  	var canavsName = "canvas_" + tagName;
  	var sliderName = "sld_" + tagName;
  	var editNameR = "val_r_" + tagName;
  	var editNameG = "val_g_" + tagName;
  	var editNameB = "val_b_" + tagName;
	var editNameL = "val_l_" + tagName;
	var btnName = "btnRec_" + tagName;

  	var strHTML = "<hr>";
  	strHTML += '<canvas id="' + canavsName + '" width=250 height=200></canvas>';
  	strHTML += "<br>";
  	strHTML += '<input id="' + sliderName + '" type="range" value=1.0 min=0.0 max=2.0 step=0.05 onchange="onSliderChange()"></input><br>';
  	strHTML += preText + '<input id="' + editNameR + '" type="edit" ></input>'
	strHTML += '<input id="' + editNameG + '" type="edit" ></input>'
	strHTML += '<input id="' + editNameB + '" type="edit" ></input>'
	strHTML += '<input id="' + editNameL + '" type="edit" ></input>'
	strHTML += '<button id="' + btnName + '" type="button">恢复默认</button>'
	strHTML += '<br>'
	
  	document.write(strHTML);
	var imageObj = new Image();
 	imageObj.onload = function(){
 		init(this,tagName, colorCallback);
 	}
 	imageObj.src = 'color-picker.png';
	
	UpdateRGBFromPickerToTxt(tagName,255,255,255)
	UpdateLuminToUI(tagName)

  }
  
  function setValueToPicker( tagName, r,g,b,a ){
	var editNameR = "val_r_" + tagName;
	var editNameG = "val_g_" + tagName;
	var editNameB = "val_b_" + tagName;
	var editNameL = "val_l_" + tagName;
	document.getElementById(editNameR).value = parseInt(r*255);
	document.getElementById(editNameG).value = parseInt(g*255);
	document.getElementById(editNameB).value = parseInt(b*255);
	document.getElementById(editNameL).value = parseFloat(a);
	
	var sld = "sld_" + tagName;
	document.getElementById(sld).value = parseFloat(a);
  }
  
 function initPickerByCanvas( canvasName, colorCallback ){
 	var imageObj = new Image();
 	imageObj.onload = function(){
 		init(this,canvasName, colorCallback);
 	}
 	imageObj.src = 'color-picker.png';//'http://www.html5canvastutorials.com/demos/assets/color-picker.png';
 }