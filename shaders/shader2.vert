// UNIFORM
uniform vec2 dim;
// VARYING VARS
varying vec4 fColor;
varying float fCharge;
// ATRIBUTES
attribute vec4 vPosition;

void main() {
    // point size and positioning
    gl_PointSize = 20.0;
    gl_Position = vPosition / vec4(dim, 1.0, 1.0);

    // set color and charge (-1 or 1)
    if(vPosition.z >= 1.0) {
        fColor = vec4(0.0, 1.0, 0.0, 1.0);
        fCharge = 1.0;
    } else {
        fColor = vec4(1.0, 0.0, 0.0, 1.0);
        fCharge = -1.0;
    }
}

