//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

// TODO: "defaultShader" propert on Building ?

/*
{
	"type":"building",
	"levels": [
		{ "dy":0, "shader":"", "texture":"", "r": [rad1,count1,...,radN,countN] }
	]
}
*/

class BuildingModel extends Model /*implements IModelish*/ {
	
	
	constructor(gl) {

		super();
		this._levels = [];
	}
		

	/** @inheritDoc */
	render(world) {
		
		for(let i = 0, imax = this._levels.length; i < imax; i++) {
			const level = this._levels[i];
			level.shader.render(world, level);
		}
	}
	

	/** @inheritDoc */
	configureAsync(data, loader) {

		const gl = loader.gl;
		const promises = [];
		const angleCount = data.angleCount;
		const indexBuffer = this._createIndexBuffer(gl, angleCount);
		const texCoordBuffer = this._createTexCoordBuffer(gl, angleCount);

		// calculate coordinates for rings
		let y = 0.0;		
		let rings = [];
		rings.push(this._createVertexRingCoords(angleCount, data.base, 0.0));

		for(let i = 0, imax = data.levels.length; i < imax; i++) {
			const config = data.levels[i];
			y += config.height;
			rings.push(this._createVertexRingCoords(angleCount, config.r, y));
		}

		// calculate normals for rings
		// TODO: cleanup
		const norms = [];
		norms.push(this._createNormalRingCoords(angleCount, rings[0], rings[0], rings[1]));
		for(let i = 1, imax = rings.length - 1; i < imax; i++) {
			norms.push(this._createNormalRingCoords(angleCount, rings[i-1], rings[i], rings[i+1]));
		}
		norms.push(this._createNormalRingCoords(angleCount, rings[rings.length - 2], rings[rings.length - 1], rings[rings.length - 1]));
		
		// TODO: fix: norms[norms.length-1] are all NaN.... (because unnormalized vectors are [0,0,0]) **** because radius_of_bldg=0 ****

		// create building levels
		for(let i = 0, imax = data.levels.length; i < imax; i++) {

			const level =
				new BuildingLevel(
					gl,
					this._createPointBuffer(gl, angleCount, rings[i+0], rings[i+1]),
					this._createPointBuffer(gl, angleCount, norms[i+0], norms[i+1]),
					texCoordBuffer,
					indexBuffer,
					6*angleCount);

			promises.push(
				level.configureAsync(data.levels[i], loader));

			this._levels.push(level);
		}

		return Promise.all(promises);
	}
	
	
	_createVertexRingCoords(angleCount, rdata, y) {
		
		const coords = new Float32Array(3*angleCount+3);

		let vertIndex = 0;
		let angleIndex = 0;
		for(let i = 0; i < rdata.length; i += 2) {

			const radius = rdata[i+0];
			const count = rdata[i+1];
			for(let j = 0; j < count; j++) {
				const angle = (2*Math.PI)*(angleIndex / angleCount);
				coords[vertIndex + 0] = radius * Math.cos(angle);
				coords[vertIndex + 1] = y;
				coords[vertIndex + 2] = radius * Math.sin(angle);
				vertIndex += 3;
				angleIndex += 1.0;
			}
		}

		const radius2 = rdata[0];
		const angle2 = (2*Math.PI)*(angleIndex / angleCount);
		coords[vertIndex + 0] = radius2 * Math.cos(angle2);
		coords[vertIndex + 1] = y;
		coords[vertIndex + 2] = radius2 * Math.sin(angle2);

		return coords;
	}
	
	
	_createNormalRingCoords(angleCount, r0, r1, r2) {
		
		// TODO: fix: normals at beginning and end of ring do not match...

		const coords = new Float32Array(3*angleCount+3);

		this._calculateNormal(coords, angleCount - 2, 0, 1, r0, r1, r2); // col0

		for(let i = 1; i < angleCount; i++) { // col1...N-1
			this._calculateNormal(coords, i-1, i, i+1, r0, r1, r2);
		}

		this._calculateNormal(coords, angleCount-1, angleCount+0, 1, r0, r1, r2); // colN

		return coords;
	}
	
	
	_calculateNormal(coords, im1, ip0, ip1, r0, r1, r2) {
		
		// TODO: change variable names??

		this._addCrossProd3(coords, ip0, r1, ip0, r2, ip0, r1, ip1);
		this._addCrossProd3(coords, ip0, r1, ip0, r1, ip1, r0, ip0);
		this._addCrossProd3(coords, ip0, r1, ip0, r0, ip0, r1, im1);
		this._addCrossProd3(coords, ip0, r1, ip0, r1, im1, r2, ip0);

		this._normalize3(coords, ip0);
	}
	
	
	_addCrossProd3(coords, dst, v0, i0, v1, i1, v2, i2) {

		const ax = v1[3*i1+0] - v0[3*i0+0];
		const ay = v1[3*i1+1] - v0[3*i0+1];
		const az = v1[3*i1+2] - v0[3*i0+2];

		const bx = v2[3*i2+0] - v0[3*i0+0];
		const by = v2[3*i2+1] - v0[3*i0+1];
		const bz = v2[3*i2+2] - v0[3*i0+2];

		coords[3*dst+0] +=  ay * bz - az * by;
		coords[3*dst+1] += -ax * bz + az * bx;
		coords[3*dst+2] +=  ax * by - ay * bx;
	}
	

	_normalize3(coords, i) {

		const x = coords[3*i+0];
		const y = coords[3*i+1];
		const z = coords[3*i+2];
		const len = Math.sqrt(x*x + y*y + z*z);
	
		if(len > 0) {
			coords[3*i+0] = x/len;
			coords[3*i+1] = y/len;
			coords[3*i+2] = z/len;
		}
	}


	_createPointBuffer(gl, angleCount, btm, top) {

		const buffer = gl.createBuffer()
		const floatCount = 3*angleCount+3;

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, 2*4*floatCount, gl.STATIC_DRAW);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, btm);
		gl.bufferSubData(gl.ARRAY_BUFFER, 4*floatCount, top);
		
		return buffer;
	}

	
	_createIndexBuffer(gl, angleCount) {

		const buffer = gl.createBuffer();
		const indicies = new Uint16Array(6*angleCount);

		for(let i = 0; i < angleCount; i++) {
			indicies[6*i+0] = i;
			indicies[6*i+1] = i+(angleCount+1);
			indicies[6*i+2] = i+(angleCount+1)+1;
			indicies[6*i+3] = i;
			indicies[6*i+4] = i+(angleCount+1)+1;
			indicies[6*i+5] = i+1;
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

		return buffer;
	}
	
	
	_createTexCoordBuffer(gl, angleCount) {

		const coords = new Float32Array(4*angleCount+4);
		this._populateTexCoordRing(coords, 0, angleCount, 0.0);
		this._populateTexCoordRing(coords, 2*(angleCount+1), angleCount, 1.0);

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
		
		return buffer;
	}
	
	
	_populateTexCoordRing(coords, start, angleCount, y) {

		let texIndex = 0.0;
		for(let i = start, imax = start+2*angleCount; i <= imax; i += 2) {
			coords[i+0] = texIndex / angleCount;
			coords[i+1] = y;
			texIndex += 1.0;
		}
	}
}


class BuildingLevel /*implements IModelish*/ {


	constructor(
		gl,
		vertexBuffer,
		normalBuffer,
		texCoordBuffer,
		indexBuffer,
		indexCount) {

		this.shader = null;
		this.texture = null;

		this.indexCount = indexCount;
		this.indexBuffer = indexBuffer;
		this.vertexBuffer = vertexBuffer;
		this.normalBuffer = normalBuffer;
		this.texCoordBuffer = texCoordBuffer;
	}


	configureAsync(data, loader) {

		return Promise.all([
			loader.getModelShaderAsync(data.shader),
			loader.getTextureAsync(data.texture)
		]).then(results => {
			this.shader = results[0];
			this.texture = results[1];
		});
	}
}
