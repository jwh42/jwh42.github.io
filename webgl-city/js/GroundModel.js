//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class GroundTile /*implements IModelish*/ {

	// TODO: GroundTile => BasicModel? [would still need subclass for n/s/e/w values...]

	constructor(
		texture,
		indexCount,
		indexBuffer,
		vertexBuffer,
		texCoordBuffer,
		exits) {

		this.texture = texture;
		this.indexCount = indexCount;
		this.indexBuffer = indexBuffer;
		this.vertexBuffer = vertexBuffer;
		this.texCoordBuffer = texCoordBuffer;
		this.exits = exits;
	}
}


class GroundModel extends Model {
	
	
	constructor(gl) {

		super();
		
		const sz = 50.0;
		
		const vertexData = [
			0.0, 0.0, 0.0,
			 sz, 0.0, 0.0,
			 sz, 0.0,  sz,
			0.0, 0.0,  sz
		];
		
		const texCoords = [
			0.0, 1.0,
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0
		];
		
		const indexes = [
			1, 0, 3,
			3, 2, 1
		];

		this.rows = -1;
		this.cols = -1;

		this._shader = null;
		this._tileSize = sz;
		this._tiles = [];
		this._layout = [];
		this._tempVec = [0.0, 0.0, 0.0];

		this._tileIndexCount = indexes.length;
		this._tileIndexBuffer = gl.createBuffer();
		this._tileVertexBuffer = gl.createBuffer();
		this._tileTexCoordBuffer = gl.createBuffer();

		// TODO: some of this code is common to other areas...

		// populate coordinate buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this._tileVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

		// populate texCoord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this._tileTexCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		// populate index buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._tileIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
	}
	

	/**
	 * Determines whether a row/col has a valid tile
	 * @param row Row to check
	 * @param col Column to check */
	isValidTile(row, col) {
		return (
			row >= 0 && row < this.rows &&
			col >= 0 && col < this.cols &&
			this._layout[row*this.cols + col] >= 0);
	}
	
	
	/** 
	 * Gets center X coordinate of a tile */
	getTileCenterX(col) {
		return this._tileSize*(col - 0.5*this.cols + 0.5);
	}
	
	
	/** 
	 * Gets center Z coordinate of a tile */
	getTileCenterZ(row) {
		return this._tileSize*(row - 0.5*this.rows + 0.5);
	}


	/**
	 * Determins whether an object can exit a given tile in a given direction
	 * @param row Row of the tile to check
	 * @param col Column of the tile to check
	 * @param dir Direction to check */
	canExitTile(row, col, dir) {

		// just return true for an invalid data to prevent
		// infinite recursion if invalid data is passed...
		if(
			dir < 0 || dir >= 4 ||
			row < 0 || row >= this.rows ||
			col < 0 || col >= this.cols) {
			return true;
		}

		// get type of tile
		const type = this._layout[row*this.cols + col];

		// see if tile has an exit for given direction
		return (type < 0 || this._tiles[type].exits[dir]);
	}


	/** @inheritDoc */
	render(world) {
		
		// TODO: cleanup
		
		for(let r = 0; r < this.rows; r++) {
			for(let c = 0; c < this.cols; c++) {

				const index = this._layout[r*this.cols + c];
				if(index >= 0) {

					world.saveMvMatrix();
					
					this._tempVec[0] = c*this._tileSize - (this.cols*this._tileSize)/2;
					this._tempVec[1] = 0.0;
					this._tempVec[2] = r*this._tileSize - (this.rows*this._tileSize)/2;
					mat4.translate(world.mvMatrix, this._tempVec);

					this._shader.render(world, this._tiles[index]);

					world.restoreMvMatrix();
				}
			}
		}
	}


	/** @inheritDoc */
	configureAsync(data, loader) {

		/*
		{
			"type": "ground",
			"rows": 8,
			"cols": 8,
			"tiles": [
				{ exits:[n,s,e,w], "texture": "" },
			],
			"layout": [ ... tile indicies ... ]
		}
		*/

		this.rows = data.rows|0;
		this.cols = data.cols|0;
		this._layout = data.layout;

		const promises = [];
		const tconfigs = data.tiles;

		for(let i = 0, imax = data.tiles.length; i < imax; i++) {
			const tileConfig = data.tiles[i];
			promises.push(loader.getTextureAsync(tileConfig.texture));
		}

		promises.push(loader.getModelShaderAsync(data.shader));

		return Promise.all(promises)
			.then(results => {

				const tileCount = results.length - 1;
				
				this._shader = results[tileCount];

				for(let i = 0; i < tileCount; i++) {
					this._tiles.push(
						new GroundTile(
							results[i],
							this._tileIndexCount,
							this._tileIndexBuffer,
							this._tileVertexBuffer,
							this._tileTexCoordBuffer,
							tconfigs[i].exits));
				}
			});
	}
}
