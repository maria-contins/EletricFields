import * as UTILS from "../../libs/utils.js";
import * as MV from "../../libs/MV.js";
import { flatten, vec4, sizeof } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */

const table_width = 3.0;
const MAX_POINTS = 20;
const grid_spacing = 0.05;
const THETA_VARIATION = 0.01;
let vBufferGrid;
let vBufferCharge;
let cBufferGrid;
let cBufferCharge;
let colors = [];
let newColors = [];
let vertices = [];
let negativeCharges = [];
let positiveCharges = [];
let table_height;
let gl;
let program1;
let program2;

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
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		0 /* + colors.length * sizeof["vec4"] */,
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

	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		0 /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);

	newColors.push(MV.vec4(1.0, 1.0, 0.0, 1.0));

	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferGrid);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		colors.length * sizeof["vec4"],
		flatten(newColors)
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
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		0 /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);

	newColors.push(MV.vec4(1.0, 1.0, 0.0, 1.0));

	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferGrid);
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

	program1 = UTILS.buildProgramFromSources(
		gl,
		shaders["shader1.vert"],
		shaders["shader1.frag"]
	);

	program2 = UTILS.buildProgramFromSources(
		gl,
		shaders["shader2.vert"],
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

	vBufferGrid = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGrid);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		vertices.length * sizeof["vec2"],
		gl.STATIC_DRAW
	);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

	vBufferCharge = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferData(gl.ARRAY_BUFFER, MAX_POINTS * sizeof["vec2"], gl.STATIC_DRAW);

	cBufferGrid = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferGrid);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		colors.length * sizeof["vec4"] + MAX_POINTS * sizeof["vec4"],
		gl.STATIC_DRAW
	);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));

	const vColor = gl.getAttribLocation(program1, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	window.requestAnimationFrame(animate);
}

function animate(time) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(program1);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGrid);

	const vPositionGrid = gl.getAttribLocation(program1, "vPosition");
	gl.vertexAttribPointer(vPositionGrid, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionGrid);

	let dim = gl.getUniformLocation(program1, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	gl.drawArrays(gl.POINTS, 0, vertices.length);

	gl.useProgram(program2);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);

	dim = gl.getUniformLocation(program2, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	const vPositionCharge = gl.getAttribLocation(program2, "vPosition");
	gl.vertexAttribPointer(vPositionCharge, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionCharge);

	gl.drawArrays(gl.POINTS, 0, negativeCharges.length + positiveCharges.length);

	rotateCharges();

	window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS([
	"shader1.vert",
	"shader2.vert",
	"shader1.frag",
]).then((s) => setup(s));
