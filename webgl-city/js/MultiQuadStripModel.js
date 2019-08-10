//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

// TODO: support (optional) normals?

/*
{
	shader: "",
	parts: [{
		texture: "",
		coords: [ x0,y0,z0, ..., xN,yN,zN ]
	}]
}
*/

class MultiQuadStripModel extends Model {
	
	
	constructor(gl) {

		super(gl);
		this.shader = null;
		this.parts = [];
	}
		

	/** @inheritDoc */
	render(world) {

		for(let i = 0, imax = this.parts.length; i < imax; i++) {
			this.shader.render(world, this.parts[i]);
		}
	}
	

	/** @inheritDoc */
	configureAsync(data, loader) {

		const gl = loader.gl;
		let part = null;

		const promises = [
			loader.getModelShaderAsync(data.shader)
		];

		for(let i = 0, imax = data.parts.length; i < imax; i++) {
			this.parts.push(part = new MultiQuadStripModelPart(gl));
			promises.push(part.configureAsync(data.parts[i], loader));
		}

		return Promise.all(promises)
			.then(results => {
				this.shader = results[0];
			});
	}
}


class MultiQuadStripModelPart /*implements IModelish*/ {


	constructor(gl) {

		this.texture = null;
		this.indexCount = 0;
		this.indexBuffer = gl.createBuffer();
		this.vertexBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
	}
	
	
	configureAsync(data, loader) {

		const coordCount = (data.coords.length / 3)|0;
		const segmentCount = Math.floor(coordCount / 2) - 1;
		const texCoords = new Float32Array(2*coordCount);
		const indexCoords = new Uint16Array(3*(coordCount - 2));
		
		// populate texture coordinates
		let texIndex = 0.0;
		for(let i = 0, imax = texCoords.length; i < imax; i += 4) {
			const texX = texIndex / segmentCount;
			texCoords[i+0] = texX;
			texCoords[i+1] = 0.0;
			texCoords[i+2] = texX;
			texCoords[i+3] = 1.0;
			texIndex += 1.0;
		}

		// TODO: cleanup
	
		// populate coordinate indexes
		for(let i = 0; i < segmentCount; i++) {
			indexCoords[6*i+0] = 2*i+0;
			indexCoords[6*i+1] = 2*i+1;
			indexCoords[6*i+2] = 2*i+2;
			indexCoords[6*i+3] = 2*i+2;
			indexCoords[6*i+4] = 2*i+1;
			indexCoords[6*i+5] = 2*i+3;
		}
		
		// update indexCount
		this.indexCount = indexCoords.length;

		// populate coordinate buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.coords), gl.STATIC_DRAW);

		// populate texCoord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

		// populate index buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexCoords, gl.STATIC_DRAW);
		
		return loader
			.getTextureAsync(data.texture)
			.then(t => this.texture = t);
	}
}

