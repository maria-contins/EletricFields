import * as UTILS from "../../libs/utils.js";
import * as MV from "../../libs/MV.js";
import { flatten, vec4, sizeof } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */

const table_width = 3.0;
const MAX_POINTS = 20;
const grid_spacing = 0.05;
let colors = [];
let newColors = [];
let vertices = [];
let newVertices = [];
let table_height;
let gl;
let program;

function animate(time) {
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

/* function get_color(coordinates) {
	// Left up
	let red = MV.vec4(1.0, 0.0, 0.0, 1.0);
	// Right up
	let green = MV.vec4(0.0, 1.0, 0.0, 1.0);
	// Right down
	let blue = MV.vec4(0.0, 0.0, 1.0, 1.0);
	// Left down
	let orange = MV.vec4(1.0, 0.84, 0.0, 1.0);

	let x = coordinates[0];
	let y = coordinates[1];

	let closeToLeftUpX = (x / -1.5 + 1) * 50;
	let closeToLeftUpY = (y / (table_height / 2) + 1) * 50;
	let closeToLeftUpPercentage = (closeToLeftUpX / 2 + closeToLeftUpY / 2) / 10;

	let closeToRightUpX = (x / 1.5 + 1) * 50;
	let closeToRightUpY = (y / (table_height / 2) + 1) * 50;
	let closeToRightUpPercentage =
		(closeToRightUpX / 2 + closeToRightUpY / 2) / 100;

	let closeToLeftDownX = (x / -1.5 + 1) * 50;
	let closeToLeftDownY = (y / (-table_height / 2) + 1) * 50;
	let closeToLeftDownPercentage =
		(closeToLeftDownX / 2 + closeToLeftDownY / 2) / 100;

	let closeToRightDownX = (x / 1.5 + 1) * 50;
	let closeToRightDownY = (y / (-table_height / 2) + 1) * 50;
	let closeToRightDownpercentage =
		(closeToRightDownX / 2 + closeToRightDownY / 2) / 100;

	let test = MV.vec4();

	let debug = 1 + 1;
} */

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
			colors.push(MV.vec4(0.5, 1.0, 0.5, 1.0));
			/* get_color(MV.vec2(x, y)); */
		}
	}

	window.addEventListener("resize", function (event) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		table_height = (table_width * canvas.height) / canvas.width;
		gl.viewport(0, 0, canvas.width, canvas.height);
		window.requestAnimationFrame(animate);
	});

	canvas.addEventListener("click", function (event) {
		// Start by getting x and y coordinates inside the canvas element
		const x = event.offsetX;
		const y = event.offsetY;
		newVertices.push(
			MV.vec2(
				(x * table_width) / window.innerWidth - table_width / 2,
				-1 * ((y * table_height) / window.innerHeight - table_height / 2)
			)
		);

		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferSubData(
			gl.ARRAY_BUFFER,
			vertices.length * sizeof["vec2"] /* + colors.length * sizeof["vec4"] */,
			flatten(newVertices)
		);

		newColors.push(MV.vec4(1.5, 0.0, 0.5, 1.0));

		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferSubData(
			gl.ARRAY_BUFFER,
			colors.length * sizeof["vec4"],
			flatten(newColors)
		);
		console.log("Click at (" + x + ", " + y + ")");
		window.requestAnimationFrame(animate);
	});

	const vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"] + MAX_POINTS * sizeof["vec2"],
		gl.STATIC_DRAW
	);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	const cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		colors.length * sizeof["vec4"] + MAX_POINTS * sizeof["vec4"],
		gl.STATIC_DRAW
	);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));

	const vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then((s) =>
	setup(s)
);
