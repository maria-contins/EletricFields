import * as UTILS from "../../libs/utils.js";
import * as MV from "../../libs/MV.js";
import { flatten, vec4, sizeof } from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */

const table_width = 3.0;
const MAX_CHARGES = 20;
const grid_spacing = 0.05;
const THETA_VARIATION = 0.01;
let vBufferGrid;
let vBufferCharge;
let cBufferGrid;
let cBufferCharge;
/* let colors = []; */
let newColors = [];
let vertices = [];
let negativeCharges = [];
let positiveCharges = [];
let table_height;
let gl;
let program1;
let program2;

function rotateCharges() {
	// Iterate through every element that has a negative charge
	for (const element of negativeCharges) {
		let x = element[0];
		let y = element[1];

		// Calculate our points new position after we rotate it THETA_VARIATION radians
		// around the center of our window
		let nx = x * Math.cos(THETA_VARIATION) - y * -Math.sin(THETA_VARIATION);
		let ny = x * -Math.sin(THETA_VARIATION) + y * Math.cos(THETA_VARIATION);

		// Set those new points
		element[0] = nx;
		element[1] = ny;
	}

	// Iterate through every element that has a positive charge
	for (const element of positiveCharges) {
		let x = element[0];
		let y = element[1];

		// Calculate our points new position after we rotate it THETA_VARIATION radians
		// around the center of our window
		let nx = x * Math.cos(THETA_VARIATION) - y * Math.sin(THETA_VARIATION);
		let ny = x * Math.sin(THETA_VARIATION) + y * Math.cos(THETA_VARIATION);

		// Set those new points
		element[0] = nx;
		element[1] = ny;
	}

	// We concatenate the two arrays together because they're not ordered in our buffer
	// and we don't want to overwrite any point
	let arr = positiveCharges.concat(negativeCharges);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		0 /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);
}

function addCharge(offsetX, offsetY, collection, charge) {
	const x = offsetX;
	const y = offsetY;
	// We calculate and push the position of our new charge
	collection.push(
		MV.vec3(
			(x * table_width) / window.innerWidth - table_width / 2,
			-1 * ((y * table_height) / window.innerHeight - table_height / 2),
			charge
		)
	);

	// We concatenate the two arrays together because they're not ordered in our buffer
	// and we don't want to overwrite any point
	let arr = positiveCharges.concat(negativeCharges);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferSubData(
		gl.ARRAY_BUFFER,
		0 /* + colors.length * sizeof["vec4"] */,
		flatten(arr)
	);

	// We push the color of our new point
	newColors.push(MV.vec4(1.0, 0.0, 0.0, 1.0));

	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferCharge);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(newColors));
	console.log("Click at (" + x + ", " + y + ")");
}

function setup(shaders) {
	// Start up the canvas
	const canvas = document.getElementById("gl-canvas");
	gl = UTILS.setupWebGL(canvas);

	// Set the canvas size and calculate the table_height with the ratio we have from the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	table_height = (table_width * canvas.height) / canvas.width;

	// Start up the program that we will use to draw our background grid lines
	program1 = UTILS.buildProgramFromSources(
		gl,
		shaders["shader1.vert"],
		shaders["shader1.frag"]
	);

	// Start up the program that we will use to draw our charges
	program2 = UTILS.buildProgramFromSources(
		gl,
		shaders["shader2.vert"],
		shaders["shader1.frag"]
	);

	gl.lineWidth(2.0);

	// Setup the points we will use to set up our lines
	for (let x = -(table_width / 2); x <= table_width / 2; x += grid_spacing) {
		for (
			let y = -(table_height / 2);
			y <= table_height / 2;
			y += grid_spacing
		) {
			vertices.push(MV.vec3(x, y, 0.0));
			vertices.push(MV.vec3(x, y, 1.0));
		}
	}

	// Recalculate our canvas window and the height of our table everytime we resize the browser
	window.addEventListener("resize", function (event) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		table_height = (table_width * canvas.height) / canvas.width;
		gl.viewport(0, 0, canvas.width, canvas.height);
	});

	// Add the negative or positive charge everytime we click on our browser
	canvas.addEventListener("click", function (event) {
		// See if the shift key was held down or not during the click event
		if (event.shiftKey) {
			addCharge(event.offsetX, event.offsetY, positiveCharges, 1.0);
		} else {
			addCharge(event.offsetX, event.offsetY, negativeCharges, -1.0);
		}
	});

	// Create the buffer to hold our grid points.
	vBufferGrid = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGrid);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	// Create the buffer to ohld our charge points
	vBufferCharge = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	// We will hold a variable amount of points so we initialize it with the maximum amount
	// of memory we need to hold the specified MAX_CHARGES
	gl.bufferData(gl.ARRAY_BUFFER, MAX_CHARGES * sizeof["vec3"], gl.STATIC_DRAW);

	// Create the buffer to hold the colors for our grid points
	/* cBufferGrid = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferGrid);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW); */

	cBufferCharge = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferCharge);
	gl.bufferData(gl.ARRAY_BUFFER, MAX_CHARGES * sizeof["vec4"], gl.STATIC_DRAW);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	window.requestAnimationFrame(animate);
}

function drawProgramGrid() {
	// Use our background grid program and bind the buffer for the positions of those points
	gl.useProgram(program1);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGrid);

	// Enable the attribute to hold the positions of our grid points
	const vPositionGrid = gl.getAttribLocation(program1, "vPosition");
	gl.vertexAttribPointer(vPositionGrid, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionGrid);

	// Fixable by binding buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferGrid);

	// Enable the attribute to hold the color for our grid points
	/* const vColorGrid = gl.getAttribLocation(program1, "vColor");
	gl.vertexAttribPointer(vColorGrid, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColorGrid);*/

	let dim = gl.getUniformLocation(program1, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	let arr = positiveCharges.concat(negativeCharges);

	for (let i = 0; i < MAX_CHARGES && i < arr.length; i++) {
		const uPosition = gl.getUniformLocation(program1, "uPosition[" + i + "]");
		gl.uniform3fv(uPosition, MV.vec3(arr[i][0], arr[i][1], arr[i][2]));
	}

	gl.drawArrays(gl.LINES, 0, vertices.length);
}

function drawProgramCharges() {
	// Use our charges program and bind the buffer for the positions of those points
	gl.useProgram(program2);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);

	// Enable the attribute to hold the positions of our charge points
	const vPositionCharge = gl.getAttribLocation(program2, "vPosition");
	gl.vertexAttribPointer(vPositionCharge, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionCharge);

	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferCharge);

	// Enable the attribute to hold the color for our grid points
	const vColorCharge = gl.getAttribLocation(program2, "vColor");
	gl.vertexAttribPointer(vColorCharge, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColorCharge);

	let dim = gl.getUniformLocation(program2, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	gl.drawArrays(gl.POINTS, 0, negativeCharges.length + positiveCharges.length);
}

function animate(time) {
	// Clear our canvas
	gl.clear(gl.COLOR_BUFFER_BIT);

	drawProgramGrid();
	drawProgramCharges();

	// Rotate the charges so we can draw them the next cycle
	rotateCharges();

	window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS([
	"shader1.vert",
	"shader2.vert",
	"shader1.frag",
]).then((s) => setup(s));