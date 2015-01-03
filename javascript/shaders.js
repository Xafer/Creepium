THREE.PixelShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

        "varying vec2 vUv;",
	    "uniform sampler2D tDiffuse;",

        "void main() {",
            "vec2 p = vUv;",
            "p.x = floor(p.x*160.0)/160.0;",
            "p.y = floor(p.y*90.0)/90.0;",
            "vec4 color = texture2D(tDiffuse, p);",
            "gl_FragColor.r = floor(color.r*12.0)/12.0;",
            "gl_FragColor.g = floor(color.g*12.0)/12.0;",
            "gl_FragColor.b = floor(color.b*12.0)/12.0;",
        "}"

	].join("\n")

};
