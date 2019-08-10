//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class TranslateTransform extends Renderable {
	
	// TODO: move this into another file...

	constructor(r, data) {
		
		super();
		
		this._renderable = r;
		this._x = data[0];
		this._y = data[1];
		this._z = data[2];
		
		this._data = data; // TODO: remove this
	}
	
	render(modelView) {

		modelView.saveMvMatrix();
		mat4.translate(modelView.mvMatrix, this._data); // TODO: use modelView.translate
		this._renderable.render(modelView);
		modelView.restoreMvMatrix();
	}
}


class RotateTransform extends Renderable {

	// TODO: move this into another file
	

	constructor(r, angle, axis, about) {
		
		super();
		
		this._renderable = r;
		this._axis = axis; // TODO: create Float array?
		this._angle = angle*(Math.PI / 180);
	}
	
	render(modelView) {

		modelView.saveMvMatrix();
		//##mat4.rotate(modelView.mvMatrix, this._angle, this._axis);
		mat4.rotate(modelView.mvMatrix, 2*Math.PI*((Date.now()%5000)/5000), this._axis);
		this._renderable.render(modelView);
		modelView.restoreMvMatrix();
	}
}


class WorldModel extends Model {
	
	
	constructor() {
		
		super();
		this._objects = [];
	}
	
	
	/** @inheritDoc */
	render(modelView) {

		for(let i = 0, imax = this._objects.length; i < imax; i++) {
			this._objects[i].render(modelView);
		}
	}
	
	
	/** @inheritDoc */
	configureAsync(data, loader) {
		
		const promises = [];
		const models = new Map();

		for(let i in data.models) {
			promises.push(this._loadModel(models, i, data.models[i], loader));
		}

		return Promise.all(promises).then(
			() => {
				this._parseObjects(models, data.objects);
				this._parseVehicles(models, data.vehicles);
			}
		);
	}
	
	
	_loadModel(models, key, path, loader) {		

		return Model
			.loadAsync(path, loader)
			.then(model => models.set(key, model));
	}
	
	
	_parseObjects(models, config) {
		
		// TODO: cleanup

		for(let i = 0; i < config.length; i++) {

			let entry = config[i];
			let model = this._getModelOrThrow(models, entry.model);
			
			const transform = entry.transform;

			if(typeof transform === "object") {
				if(transform instanceof Array) {
					for(let j = 0; j < transform.length; j++) {
						model = this._applyTransform(model, transform[j]);
					}
				} else {
					model = this._applyTransform(model, transform);
				}
			}
			
			this._objects.push(model);
		}
	}
	
	
	_applyTransform(model, config) {
		
		// TODO: cleanup
		
		if(config.translate) {
			return new TranslateTransform(model, config.translate);
		}
		
		if(config.rotate) {
			// TODO: default axis, default about?
			return new RotateTransform(model, config.rotate, config.axis, config.about)
		}
		
		// TODO: warn 'unknown transform'
		
		return model;
	}
	
	
	_parseVehicles(models, config) {
				
		const ground = this._getModelOrThrow(models, "ground");
		
		for(let i = 0; i < config.length; i++) {

			const entry = config[i];
			const count = entry.count || 0;
			const model = this._getModelOrThrow(models, entry.model);
			
			for(let j = 0; j < count; j++) {
				this._objects.push(new Vehicle(model, ground));
			}
		}
	}
	
	
	_getModelOrThrow(models, key) {
		
		const model = models.get(key) || null;
		if(!model) {
			throw new Error(`No model with key=${key}`);
		}
		return model;
	}
}
