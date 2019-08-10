//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

class Spline3 {


	// Catmull-Rom method applied to Cubic Hermite spline
	// using interpolation on a single interval:
	// https://en.wikipedia.org/wiki/Cubic_Hermite_spline

	
	get count() { return this._count; }

	
	getX(index) { return this._points[3*index+0]; }	
	getY(index) { return this._points[3*index+1]; }	
	getZ(index) { return this._points[3*index+0]; }

	
	constructor(count) {

		this._count = count;
		this._tempV4 = new Float32Array(4);
		this._tempM4 = new Float32Array(4*4);
		this._points = new Float32Array(3*this._count);
		this._tangents = new Float32Array(3*this._count);
	}


	set(index, x, y, z) {

		const p0 = 3*index;
		const pts = this._points;
		pts[p0+0] = x;
		pts[p0+1] = y;
		pts[p0+2] = z;

		this._recalcTangent(Math.max(index - 1, 0));
		this._recalcTangent(Math.min(index + 1, this._count - 1));
	}
	
	
	createBuffer(gl) {
		
		const buffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this._points, gl.STATIC_DRAW);

		return buffer;
	}


	interpolate(out, iout, t) {

		const pt = this._points;
		
		const clampT = Math.min(Math.max(t, 0.0), 1.0);
		const indexF = clampT*(this._count - 1);
		const indexI = indexF | 0;
		const deltaT = indexF - indexI;

		if(deltaT <= 0.0) {
			V3_copy_V3(out, iout, pt, indexI);
			return;
		}

		if(deltaT >= 1.0) {
			V3_copy_V3(out, iout, pt, indexI+1);
			return;
		}

		// get powers of T
		const v4 = this._tempV4;
		v4[0] = deltaT*deltaT*deltaT;
		v4[1] = deltaT*deltaT;
		v4[2] = deltaT;
		v4[3] = 1.0;
	
		// calculate m4 = Matrix4(pts1, tan1, pts2, tan2)
		const p0 = 3*indexI;
		const tn = this._tangents;
		const m4 = this._tempM4;
		const h4 = Spline3._hermite;
		m4[ 0] = pt[p0+0]; m4[ 1] = tn[p0+0]; m4[ 2] = pt[p0+3]; m4[ 3] = tn[p0+3];
		m4[ 4] = pt[p0+1]; m4[ 5] = tn[p0+1]; m4[ 6] = pt[p0+4]; m4[ 7] = tn[p0+4];
		m4[ 8] = pt[p0+2]; m4[ 9] = tn[p0+2]; m4[10] = pt[p0+5]; m4[11] = tn[p0+5];
		m4[12] = 1.0;      m4[13] = 1.0;      m4[14] = 1.0;      m4[15] = 1.0;

		// calculate [pts1|tan1|pts2|tan2] * (hermite*powers)
		M4_mul_V4(v4, 0, h4, v4, 0);
		M4_mul_V4(v4, 0, m4, v4, 0);
		V3_copy_V3(out, iout, v4, 0);
	}

	
	_recalcTangent(index) {

		// Tangents[ 0 ] = 0.5*(Points[ 1 ] - Points[ 0 ])
		// Tangents[ i ] = 0.5*(Points[i+1] - Points[i-1])
		// Tangents[N-1] = 0.5*(Points[N-1] - Points[N-2])

		const points = this._points;
		const tans = this._tangents;
		const prevI = Math.max(index - 1, 0);
		const nextI = Math.min(index + 1, this._count - 1);

		V3_sub_V3(tans, index, points, nextI, points, prevI);
		V3_mul_S1(tans, index, tans, index, 0.5);
	}
}

// Hermite polynomial coefficients
Spline3._hermite = new Float32Array([
	 2,-3, 0, 1,  // *point0
	 1,-2, 1, 0,  // *tangent0
	-2, 3, 0, 0,  // *point1
	 1,-1, 0, 0   // *tangent1
]);
