//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class ResourceLoader {


	constructor(gl) {

		this.gl = throwIfNull(gl, "gl");  // WebGLRenderingContext
		this._fshaders = new Map(); // Map<string,Promise<WebGLShader>>
		this._vshaders = new Map(); // Map<string,Promise<WebGLShader>>
		this._textures = new Map(); // Map<string,Promise<WebGLTexture>>
		this._renderers = new Map(); // Map<string,Promise<ModelRenderer>>
		this._modelTypes = new Map(); // Map<string,any>
	}
	
	
	getModelType(name) {
	
		const type = this._modelTypes.get(name);
		if(!type) {
			throw new Exception("Unknown model type: "+name);
		}
		return type;
	}
	
	addModelType(name, type) {
		this._modelTypes.set(name, type);
	}
	
	
	getModelShaderAsync(name) {
		const r = this._renderers.get(name);
		if(!r) {
			throw new Error("Unknown renderer "+name);
		}
		return r;
	}
	
	addModelShader(name, renderer) {
		this._renderers.set(name, renderer);
	}


	createShaderProgramAsync(pathVertex, pathFragment) {

		return Promise.all([
			this.getVertexShaderAsync(pathVertex),
			this.getFragmentShaderAsync(pathFragment)
		])
		.then(parts => {
		
			const p = gl.createProgram();			
			gl.attachShader(p, parts[0]);
			gl.attachShader(p, parts[1]);
			gl.linkProgram(p);

			if(!gl.getProgramParameter(p, gl.LINK_STATUS)) {
				throw new Error(
					`Could not link shaders '${pathVertex}' and '${pathFragment}'`);
			}

			return p;
		})
	}


	getFragmentShaderAsync(path) {
		return this._getShader(path, this.gl.FRAGMENT_SHADER, this._fshaders);
	}
	
	
	getVertexShaderAsync(path) {
		return this._getShader(path, this.gl.VERTEX_SHADER, this._vshaders);
	}
	
	
	getTextureAsync(path) {

		let texPromise = this._textures.get(path);
		if(texPromise == null) {
			texPromise = this._loadTexture(path);
			this._textures.set(path, texPromise);
		}

		return texPromise;
	}
	
	
	_getShader(path, type, map) {
	
		let shaderPromise = map.get(path);
		if(shaderPromise == null) {
			shaderPromise = this._loadShader(path, type);
			map.set(path, shaderPromise);
		}

		return shaderPromise;
	}
	
	
	_loadTexture(path) {
		return new Promise((resolve, reject) => {

			const image = new Image();
			const texture = this.gl.createTexture();
			
			image.onerror = () => {
				reject(new Error("Could not load image "+path));
			}

			image.onload = () => {

				const gl = this.gl;
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				//##gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				//##gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

				gl.generateMipmap(gl.TEXTURE_2D); // TODO: remove this? (change texParameteri calls too?)
				
				/*
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				*/

				gl.bindTexture(gl.TEXTURE_2D, null);
				
				resolve(texture);
			}

			image.src = path;
		});
	}
	
	
	_loadShader(path, type) {
		return fetch(path)
			.then(response => response.text())
			.then(content => {

				const gl = this.gl;
				const shader = gl.createShader(type);
				gl.shaderSource(shader, content);
				gl.compileShader(shader);

				if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
					throw new Error(gl.getShaderInfoLog(shader));
				}

				return shader;
			});
	}
}
