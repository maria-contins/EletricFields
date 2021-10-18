import * as UTILS from "../../libs/utils.js";
import * as MV from "../../libs/MV.js";
import { flatten, vec4, sizeof } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */

const table_width = 3.0;
const MAX_POINTS = 1000;
const grid_spacing = 0.05;
let colors = [];
let vertices = [];
let newVertices = [];
let table_height;
let gl;
let program;

function animate(time) {
	window.requestAnimationFrame(animate);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(program);

	let dim = gl.getUniformLocation(program, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	/* let vColor = gl.getUniformLocation(program, "vColor");
	gl.uniform4f(vColor, 1.0, 1.0, 1.0, 1.0); // white */
	gl.drawArrays(gl.POINTS, 0, vertices.length + newVertices.length);
	/* gl.uniform4f(vColor, 1.0, 0.0, 0.0, 1.0); // Red */
	/* gl.drawArrays(gl.POINTS, vertices.length, newVertices.length); */
}

function get_color(coordinates) {
	let red = MV.vec4(1.0, 0.0, 0.0, 1.0);
	let green = MV.vec4(0.0, 1.0, 0.0, 1.0);
	let blue = MV.vec4(0.0, 0.0, 1.0, 1.0);
	let orange = MV.vec4(1.0, 0.84, 0.0, 1.0);

	let force = MV.vec2(-1.0, 1.0);
}

function setup(shaders) {
	const canvas = document.getElementById("gl-canvas");
	gl = UTILS.setupWebGL(canvas);

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	table_height = (table_width * canvas.height) / canvas.width;

	program = UTILS.buildProgramFromSources(
		gl,
		shaders["shader1.vert"],
		shaders["shader1.frag"]
	);

	for (let x = -(table_width / 2); x <= table_width / 2; x += grid_spacing) {
		for (
			let y = -(table_height / 2);
			y <= table_height / 2;
			y += grid_spacing
		) {
			vertices.push(MV.vec2(x, y));
			colors.push(MV.vec4(1.0, 1.0, 0.0, 1.0));
		}
	}

	window.addEventListener("resize", function (event) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		table_height = (table_width * canvas.height) / canvas.width;
		gl.viewport(0, 0, canvas.width, canvas.height);
	});

	canvas.addEventListener("click", function (event) {
		// Start by getting x and y coordinates inside the canvas element
		const x = event.offsetX;
		const y = event.offsetY;

		let Tx = (x * table_width) / window.innerWidth - table_width / 2;
		let Ty = -1 * ((y * table_height) / window.innerHeight - table_height / 2);

		newVertices.push(MV.vec2(Tx, Ty));

		gl.bufferSubData(
			gl.ARRAY_BUFFER,
			vertices.length * sizeof["vec2"] /* + colors.length * sizeof["vec4"] */,
			flatten(newVertices)
		);
		console.log("Click at (" + Tx + ", " + Ty + ")");
	});

	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"] +
			colors.length * sizeof["vec4"] +
			MAX_POINTS * sizeof["vec2"],
		gl.STATIC_DRAW
	);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"],
		flatten(colors)
	);

	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	const vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(
		vColor,
		4,
		gl.FLOAT,
		false,
		0,
		vertices.length * sizeof["vec2"]
	);
	gl.enableVertexAttribArray(vColor);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then((s) =>
	setup(s)
);
