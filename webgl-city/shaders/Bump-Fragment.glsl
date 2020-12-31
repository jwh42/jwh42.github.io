/* bump-map fragment shader */

precision mediump float;

uniform sampler2D tex_diffuse;
uniform sampler2D tex_bumpMap;

varying vec2 frag_uv;
varying vec3 ts_light_dir;
varying vec3 ts_frag_pos;


void main(void) {

	// TODO: notes for later for point-light... ('to convert to point light, light_pos - frag_pos')
	//vec3 light_dir = normalize(ts_light_pos - ts_frag_pos);
	//vec3 view_dir = normalize(ts_view_pos - ts_frag_pos);

	vec3 albedo = texture2D(tex_diffuse, frag_uv).rgb;
	//vec3 albedo = texture2D(tex_bumpMap, frag_uv).rgb;

	vec3 ambient = vec3(0.3, 0.3, 0.3); // TODO: configure ambient light
	vec3 directionalColor = vec3(0.8, 0.8, 0.8); // TODO: configure directional light color

	vec3 norm = normalize(texture2D(tex_bumpMap, frag_uv).rgb * 2.0 - 1.0);
	//vec3 norm = normalize(vec3(0.5, 0.5, 1).rgb * 2.0 - 1.0);

	float directionalWeight = max(dot(norm, ts_light_dir), 0.0);
	vec3 lightWeighting = ambient + directionalColor * directionalWeight;

	gl_FragColor = vec4(lightWeighting * albedo, 1.0);
	//gl_FragColor = vec4(directionalWeight, directionalWeight, directionalWeight, 1.0);
}
