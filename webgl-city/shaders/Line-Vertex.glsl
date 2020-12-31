/* Vertex shader for solid lines */

attribute vec3 aVertexPosition;
uniform mat4 uMvpMatrix;

void main(void) {
 	gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
}
