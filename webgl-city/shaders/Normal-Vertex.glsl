/* Renders normals as red dots */

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void) {
	gl_PointSize = 3.0;
 	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + 1.0*aVertexNormal, 1.0);
}
