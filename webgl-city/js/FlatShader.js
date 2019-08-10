//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class FlatShader {


	constructor(gl, shaderProgram) {
		
		this._shaderProgram = shaderProgram;

		gl.useProgram(shaderProgram);

		this._vertexBufferAttr = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		this._texCoordBufferAttr = gl.getAttribLocation(shaderProgram, "aTextureCoord");
		this._samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
		this._pjMatrixUniform = gl.getUniformLocation(shaderProgram, "uPjMatrix");
		this._mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMvMatrix");
	}
	
	
	render(world, model) {
		
		const gl = world.gl;
		
		gl.useProgram(this._shaderProgram);

		gl.enableVertexAttribArray(this._texCoordBufferAttr);
		gl.enableVertexAttribArray(this._vertexBufferAttr);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
		gl.vertexAttribPointer(this._vertexBufferAttr, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.texCoordBuffer);
		gl.vertexAttribPointer(this._texCoordBufferAttr, 2, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, model.texture);
		gl.uniform1i(this._samplerUniform, 0);

		gl.uniformMatrix4fv(this._pjMatrixUniform, false, world.pjMatrix);
		gl.uniformMatrix4fv(this._mvMatrixUniform, false, world.mvMatrix);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
		gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(this._texCoordBufferAttr);
		gl.disableVertexAttribArray(this._vertexBufferAttr);
	}
}
