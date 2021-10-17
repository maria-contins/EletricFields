import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */

const table_width = 3.0;
const grid_spacing = 0.05;
const vertices = [];
let table_height;
let gl;
let program;


function animate(time)
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    let dim = gl.getUniformLocation(program, "dim");
    gl.uniform2f(dim, table_width/2, table_height/2);

    gl.drawArrays(gl.POINTS, 0, vertices.length);
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    table_height = (table_width*canvas.height)/canvas.width;

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        table_height = (table_width*canvas.height)/canvas.width;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener("click", function(event) {
        // Start by getting x and y coordinates inside the canvas element
        const x = event.offsetX;
        const y = event.offsetY;

        console.log("Click at (" + x + ", " + y + ")");
    });

    for(let x = -(table_width/2); x <= table_width/2; x += grid_spacing) {
        for(let y = -(table_height/2); y <= table_height/2; y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
        }
    }

    // create buffer, add vertexes, and send to gpu
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, MV.flatten(vertices), gl.STATIC_DRAW);

    // create program, set up positions
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
