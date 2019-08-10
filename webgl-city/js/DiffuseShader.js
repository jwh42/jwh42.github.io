//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class DiffuseShader {


	constructor(gl, shaderProgram, normalProgram) {
		
		this._shaderProgram = shaderProgram;

		gl.useProgram(shaderProgram); // TODO: may not need this...

		this._vertexBufferAttr = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		this._normalBufferAttr = gl.getAttribLocation(shaderProgram, "aVertexNormal");
		this._texCoordBufferAttr = gl.getAttribLocation(shaderProgram, "aTextureCoord");

		// TODO: update property names
		this._pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		this._mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		this._nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
		this._samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
		this._useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
		this._ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
		this._lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
		this._directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
		
		
		// TODO: remove these...
		this._normalProgram = normalProgram;
		gl.useProgram(normalProgram);
		this._normal_pMatrixUniform = gl.getUniformLocation(normalProgram, "uPMatrix");
		this._normal_mvMatrixUniform = gl.getUniformLocation(normalProgram, "uMVMatrix");
		this._normal_vertexBufferAttr = gl.getAttribLocation(normalProgram, "aVertexPosition");
		this._normal_normalBufferAttr = gl.getAttribLocation(normalProgram, "aVertexNormal");
	}
	
	
	render(world, model) {

		// TODO: implement this method
		
		const gl = world.gl;
		
		gl.useProgram(this._shaderProgram);

		gl.enableVertexAttribArray(this._vertexBufferAttr);
		gl.enableVertexAttribArray(this._normalBufferAttr);
		gl.enableVertexAttribArray(this._texCoordBufferAttr);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
		gl.vertexAttribPointer(this._vertexBufferAttr, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
		gl.vertexAttribPointer(this._normalBufferAttr, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.texCoordBuffer);
		gl.vertexAttribPointer(this._texCoordBufferAttr, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, model.texture);
		gl.uniform1i(this._samplerUniform, 0);
		gl.uniform1i(this._useLightingUniform, true); // TODO: remove this variable from shader...		
		gl.uniform3f(this._ambientColorUniform, 0.3, 0.3, 0.3); // TODO: configurable


		const adjustedLD = vec3.create();
		//##vec3.normalize([-0.25, -0.25, -1.0], adjustedLD); // TODO: configurable
		//##vec3.normalize([1, 0.5, -0.5], adjustedLD);
		vec3.normalize([1.0, -1.0, 0.0], adjustedLD);
		vec3.scale(adjustedLD, -1);
		
		const cameraMatrix = mat4.create();		
		CameraModel.instance._cameraToCtm(cameraMatrix);
		mat4.inverse(cameraMatrix);
		mat4.transpose(cameraMatrix);
		mat4.multiplyVec3(cameraMatrix, adjustedLD);

		gl.uniform3fv(this._lightingDirectionUniform, adjustedLD);
		
		//##gl.uniform3fv(this._lightingDirectionUniform, [0.0,-1.0,0.0]);


		gl.uniform3f(this._directionalColorUniform, 0.9, 0.9, 0.9); // TODO: configurable


		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);



		// TODO: light vector is not transforming with camera... (x=-1 always showing light from right side, no matter how camera is positioned)
		// TODO: for now, have a "light-transform" that CameraModel.js calculates based on camera transforms to see what happens...

		
		
		// TODO: cleanup [add getNormalMatrix() to world?]
		gl.uniformMatrix4fv(this._pMatrixUniform, false, world.pjMatrix);
		gl.uniformMatrix4fv(this._mvMatrixUniform, false, world.mvMatrix);
		
		const normalMatrix = mat3.create();
		mat4.toInverseMat3(world.mvMatrix, normalMatrix);
		mat3.transpose(normalMatrix);
		//##mat3.identity(normalMatrix);
		gl.uniformMatrix3fv(this._nMatrixUniform, false, normalMatrix);		

		
		
		gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(this._vertexBufferAttr);
		gl.disableVertexAttribArray(this._normalBufferAttr);
		gl.disableVertexAttribArray(this._texCoordBufferAttr);
		
		
		
		
		
		
		
		// TODO: remove this...
		
		/*
		gl.useProgram(this._normalProgram);
		gl.lineWidth(5);
		
		gl.enableVertexAttribArray(this._normal_vertexBufferAttr);
		gl.enableVertexAttribArray(this._normal_normalBufferAttr);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
		gl.vertexAttribPointer(this._normal_vertexBufferAttr, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
		gl.vertexAttribPointer(this._normal_normalBufferAttr, 3, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(this._normal_pMatrixUniform, false, world.pjMatrix);
		gl.uniformMatrix4fv(this._normal_mvMatrixUniform, false, world.mvMatrix);
		
		const ptCount = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
		gl.drawArrays(gl.POINTS, 0, (ptCount / (3*4)) | 0);
		
		gl.disableVertexAttribArray(this._normal_vertexBufferAttr);
		gl.disableVertexAttribArray(this._normal_normalBufferAttr);
		*/
	}
}
