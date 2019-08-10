/* Vertex shader for solid lines */

attribute vec3 aVertexPosition;

uniform mat4 uMvMatrix;
uniform mat4 uPjMatrix;

void main(void) {
 	gl_Position = uPjMatrix * uMvMatrix * vec4(aVertexPosition, 1.0);
}
