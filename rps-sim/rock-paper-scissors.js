let _viewW = 0;
let _viewH = 0;
let _canvas = null;
let _context = null;
let _sprites = null;

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

      this._dx = Math.random()*_viewW*0.02 - _viewW*0.01;
      this._dy = Math.random()*_viewH*0.02 - _viewH*0.01;
   }

   update() {

      this._x += this._dx;
      this._y += this._dy;

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


function updateViewSize() {

   _viewW = _canvas.offsetWidth;
   _viewH = _canvas.offsetHeight;

   _canvas.width = _viewW;
   _canvas.height = _viewH;
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

   _canvas = document.getElementById("content");
   _context = _canvas.getContext("2d");
   _sprites = [];

   updateViewSize();

   for(let i = 0; i < 100; i++) {
      _sprites.push(new Sprite(i % 3));
   }

   window.onresize = handleResize;

   requestAnimationFrame(updateFrame);
}
