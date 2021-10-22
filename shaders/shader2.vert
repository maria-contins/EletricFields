attribute vec4 vPosition;
attribute vec4 vColor;

uniform vec2 dim;

varying vec4 fColor;
varying float fCharge;

void main()
{
    gl_PointSize = 20.0;
    gl_Position = vPosition / vec4(dim, 1.0, 1.0);

    if(vPosition.z >= 1.0) {
    fColor = vec4(0.0, 1.0, 0.0, 1.0);
    fCharge = 1.0;
    } else {
    fColor = vec4(1.0, 0.0, 0.0, 1.0);
    fCharge = -1.0;
    }
}

/*precision highp float;

attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 128.0;
}*/
