//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class Model extends Renderable {
	
	
	/*abstract*/ configureAsync(data, loader) {
		return Promise.resolve();
	}


	/**
	 * Loads a model from a resource file
	 * @param path Path to the resource file
	 * @param loader Access to other resources */
	static loadAsync(path, loader) {
		return fetch(path)
			.then(response => response.json())
			.then(json => this.parseAsync(json, loader))
			.catch(error => {
				console.error(`Could not load ${path}`, error);
				throw error;
			});
	}

	
	/**
	 * Parses a model from a JSON file
	 * @param data JSON content to parse
	 * @param loader Access to other resources */
	static parseAsync(data, loader) {
		
		const typeRef = loader.getModelType(data.type);
		const model = new typeRef(loader.gl);
		
		return model.configureAsync(data, loader).then(() => model);
	}
}
