/* bump-map vertex shader */

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexTangent;
attribute vec2 aTextureCoord;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uDirectionalVector;

uniform mat4 uModelViewPrj;
uniform mat4 uModelView;
uniform mat3 uNormalInvT;
uniform mat3 uLookAtInvT;

varying vec2 frag_uv;
varying vec3 ts_light_dir; // Tangent space values
varying vec3 ts_view_pos;  //
varying vec3 ts_frag_pos;  //


mat3 transpose(in mat3 m) {

	vec3 i0 = m[0];
	vec3 i1 = m[1];
	vec3 i2 = m[2];

	return mat3(
		vec3(i0.x, i1.x, i2.x),
		vec3(i0.y, i1.y, i2.y),
		vec3(i0.z, i1.z, i2.z)
	);
}

void main(void) {

	vec3 vert_norm = aVertexNormal;
	vec3 vert_tang = aVertexTangent;
	vec3 vert_bitang = cross(vert_norm, vert_tang);

	vec3 t = normalize(uNormalInvT * vert_tang);
	vec3 b = normalize(uNormalInvT * vert_bitang);
	vec3 n = normalize(uNormalInvT * vert_norm);
	mat3 tbn = transpose(mat3(t, b, n));

	ts_light_dir = tbn * uLookAtInvT * normalize(uDirectionalVector);
	ts_view_pos = tbn * vec3(0, 0, 0);
	ts_frag_pos = tbn * vec3(uModelView * vec4(aVertexPosition, 1.0));
	gl_Position = uModelViewPrj * vec4(aVertexPosition, 1.0);

	frag_uv = aTextureCoord;
}
