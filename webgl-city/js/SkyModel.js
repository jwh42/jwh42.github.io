//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

// textures from: http://www.custommapmakers.org/skyboxes.php

class SkyModel extends Model /*implements IModelish*/ {
	
	
	constructor(gl) {

		super();

		this.shader = null;
		this.texture = null;
		this.indexCount = 0;
		this.indexBuffer = gl.createBuffer();
		this.vertexBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
	}
		

	/** @inheritDoc */
	render(world) {

		this.shader.render(world, this);
	}
	

	/** @inheritDoc */
	configureAsync(data, loader) {

		/*
		{
			shader: "",
			texture: ""
		}
		*/
		
		// TODO: change to a cube instead of a cylinder?
		// TODO: cleanup
		
		const gl = loader.gl;
		const r = 1000;
		
		/*
		const texCoords = new Float32Array([
			0.00,0.75, 0.25,0.75, 0.25,0.50, 0.00,0.50, // left
			0.25,0.75, 0.50,0.75, 0.50,0.50, 0.25,0.50, // back
			0.50,0.75, 0.75,0.75, 0.75,0.50, 0.50,0.50, // right
			0.75,0.75, 1.00,0.75, 1.00,0.50, 0.75,0.50, // front
			0.25,1.00, 0.50,1.00, 0.50,0.75, 0.25,0.75, // top
			0.25,0.50, 0.50,0.50, 0.50,0.25, 0.25,0.25  // bottom
		]);
		*/

		const s=1/8;
		const texCoords = new Float32Array([
			0*s,1, 1*s,1, 1*s,0, 0*s,0, // left
			1*s,1, 2*s,1, 2*s,0, 1*s,0, // back
			2*s,1, 3*s,1, 3*s,0, 2*s,0, // right
			3*s,1, 4*s,1, 4*s,0, 3*s,0, // front
			
			0.6875,1, 0.6875,0, 0.5625,0, 0.5625,1, // top
			0.8750,0, 0.7500,0, 0.7500,1, 0.8750,1  // bottom
		]);
		
		const vertexCoords = new Float32Array([
			-r, r, r,  -r, r,-r,  -r,-r,-r,  -r,-r, r, // left			
			-r, r,-r,   r, r,-r,   r,-r,-r,  -r,-r,-r, // back
			 r, r,-r,   r, r, r,   r,-r, r,   r,-r,-r, // right
			 r, r, r,  -r, r, r,  -r,-r, r,   r,-r, r, // front
			-r, r, r,   r, r, r,   r, r,-r,  -r, r,-r, // top			
			-r,-r, r,  -r,-r,-r,   r,-r,-r,   r,-r, r, // bottom
		]);

		const indexCoords = new Uint16Array([
			 2, 1, 0,   2, 0, 3, // left
			 6, 5, 4,   6, 4, 7, // back
			10, 9, 8,  10, 8,11, // right
			14,13,12,  14,12,15, // front
			18,17,16,  18,16,19, // top
			22,21,20,  22,20,23  // bottom
		]);

		// TODO: MultiQuadStripModelPart has similar code...

		// update indexCount
		this.indexCount = 36;

		// populate coordinate buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexCoords, gl.STATIC_DRAW);

		// populate texCoord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

		// populate index buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexCoords, gl.STATIC_DRAW);

		return Promise
			.all([
				loader.getModelShaderAsync(data.shader),
				loader.getTextureAsync(data.texture)
			])
			.then(results => {
				this.shader = results[0];
				this.texture = results[1];
			});
	}
}
