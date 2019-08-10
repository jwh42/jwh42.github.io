/* Flat/no-lighting shader */

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMvMatrix;
uniform mat4 uPjMatrix;

varying vec2 vTextureCoord;

void main(void) {
 	gl_Position = uPjMatrix * uMvMatrix * vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
}
