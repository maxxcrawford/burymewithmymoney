(function(window, document){

function createCanvas(id, width, height, parent) {
  var canvas = document.createElement("canvas");
  canvas.id = id;
  canvas.width = width;
  canvas.height = height;

  parent.appendChild(canvas);

  return canvas;
}

function clearContext(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  return ctx;
}

function drawSprite(ctx, frame, x, y, scale) {
  x = x || 0;
  y = y || 0;
  scale = scale || 1;
  ctx.drawImage(sprite, frame[0], frame[1], frame[2], frame[3], x + frame[4], y + frame[5], frame[2] * scale, frame[3] * scale);

  return ctx;
}

var Actor = function(canvas, frames, updateFunction) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  this.frames = frames;
  this.x = 0;
  this.y = 0;
  this.width = canvas.width;
  this.height = canvas.height;
  
  this.setScale(1);
  
  this.reset(updateFunction);
};

Actor.prototype.setScale = function(scale) {
  if (this.scale == scale) {
    return;
  }

  this.scale = scale;
  
  this.canvas.width = this.width * scale;
  this.canvas.height = this.height * scale;

  this.ctx.mozImageSmoothingEnabled = false;
  this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.msImageSmoothingEnabled = false;
  this.ctx.imageSmoothingEnabled = false;
};

Actor.prototype.reset = function(updateFunction) {
  this.frame = 0;
  this.speed = 0;
  this.setUpdate(updateFunction);
  this.draw();
}

Actor.prototype.draw = function() {
  if (this.lastFrame != this.frame) {
  	drawSprite(clearContext(this.ctx), this.frames[this.frame], 0, 0, this.scale);
  }
  this.lastFrame = this.frame;
  
  this.canvas.style.left = this.x;
  this.canvas.style.bottom = this.y;
};

Actor.prototype.update = function() {
  this.wait++;
  if (this.updateFunction) {
    this.updateFunction();
  }
}

Actor.prototype.setUpdate = function(updateFunction) {
  this.wait = 0;
  this.updateFunction = updateFunction;
};


function fall() {
  this.y -= this.speed;

  if (this.wait % 10 == 0) {
    this.speed++;  
  }

  this.frame = 0 + Math.min(4, Math.floor(this.wait / 5));

  if (this.y < ground) {
    this.y = ground;
    this.frame = 5;
    this.speed = -2;
    this.setUpdate(bounce);
  }
}

function bounce() {
  this.y -= this.speed;
      
  if (this.wait % 10 == 0) {
    this.speed++;  
  }
  
  if (this.y < ground) {
    this.y = ground;
    this.frame = 6;
    this.setUpdate(sleeping);
  }
}

function sleeping() {
  if (this.wait > 20) {
  	audio.muted = false;
  	try {
  	  audio.play();
      audio.currentTime = 0;
    } catch(e){}
    this.setUpdate(talking);
    text.setUpdate(textShow);
    bigText.setUpdate(textShow);
  }
}

function talking() {
  if (this.wait % 10 == 0) {
    this.frame = (this.frame == 7 ? 8 : 7);
  }
  
  if (this.wait > 160) {
    this.frame = 6;
    this.setUpdate(dead);
  }
}

function dead() {
  if (this.wait > 200 + Math.random() * Math.random() * 200) {
    stamp();
    reset();
  }
}

function moneyFall() {
  this.y -= this.speed;

  if (this.wait % 10 == 0) {
    this.speed++;  
  }

  if (this.y < ground - 4) {
    this.y = ground - 4;  
    this.setUpdate(moneyOpen);
  }
}

function moneyOpen() {
  this.frame = Math.min(3, Math.floor(this.wait / 8));
}

function textHide() {
  this.frame = 0;
}

function textShow() {
  this.wait++;
  switch (this.wait) {
    case 20:
      this.frame = 1;
      break;
    case 80:
      this.frame = 2;
      break;
    case 120:
      this.frame = 3;
      break;
    case 130:
      this.frame = 4;
      break;
    case 240:
      this.frame = 5;
      break;
    case 440:
      this.frame = 0;
      break;
  }
}

function reset() {
  ground = Math.floor(Math.random() * 56);

  simon.x = Math.floor(Math.random() * document.body.clientWidth);
  simon.y = document.body.clientHeight;
  simon.reset(fall);

  money.x = simon.x + Math.floor(Math.random() * 56);
  money.y = simon.y;
  money.reset(moneyFall);

  text.x = Math.max(15, Math.min(simon.x - 57, document.body.clientWidth - 185));
  text.y = 15;
  text.reset(textHide);

  bigText.reset(textHide);
}

function stamp() {
  drawSprite(graveyard, money.frames[money.frame], money.x, graveyard.canvas.height - money.y - money.height);
  drawSprite(graveyard, simon.frames[simon.frame], simon.x, graveyard.canvas.height - simon.y - simon.height);
}

function update() {
  var width = document.body.clientWidth - simon.canvas.width;
  var height = document.body.clientHeight - simon.canvas.height;
  if ((simon.updateFunction == fall || simon.updateFunction == bounce) && simon.x > width) {
    simon.x = Math.max(0, width)
  }
  if (simon.y > height) {
    simon.y = height;
  }
  simon.update();
  simon.draw();

  width = document.body.clientWidth - money.canvas.width;
  height = document.body.clientHeight - money.canvas.height;
  if (money.updateFunction == moneyFall &&  money.x > width) {
    money.x = Math.max(0, width);
  }
  if (money.y > height) {
    money.y = height;
  }
  money.update();
  money.draw();

  width = document.body.clientWidth

  text.x = Math.max(15, Math.min(simon.x - 57, width - 185));
  text.update();
  text.draw();

  bigText.x = Math.floor((width - 181 * bigText.scale)/2 + 5 * bigText.scale);
  bigText.y = Math.floor((document.body.clientHeight - 16 * bigText.scale)/2);
  bigText.update();
  bigText.draw();
}

function scaleText() {
  bigText.setScale(Math.max(1, document.body.clientWidth /  181));
}

function animationFrame(time) {
  if (time) {
    if (!previous) {
      previous = time;
    }
    var delta = time - previous;
    if (delta > rate * 2) {
      delta = rate;
    }
    timer += delta;
    previous = time;
    while (timer >= rate) {
      update();
      timer -= rate;
    }
  }
  window.requestAnimationFrame(animationFrame);
};

var userAgent = navigator.userAgent || navigator.vendor || window.opera;
var mobile = userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) || userAgent.match(/Android/i);

var audio = document.createElement("audio");
audio.src = "audio/burymewithmymoney.mp3";
audio.preload = "auto";
audio.muted = true;

audio.onended = function() {
    audio.muted = true;
};

var root = document.getElementById("burymewithmymoney");

// if (mobile) {
  var touch = document.createElement("div");
  touch.id = "touch";
  touch.appendChild(document.createTextNode("Touch anywhere for sound."));
  root.appendChild(touch);
  var clearTouch = function() {
    audio.play();
    root.onclick = null;
    root.touchstart = null;
    root.touchend = null;
    root.gesturestart = null;
    root.gestureend = null;
    root.removeChild(touch);
  };
  root.onclick = clearTouch;
  root.touchstart = clearTouch;
  root.touchend = clearTouch;
  root.gesturestart = clearTouch;
  root.gestureend = clearTouch;
// }

var sprite = document.createElement("img");
sprite.src = "images/burymewithmymoney.png";

var simonFrames = [[1, 1, 45, 56, 1, 0],[47, 1, 39, 53, 1, 3],[87, 1, 32, 35, 4, 21],[120, 1, 28, 32, 6, 24],[149, 1, 28, 50, 6, 6],[178, 1, 46, 31, 0, 20],[225, 1, 47, 36, 0, 20],[273, 1, 47, 38, 0, 18],[321, 1, 47, 38, 0, 18]];
var moneyFrames = [[369, 1, 12, 15, 8, 1],[382, 1, 16, 16, 8, 0],[399, 1, 30, 14, 1, 2],[430, 1, 32, 8, 0, 8]];
var textFrames = [[0, 0, 1, 1, 0, 0],[178, 41, 31, 15, 0, 0],[178, 41, 55, 15, 0, 0],[178, 41, 95, 15, 0, 0],[178, 41, 119, 15, 0, 0],[178, 41, 171, 15, 0, 0]];

var previous = null;
var timer = 0;
var rate = 1000 / 60;

var ground = 0;

var bigText = new Actor(createCanvas("bigText", 171, 15, root), textFrames);

var wrap = document.createElement("div");
wrap.id = "graveyardContainer";
root.appendChild(wrap);

var clientMax = Math.max(document.body.clientWidth, document.body.clientHeight);
var graveyard = createCanvas("graveyard", mobile ? clientMax : Math.max(2048, clientMax), 128, wrap).getContext("2d");

var money = new Actor(createCanvas("money", 32, 16, root), moneyFrames);
var simon = new Actor(createCanvas("simon", 47, 56, root), simonFrames);
var text = new Actor(createCanvas("text", 171, 15, root), textFrames);

reset();
animationFrame();

scaleText();
setInterval(scaleText, 250);

})(window, document);