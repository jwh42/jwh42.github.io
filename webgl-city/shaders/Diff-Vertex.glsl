/* Basic diffuse lighting vertex shader */

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
uniform vec3 uDirectionalVector;

uniform mat4 uModelViewPrj;
uniform mat3 uNormalInvT;
uniform mat3 uLookAtInvT;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;


void main(void) {

	vec3 transformedNormal = uNormalInvT * aVertexNormal;
	vec3 transformedLight = normalize(uLookAtInvT * uDirectionalVector);
	float directionalWeight = max(dot(transformedNormal, transformedLight), 0.0);

	vTextureCoord = aTextureCoord;
	vLightWeighting = uAmbientColor + uDirectionalColor * directionalWeight;

	gl_Position = uModelViewPrj * vec4(aVertexPosition, 1.0);
}
