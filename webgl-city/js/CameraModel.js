//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class CameraModel extends Model {
	

	/**
	 * Constructs a new instance */
	constructor() {

		super();

		CameraModel["instance"] = this; // TODO: remove this...
		
		this._cameraX = 0.0;
		this._cameraY = 20.0;
		this._cameraZ = 30;

		this._lookAtY = 0.0;
		this._lookAtXZ = 0.0;
		
		this._cWasDown = false;
		this._userCamera = true;
		
		// TODO: cleanup

		this._lineProgram = null;
		this._lineProgramVertexBuffer = -1;
		this._pjMatrixUniform = -1;
		this._mvMatrixUniform = -1;
		this._colorUniform = -1;
		
		this._cameraBuffer = null;
		this._lookAtBuffer = null;
		
		this._cameraSpline = null;
		this._lookAtSpline = null;

		this._cameraValue = new Float32Array(3);
		this._lookAtValue = new Float32Array(3);
	}

	
	/** @inheritDoc */
	render(modelView) {
		
		const keys = modelView.keysDown;
		if(!this._cWasDown && keys[KeyCodes.c]) {
			this._userCamera = !this._userCamera;
			// TODO: copy current camera position [and look-at]?
		}
		this._cWasDown = !!keys[KeyCodes.c];
		
		// TODO: cleanup
		if(this._userCamera) {
			// keyboard camera		
			this._handleKeys(modelView);
		}
		
		this._cameraToCtm(modelView.mvMatrix);
				
		if(false) { // TODO: cleanup

			const gl = modelView.gl;

			gl.lineWidth(5);

			gl.useProgram(this._lineProgram);

			gl.enableVertexAttribArray(this._lineProgramVertexBuffer);

			gl.uniformMatrix4fv(this._pjMatrixUniform, false, modelView.pjMatrix);
			gl.uniformMatrix4fv(this._mvMatrixUniform, false, modelView.mvMatrix);

			gl.uniform3f(this._colorUniform, 1.0, 0.0, 0.0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._cameraBuffer);
			gl.vertexAttribPointer(this._lineProgramVertexBuffer, 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.LINE_STRIP, 0, this._cameraSpline.count);

			gl.uniform3f(this._colorUniform, 0.0, 0.0, 1.0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._lookAtBuffer);
			gl.vertexAttribPointer(this._lineProgramVertexBuffer, 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.LINE_STRIP, 0, this._lookAtSpline.count);

			gl.disableVertexAttribArray(this._lineProgramVertexBuffer);
		}
	}

	
	/** @inheritDoc */
	configureAsync(data, loader) {

		const p = data.points;
		const count = (p.length / 6)|0;
		
		this._cameraSpline = new Spline3(count);
		this._lookAtSpline = new Spline3(count);

		for(let rd = 0, wr = 0; rd < p.length; rd += 6, wr++) {
			this._cameraSpline.set(wr, p[rd+0], p[rd+1], p[rd+2]);
			this._lookAtSpline.set(wr, p[rd+3], p[rd+4], p[rd+5]);
		}

		this._cameraBuffer = this._cameraSpline.createBuffer(loader.gl);
		this._lookAtBuffer = this._lookAtSpline.createBuffer(loader.gl);

		return loader
			.createShaderProgramAsync(
				"shaders/Line-Vertex.glsl",
				"shaders/Line-Fragment.glsl")
			.then(program => {			

				const gl = loader.gl;				

				this._lineProgram = program;

				this._colorUniform = gl.getUniformLocation(program, "color");
				this._pjMatrixUniform = gl.getUniformLocation(program, "uPjMatrix");
				this._mvMatrixUniform = gl.getUniformLocation(program, "uMvMatrix");

				this._lineProgramVertexBuffer =
					gl.getAttribLocation(program, "aVertexPosition");
			})
	}
	
	
	_cameraToCtm(matrix) {

		// TODO: cleanup
		if(this._userCamera) {

			// x: camera_x + lookAtDist*cos(lookAtYAngle)*sin(lookAtXzAngle)
			// y: camera_y + lookAtDist*sin(lookAtYAngle)
			// z: camera_z + lookAtDist*cos(lookAtYAngle)*cos(lookAtXzAngle)

			mat4.lookAt(
				[this._cameraX, this._cameraY, this._cameraZ],
				[
					this._cameraX + 20*Math.cos(this._lookAtY)*Math.sin(this._lookAtXZ),
					this._cameraY + 20*Math.sin(this._lookAtY),
					this._cameraZ - 20*Math.cos(this._lookAtY)*Math.cos(this._lookAtXZ)
				],
				[0.0, 1.0, 0.0],
				matrix);
				
		} else {

			// animated camera
		
			const t = (Date.now() % 200000) / 200000;
			this._cameraSpline.interpolate(this._cameraValue, 0, t);
			this._lookAtSpline.interpolate(this._lookAtValue, 0, t);
			
			mat4.lookAt(
				this._cameraValue,
				this._lookAtValue,
				[0.0, 1.0, 0.0],
				matrix);
		}
	}
	
	
	_handleKeys(view) {
		
		// a: move camera + perpendicular to look-at xz angle
		// d: move camera - perpendicular to look-at xz angle
		// w: move camera + parallel to look-at xz angle
		// x: move camera - parallel to look-at xz angle
		// space: move camera + y
		// shift: move camera - y

		// left: increase look-at xz angle
		// right: decrease look-at xz angle
		// up: increase look-at y angle
		// down: decrease look-at y angle

		// lookAt
		// 	x: camera_x + lookAtDist*cos(lookAtYAngle)*sin(lookAtXzAngle)
		// 	y: camera_y + lookAtDist*sin(lookAtYAngle)
		// 	z: camera_z + lookAtDist*cos(lookAtYAngle)*cos(lookAtXzAngle)
	
		// camera
		// 	w: camera_x,y,z += [see lookAt]
		// 	x: camera_x,y,z -= [see lookAt]
	
		// TODO: cleanup
		
		const userV = 1.5;
		const lookV = 0.07; // radians
		const pointerV = 0.003; // radians
		
		const keys = view.keysDown;
		
		if(view.pointerLocked) {

			this._lookAtXZ += view.pointerDx*pointerV;

			this._lookAtY =
				Math.min(Math.max(
					this._lookAtY - view.pointerDy*pointerV,
					-(Math.PI/2 - Math.PI/16)),
					 (Math.PI/2 - Math.PI/16))
		}

		if(keys[KeyCodes.left]) {
			this._lookAtXZ -= lookV;
		}
		if(keys[KeyCodes.right]) {
			this._lookAtXZ += lookV;
		}
		if(keys[KeyCodes.up]) {
			this._lookAtY = Math.min(this._lookAtY + lookV, (Math.PI/2 - Math.PI/16));
		}
		if(keys[KeyCodes.down]) {
			this._lookAtY = Math.max(this._lookAtY - lookV, -(Math.PI/2 - Math.PI/16));
		}
		
		if(keys[KeyCodes.space]) {
			this._cameraY += userV;
		}

		if(keys[KeyCodes.shift]) {
			this._cameraY -= userV;
		}

		if(view.scrollWheel < 0) { // see keys[KeyCodes.w]
			// TODO: cleanup
			this._cameraX += 5*userV*Math.cos(this._lookAtY)*Math.sin(this._lookAtXZ);
			this._cameraY += 5*userV*Math.sin(this._lookAtY);
			this._cameraZ -= 5*userV*Math.cos(this._lookAtY)*Math.cos(this._lookAtXZ);
		}

		if(view.scrollWheel > 0) { // see keys[KeyCodes.s]
			// TODO: cleanup
			this._cameraX -= 5*userV*Math.cos(this._lookAtY)*Math.sin(this._lookAtXZ);
			this._cameraY -= 5*userV*Math.sin(this._lookAtY);
			this._cameraZ += 5*userV*Math.cos(this._lookAtY)*Math.cos(this._lookAtXZ);
		}
		
		if(keys[KeyCodes.w]) {
			// TODO: cleanup
			this._cameraX += userV*Math.cos(this._lookAtY)*Math.sin(this._lookAtXZ);
			this._cameraY += userV*Math.sin(this._lookAtY);
			this._cameraZ -= userV*Math.cos(this._lookAtY)*Math.cos(this._lookAtXZ);
		}

		if(keys[KeyCodes.s]) {
			// TODO: cleanup
			this._cameraX -= userV*Math.cos(this._lookAtY)*Math.sin(this._lookAtXZ);
			this._cameraY -= userV*Math.sin(this._lookAtY);
			this._cameraZ += userV*Math.cos(this._lookAtY)*Math.cos(this._lookAtXZ);
		}
	}
}
