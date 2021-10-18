import * as UTILS from "../../libs/utils.js";
import * as MV from "../../libs/MV.js";
import { flatten, vec4, sizeof } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */

const table_width = 3.0;
const MAX_POINTS = 2000;
const grid_spacing = 0.05;
const THETA_VARIATION = 0.01;
let vBuffer;
let cBuffer;
let colors = [];
let newColors = [];
let vertices = [];
let negativeCharges = [];
let positiveCharges = [];
let table_height;
let gl;
let program;

function whichQuadrant(coordinates) {
	if (coordinates[0] > 0) {
		if (coordinates[1] > 0) {
			return 1;
		} else {
			return 4;
		}
	} else {
		if (coordinates[1] > 0) {
			return 2;
		} else {
			return 3;
		}
	}
}

function animate(time) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(program);

	let dim = gl.getUniformLocation(program, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	/* let vColor = gl.getUniformLocation(program, "vColor");
	gl.uniform4f(vColor, 1.0, 1.0, 1.0, 1.0); // white */
	gl.drawArrays(
		gl.POINTS,
		0,
		vertices.length + negativeCharges.length + positiveCharges.length
	);
	/* gl.uniform4f(vColor, 1.0, 0.0, 0.0, 1.0); // Red */
	/* gl.drawArrays(gl.POINTS, vertices.length, negativeCharges.length); */

	rotateCharges();

	window.requestAnimationFrame(animate);
}

function rotateCharges() {
	for (const element of negativeCharges) {
		let quadrant = whichQuadrant(element);
		let x = element[0];
		let y = element[1];
		let h = Math.hypot(x, y);

		let theta = Math.asin(y) + THETA_VARIATION;

		let nx = x * Math.cos(THETA_VARIATION) - y * -Math.sin(THETA_VARIATION);
		let ny = x * -Math.sin(THETA_VARIATION) + y * Math.cos(THETA_VARIATION);

		element[0] = nx;
		element[1] = ny;
	}

	for (const element of positiveCharges) {
		let quadrant = whichQuadrant(element);
		let x = element[0];
		let y = element[1];
		let h = Math.hypot(x, y);

		let theta = Math.asin(y) + THETA_VARIATION;

		let nx = x * Math.cos(THETA_VARIATION) - y * Math.sin(THETA_VARIATION);
		let ny = x * Math.sin(THETA_VARIATION) + y * Math.cos(THETA_VARIATION);

		element[0] = nx;
		element[1] = ny;
	}

	let arr = positiveCharges.concat(negativeCharges);

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"] /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);
}

function addPositiveCharge(offsetX, offsetY) {
	const x = offsetX;
	const y = offsetY;
	positiveCharges.push(
		MV.vec2(
			(x * table_width) / window.innerWidth - table_width / 2,
			-1 * ((y * table_height) / window.innerHeight - table_height / 2)
		)
	);

	let arr = positiveCharges.concat(negativeCharges);

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"] /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);

	newColors.push(MV.vec4(1.0, 1.0, 0.0, 1.0));

	let arr = positiveCharges.concat(negativeCharges);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"] /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);
	console.log("Click at (" + x + ", " + y + ")");
}

function addNegativeCharge(offsetX, offsetY) {
	const x = offsetX;
	const y = offsetY;
	negativeCharges.push(
		MV.vec2(
			(x * table_width) / window.innerWidth - table_width / 2,
			-1 * ((y * table_height) / window.innerHeight - table_height / 2)
		)
	);
	let arr = positiveCharges.concat(negativeCharges);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"] /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);

	newColors.push(MV.vec4(1.5, 0.0, 0.5, 1.0));

	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		colors.length * sizeof["vec4"],
		flatten(newColors)
	);
	console.log("Click at (" + x + ", " + y + ")");
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
			colors.push(MV.vec4(0.5, 1.0, 0.5, 1.0));
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
		if (event.shiftKey) {
			addPositiveCharge(event.offsetX, event.offsetY);
		} else {
			addNegativeCharge(event.offsetX, event.offsetY);
		}
	});

	vBuffer = gl.createBuffer();
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

	cBuffer = gl.createBuffer();
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
