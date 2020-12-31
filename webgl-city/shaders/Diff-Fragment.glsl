/* Basic diffuse lighting fragment shader */

precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

uniform sampler2D uSampler;

void main(void) {
	vec4 textureColor = texture2D(uSampler, vTextureCoord);
	gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
}
