//----------------------------------------------------------------------//
// Copyright (c) 2018 - Justin Hoffman (justin.w.hoffman@gmail.com)     //
//----------------------------------------------------------------------//

function V3_mul_S1(out, iout, v, iv, scalar) {

	const obase = 3*iout;
	const vbase = 3*iv;
	out[obase+0] = scalar*v[vbase+0];
	out[obase+1] = scalar*v[vbase+1];
	out[obase+2] = scalar*v[vbase+2];
}


function V3_add_V3(out, iout, x, ix, y, iy) {

	const obase = 3*iout;
	const xbase = 3*ix;
	const ybase = 3*iy;
	out[obase+0] = x[xbase+0] + y[ybase+0];
	out[obase+1] = x[xbase+1] + y[ybase+1];
	out[obase+2] = x[xbase+2] + y[ybase+2];
}


function V3_sub_V3(out, iout, x, ix, y, iy) {

	const o0 = 3*iout;
	const x0 = 3*ix;
	const y0 = 3*iy;
	out[o0+0] = x[x0+0] - y[y0+0];
	out[o0+1] = x[x0+1] - y[y0+1];
	out[o0+2] = x[x0+2] - y[y0+2];
}


function V3_copy_V3(out, iout, v, iv) {

	const o0 = 3*iout;
	const v0 = 3*iv;
	out[o0+0] = v[v0+0];
	out[o0+1] = v[v0+1];
	out[o0+2] = v[v0+2];
}


function M4_mul_V4(out, iout, m, v, iv) {

	// this method should work even if buffers overlap

	const ooff = 4*iout;
	const voff = 4*iv;
	
	const v0 = v[voff+0];
	const v1 = v[voff+1];
	const v2 = v[voff+2];
	const v3 = v[voff+3];

	out[ooff+0] = v0*m[ 0] + v1*m[ 1] + v2*m[ 2] + v3*m[ 3];
	out[ooff+1] = v0*m[ 4] + v1*m[ 5] + v2*m[ 6] + v3*m[ 7];
	out[ooff+2] = v0*m[ 8] + v1*m[ 9] + v2*m[10] + v3*m[11];
	out[ooff+3] = v0*m[12] + v1*m[13] + v2*m[14] + v3*m[15];
}


function M4_mul_M4(out, x, y) {

	// this method should work even if buffers overlap

	const x00 = x[ 0], x01 = x[ 1], x02 = x[ 2], x03 = x[ 3];
	const x10 = x[ 4], x11 = x[ 5], x12 = x[ 6], x13 = x[ 7];
	const x20 = x[ 8], x21 = x[ 9], x22 = x[10], x23 = x[11];
	const x30 = x[12], x31 = x[13], x32 = x[14], x33 = x[15];

	let y0 = y[0], y1 = y[1], y2 = y[2], y3 = y[3];
	out[ 0] = y0*x00 + y1*x10 + y2*x20 + y3*x30;
	out[ 1] = y0*x01 + y1*x11 + y2*x21 + y3*x31;
	out[ 2] = y0*x02 + y1*x12 + y2*x22 + y3*x32;
	out[ 3] = y0*x03 + y1*x13 + y2*x23 + y3*x33;

	y0 = y[4]; y1 = y[5]; y2 = y[6]; y3 = y[7];
	out[ 4] = y0*x00 + y1*x10 + y2*x20 + y3*x30;
	out[ 5] = y0*x01 + y1*x11 + y2*x21 + y3*x31;
	out[ 6] = y0*x02 + y1*x12 + y2*x22 + y3*x32;
	out[ 7] = y0*x03 + y1*x13 + y2*x23 + y3*x33;

	y0 = y[8]; y1 = y[9]; y2 = y[10]; y3 = y[11];
	out[ 8] = y0*x00 + y1*x10 + y2*x20 + y3*x30;
	out[ 9] = y0*x01 + y1*x11 + y2*x21 + y3*x31;
	out[10] = y0*x02 + y1*x12 + y2*x22 + y3*x32;
	out[11] = y0*x03 + y1*x13 + y2*x23 + y3*x33;

	y0 = y[12]; y1 = y[13]; y2 = y[14]; y3 = y[15];
	out[12] = y0*x00 + y1*x10 + y2*x20 + y3*x30;
	out[13] = y0*x01 + y1*x11 + y2*x21 + y3*x31;
	out[14] = y0*x02 + y1*x12 + y2*x22 + y3*x32;
	out[15] = y0*x03 + y1*x13 + y2*x23 + y3*x33;
}
