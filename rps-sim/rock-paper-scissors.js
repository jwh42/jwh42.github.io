let _viewW = 0;
let _viewH = 0;
let _canvas = null;
let _context = null;
let _sprites = null;

let _globalSpeed = 0.5;
const _maxSpriteSpeed = 0.02; // in % of screen size

const _colors = ["red", "green", "blue"];


// 0 takes 2
// 1 takes 0
// 2 takes 1
const _collideResult = [
   [0, 1, 0],
   [1, 1, 2],
   [0, 2, 2],
]


class Sprite {

   constructor(type) {

      this._type = type;

      this._x = Math.random() * _viewW;
      this._y = Math.random() * _viewH;

      this._dx = 2.0*_maxSpriteSpeed * (Math.random() - 0.5) * _viewW;
      this._dy = 2.0*_maxSpriteSpeed * (Math.random() - 0.5) * _viewH;
   }

   update() {

      this._x += _globalSpeed * this._dx;
      this._y += _globalSpeed * this._dy;

      if(this._dx > 0 && this._x > _viewW) {
         this._x = _viewW;
         this._dx = -this._dx;
      }

      if(this._dx < 0 && this._x < 0) {
         this._x = 0;
         this._dx = -this._dx;
      }

      if(this._dy > 0 && this._y > _viewH) {
         this._y = _viewH;
         this._dy = -this._dy;
      }

      if(this._dy < 0 && this._y < 0) {
         this._y = 0;
         this._dy = -this._dy;
      }
   }

   checkCollide(other) {

      if(
         this._x <= other._x + 12 &&
         this._x >= other._x - 12 &&
         this._y <= other._y + 12 &&
         this._y >= other._y - 12
      ) {

         const result = _collideResult[this._type][other._type];

         this._type = result;
         other._type = result;
      }
   }

   render(context) {

      context.fillStyle = _colors[this._type];

      context.fillRect(
         Math.round(this._x) - 6,
         Math.round(this._y) - 6,
         12,
         12
      );
   }
}


function resetSprites() {

   _sprites = [];

   for(let i = 0; i < 100; i++) {
      _sprites.push(new Sprite(i % 3));
   }
}


function updateViewSize() {

   _viewW = _canvas.offsetWidth;
   _viewH = _canvas.offsetHeight;

   _canvas.width = _viewW;
   _canvas.height = _viewH;
}


function handleGlobalSpeed(ev) {

   _globalSpeed = ev.target.value / 100;
}


function handleResetButton(ev) {

   resetSprites();
}


function handleResize() {

   updateViewSize();
   renderFrame();
}


function renderFrame() {

   _context.fillStyle = "black";
   _context.fillRect(0, 0, _viewW, _viewH);

   for(let i = 0; i < _sprites.length; i++) {
      _sprites[i].render(_context);
   }
}


function updateFrame() {

   for(let i = 0; i < _sprites.length; i++) {
      _sprites[i].update();
   }

   for(let i = 0; i < _sprites.length; i++) {
      for(let j = i+1; j < _sprites.length; j++) {
         _sprites[i].checkCollide(_sprites[j]);
      }
   }

   renderFrame();
   requestAnimationFrame(updateFrame);
}


function startup() {

   window.addEventListener("resize", handleResize);

   document
      .getElementById("globalSpeed")
      .addEventListener("input", handleGlobalSpeed);

   document
      .getElementById("resetButton")
      .addEventListener("click", handleResetButton);

   _canvas = document.getElementById("content");
   _context = _canvas.getContext("2d");

   updateViewSize();
   resetSprites();
   requestAnimationFrame(updateFrame);
}
