/* Flat/no-lighting vertex shader */

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMvpMatrix;

varying vec2 vTextureCoord;

void main(void) {
 	gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
}
