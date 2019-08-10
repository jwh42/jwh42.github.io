//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

/*
TODO:
	modelView.gl;
	modelView.getMatrix();
	modelView.getInverse();
	modelView.getProjection();
	modelView.rotate(angle, x, y, z);
	modelView.rotateAbout(angle, rx, ry, rz, tx, ty, tz);
	modelView.translate(x, y, z);
	modelView.scale(x, y, z);
	modelView.transform(matrix4);
	modelView.setMatrix(matrix4);
*/

class ModelView {
	
	// TODO: simplify matrix methods: no "auto-create" logic [transpose
	//       always has 2 args? see what latest matrix.js does first...]
	
	constructor(gl) {

		this.gl = throwIfNull(gl, "gl");

		this.pjMatrix = mat4.create();
		this.mvMatrix = mat4.create();
		this.keysDown = new Int32Array(128);
		this.pointerDx = 0;
		this.pointerDy = 0;
		this.pointerLocked = false;
		this.scrollWheel = 0;

		this._canvas = document.getElementById("content");
		this._invTpMv = mat3.create(); // TODO: make this mat4?
		this._mvStack = [this.mvMatrix];
		this._mvDepth = 0;
			
		// TODO: cleanup

		//##document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
		
		const moveListener = ev => {
			this.pointerDx = ev.movementX;
			this.pointerDy = ev.movementY;
		};

		document.addEventListener(
			"pointerlockchange",
			ev => {

				this.pointerLocked = (
					document.pointerLockElement === this._canvas ||
					document.mozPointerLockElement === this._canvas);

				console.log(`pointerlockchange: ${this.pointerLocked}`);

				if(this.pointerLocked) {
					document.addEventListener("pointermove", moveListener, false);
				} else {
					document.removeEventListener("pointermove", moveListener, false);
				}
			},
			false);

		this._canvas.addEventListener(
			"wheel",
			e => {
				 //##const delta =  (e.wheelDelta || -e.detail)));
				 console.log(`mousewheel: ${e.deltaY}, ${e.deltaMode}`);
				 this.scrollWheel = Math.max(-1, Math.min(1, e.deltaY));
				 return false;
			},
			false
		);

		document.addEventListener(
			"keydown",
			ev => {
				const keyCode = ev.keyCode;
				if(keyCode < this.keysDown.length) {
					this.keysDown[keyCode] = 1;
				}
			},
			false);

		document.addEventListener(
			"keyup",
			ev => {
				const keyCode = ev.keyCode;
				if(keyCode < this.keysDown.length) {
					this.keysDown[keyCode] = 0;
				}
			},
			false);
	}
	
	
	finishFrame() {
		
		// TODO: do this some other way?
		this.pointerDx = 0;
		this.pointerDy = 0;
		this.scrollWheel = 0;
	}

	
	saveMvMatrix() {

		this._mvDepth++;

		if(this._mvStack.length == this._mvDepth) {
			this._mvStack.push(mat4.create());
		}

		this.mvMatrix = mat4.set(this.mvMatrix, this._mvStack[this._mvDepth]);
	}
	
	
	restoreMvMatrix() {

		this.mvMatrix = this._mvStack[--this._mvDepth];
	}
	
	
	getInverseTransposeMvMatrix() {

		mat4.toInverseMat3(this.mvMatrix, this._invTpMv); // TODO: use mat4?
		return mat3.transpose(this._invTpMv); // TODO: use mat4?
	}
}
