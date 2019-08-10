//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

// TODO: recalculate more path when reach end of path (sliding window?)

class Vehicle extends Renderable {
	
	
	constructor(model, ground) {
		
		super();
		
		this._pos = new Float32Array(3);
		this._path = new Spline3(4);
		this._model = model;
		this._ground = ground;
		this._locations = new Float32Array(3*4);
		this._locationI = 0; // NEXT place to write...
		this._duration = (3000*Math.random() + 1500)|0;
		this._timeIndex = 0;

		this._row = -1;
		this._col = -1;
		this._direction = -1;
		
		this._x = 0.0;
		this._z = 0.0;
		this._y = 0.0;

		// TODO: cleanup

		do {
			this._row = Math.floor(ground.rows*Math.random());
			this._col = Math.floor(ground.cols*Math.random());		
		} while(!ground.isValidTile(this._row, this._col));

		let x = ground.getTileCenterX(this._col);
		let z = ground.getTileCenterZ(this._row);
		let y = 10 * Math.random() + 3;
		
		this._locations[0] = x;
		this._locations[1] = y;
		this._locations[2] = z;
		this._locationI = 1;
		
		this._direction = (4*Math.random()) | 0;
		this._angleXz = 2*Math.PI*Math.random(); // TODO: calculate better initial angle...

		//##this._path.set(0, x, y, z);
		
		this._x = x;
		this._y = y;
		this._z = z;

		this._nextLocation();
		this._nextLocation();
		this._nextLocation();

		this._updatePath();
	}
	
	
	render(world) {
		
		// TODO: dont allocate matrices on each call... [updates to
		// world]  [store x,y,z as array instead of separate vars?]

		//##this._path.interpolate(this._pos, 0, (Date.now() % this._duration) / this._duration);

		const t = (Date.now() % this._duration) / this._duration;
		const tindex = (Date.now() / this._duration) | 0;
		
		if(this._timeIndex != tindex) {
			//##console.log(`updating path: ${tindex}`);
			this._timeIndex = tindex;
			this._nextLocation();
			this._updatePath();
		}

		this._path.interpolate(this._pos, 0, (1/3)+(1/3)*Math.min(t, 1));

		const dx = this._pos[0] - this._x;
		const dz = this._pos[2] - this._z;

		if(Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1) {
			this._angleXz = Math.atan2(dx, dz);			
			this._x = this._pos[0];
			this._z = this._pos[2];
		}
		
		world.saveMvMatrix();
		mat4.translate(world.mvMatrix, this._pos);
		
		// TODO: how to get size of vehicle model for rotate-about-center?

		mat4.translate(world.mvMatrix, [1, 1, 1]);
		mat4.rotate(world.mvMatrix, this._angleXz, [0, 1, 0]);
		mat4.translate(world.mvMatrix, [-1, -1, -1]);

		this._model.render(world);
		world.restoreMvMatrix();
	}
	
	
	_nextLocation() {
		
		// TODO: cleanup

		const prevDir = this._direction;
		
		// pick a direction that does not double-back;
		// keep picking until there is an exit in the
		// current tile
		do {
			this._direction = Vehicle.nextDirections[3*prevDir+((3*Math.random())|0)];
		} while(!this._ground.canExitTile(this._row, this._col, this._direction));

		this._row += Vehicle.nextRow[this._direction];
		this._col += Vehicle.nextCol[this._direction];

		const y = Math.min(Math.max(this._y + 10*Math.random() - 5, 3), 50);
		const wr = 3*this._locationI;
		this._locations[wr+0] = this._ground.getTileCenterX(this._col);
		this._locations[wr+1] = y;
		this._locations[wr+2] = this._ground.getTileCenterZ(this._row);
		
		this._y = y; // TODO: rename this._y becuase this._x/_z are different...?
		
		this._locationI = (this._locationI + 1)%4;
	}
	
	
	_updatePath() {
		
		// TODO: cleanup

		for(let i = 0; i < 4; i++) {
			const rd = 3*((this._locationI + i) % 4);
			this._path.set(
				i,
				this._locations[rd+0],
				this._locations[rd+1],
				this._locations[rd+2]);
		}
	}
}


// 0:north, 1:east, 2:south, 3:west

Vehicle.nextRow = [-1, 0, 1, 0];
Vehicle.nextCol = [ 0, 1, 0,-1];

Vehicle.nextDirections = [
	0, 1, 3, // north => anything but south
	0, 1, 2, // east  => anything but west
	1, 2, 3, // south => anything but north
	0, 2, 3  // west  => anything but east
];
