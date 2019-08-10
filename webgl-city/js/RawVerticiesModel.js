//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class RawVerticiesModel extends Model {


	/** Constructs a new instance */
	constructor(gl) {

		super();

		this.texture = null;
		this.shader = null;
		this.indexCount = 0;
		this.indexBuffer = gl.createBuffer();
		this.vertexBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
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
			texture: "",
			shader: "",
			vertices: [ x0,y0,z0, ..., xN,yN,zN ],
			normals: [ x0,y0,z0, ..., xN,yN,zN ],
			texCoords: [ x0,y0, ..., xN,yN ],
			indicies: [ i0,...iN ]
		}
		*/

		// TODO: if any of arrays are missing or != correct length, throw error...

		this.indexCount = data.indicies.length;

		const gl = loader.gl;
		this._buildIndexBuffer(gl, this.indexBuffer, data.indicies);
		this._buildArrayBuffer(gl, this.vertexBuffer, data.vertices);
		this._buildArrayBuffer(gl, this.normalBuffer, data.normals);
		this._buildArrayBuffer(gl, this.texCoordBuffer, data.texCoords);

		return Promise.all([
			loader.getTextureAsync(data.texture),
			loader.getModelShaderAsync(data.shader)
		]).then(resources => {
			this.texture = resources[0];
			this.shader = resources[1];
		});
	}


	_buildArrayBuffer(gl, buffer, values) {

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
	}


	_buildIndexBuffer(gl, buffer, values) {

		const type = gl.ELEMENT_ARRAY_BUFFER;
		gl.bindBuffer(type, buffer);
		gl.bufferData(type, new Uint16Array(values), gl.STATIC_DRAW);
	}
}
