//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

function throwIfNull(value, name) {
	if(value == null) {
		throw new Error("Argument cannot be null: "+name);
	}
	return value;
}
