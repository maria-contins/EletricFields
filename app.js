// IMPORTS
import * as UTILS from "../../libs/utils.js";
import * as MV from "../../libs/MV.js";
import {flatten, sizeof} from "../../libs/MV.js";

/** @type {number} */

// CONSTANTS
const table_width = 3.0;
const MAX_CHARGES = 20;
const GRID_SPACING = 0.05;
const THETA_VARIATION = 0.01;
// PROGRAM/BUFFER VARIABLES
let gl;
let program1;
let program2;
let vBufferGrid;
let vBufferCharge;
let cBufferGrid;
// ARRAYS
let vertices = [];
let negativeCharges = [];
let positiveCharges = [];
// OTHER VARIABLES
let table_height;
let chargesOn = true;

// SET UP

/**
 * Set up for window animation
 * @param shaders
 */
function setup(shaders) {
	// Start up the canvas
	const canvas = document.getElementById("gl-canvas");
	gl = UTILS.setupWebGL(canvas);

	// Set the canvas size and calculate the table_height with the ratio we have from the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	table_height = (table_width * canvas.height) / canvas.width;

	// set up program1: used to draw our background grid lines
	program1 = UTILS.buildProgramFromSources(
		gl,
		shaders["shader1.vert"],
		shaders["shader1.frag"]
	);

	// set up program2: used to draw our charges
	program2 = UTILS.buildProgramFromSources(
		gl,
		shaders["shader2.vert"],
		shaders["shader2.frag"]
	);

	// Setup the grid points
	for (let x = -(table_width / 2); x <= table_width / 2; x += GRID_SPACING) {
		for (let y = -(table_height / 2); y <= table_height / 2; y += GRID_SPACING) {
			let nx = x + (Math.random() * (GRID_SPACING + GRID_SPACING) - GRID_SPACING);
			let ny = y + (Math.random() * (GRID_SPACING + GRID_SPACING) - GRID_SPACING);
			vertices.push(MV.vec3(nx, ny, 0.0));
			vertices.push(MV.vec3(nx, ny, 1.0));
		}
	}

	// Recalculate our canvas window and the height of our table everytime we resize the browser
	window.addEventListener("resize", function (event) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		table_height = (table_width * canvas.height) / canvas.width;
		gl.viewport(0, 0, canvas.width, canvas.height);
	});

	// Add the negative/positive charge everytime we click on our browser
	canvas.addEventListener("click", function (event) {
		if (positiveCharges.length + negativeCharges.length < MAX_CHARGES) {
			if (event.shiftKey)
				addCharge(event.offsetX, event.offsetY, positiveCharges, -1.0);
			else
				addCharge(event.offsetX, event.offsetY, negativeCharges, 1.0);
		} else
			alert("Maximum number of charges reached.");
	});

	// turn off charges points (cBufferCharge ou vBufferCharge)
	window.addEventListener("keydown", function (event)
	{
		if(event.code === 'Space')
			chargesOn = !chargesOn;
	});

	// Create the buffer to hold our grid points.
	vBufferGrid = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGrid);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	// Create the buffer to hold our charge points
	vBufferCharge = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferData(gl.ARRAY_BUFFER, MAX_CHARGES * sizeof["vec3"], gl.STATIC_DRAW);

	// set up window
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// enable transparency blenders
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	// request animation
	window.requestAnimationFrame(animate);
}

// ANIMATE

/**
 * program animation, drawing of primitives etc
 * @param time
 */
function animate(time) {
	// Clear canvas
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Draw grid points and field
	drawProgramGrid();
	// Draw charges
	if(chargesOn)
		drawProgramCharges();
	// Rotate charges
	rotateCharges();

	window.requestAnimationFrame(animate);
}

// OTHER FUNCTIONS

/**
 * Rotate charges
 */
function rotateCharges() {
	// Iterate through all positive charges
	for (const element of positiveCharges) {
		let x = element[0];
		let y = element[1];

		// Calculate points' new position after we rotate it
		let nx = x * Math.cos(THETA_VARIATION) - y * -Math.sin(THETA_VARIATION);
		let ny = x * -Math.sin(THETA_VARIATION) + y * Math.cos(THETA_VARIATION);

		// Set new points
		element[0] = nx;
		element[1] = ny;
	}
	// Iterate through all negative charges
	for (const element of negativeCharges) {
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
	// concat both charges' arrays
	let arr = positiveCharges.concat(negativeCharges);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arr));
}

/**
 * Add new charge to respective array and buffer
 * @param offsetX
 * @param offsetY
 * @param collection negativeCharges or negativeCharges
 * @param charge 1.0 or -1.0
 */
function addCharge(offsetX, offsetY, collection, charge) {
	// Calculate and push the position of our new charge
	collection.push(
		MV.vec3((offsetX * table_width) / window.innerWidth - table_width / 2,
				-1 * ((offsetY * table_height) / window.innerHeight - table_height / 2),
				charge)
	);

	// concat both charges' arrays
	let arr = positiveCharges.concat(negativeCharges);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(arr));
}

/**
 * Draw grid points and field
 */
function drawProgramGrid() {
	// program and buffer for the grid points
	gl.useProgram(program1);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferGrid);

	// Enable the attribute to hold the positions of points
	const vPositionGrid = gl.getAttribLocation(program1, "vPosition");
	gl.vertexAttribPointer(vPositionGrid, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionGrid);

	// Buffer for grid points' colors
	gl.bindBuffer(gl.ARRAY_BUFFER, cBufferGrid);

	// Adjust position
	let dim = gl.getUniformLocation(program1, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	// attribute the uniforms
	let arr = positiveCharges.concat(negativeCharges);
	for (let i = 0; i < MAX_CHARGES && i < arr.length; i++) {
		const uPosition = gl.getUniformLocation(program1, "uPosition[" + i + "]");
		gl.uniform3fv(uPosition, MV.vec3(arr[i][0], arr[i][1], arr[i][2]));
	}

	// Draw primitives
	gl.drawArrays(gl.LINES, 0, vertices.length);
}

/**
 * 	Draw charges
 */
function drawProgramCharges() {
	// Use our charges program and bind the buffer for the positions of those points
	gl.useProgram(program2);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCharge);

	// Enable the attribute to hold the positions of our charge points
	const vPositionCharge = gl.getAttribLocation(program2, "vPosition");
	gl.vertexAttribPointer(vPositionCharge, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPositionCharge);

	// attribute uniforms
	let dim = gl.getUniformLocation(program2, "dim");
	gl.uniform2f(dim, table_width / 2, table_height / 2);

	//Draw primitives
	gl.drawArrays(gl.POINTS, 0, negativeCharges.length + positiveCharges.length); //!!
}

// SHADER LOADER

/**
 * load shaders
 */
UTILS.loadShadersFromURLS([
	"shader1.vert",
	"shader2.vert",
	"shader1.frag",
	"shader2.frag"
]).then((s) => setup(s));
