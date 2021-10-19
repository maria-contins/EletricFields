attribute vec4 vPosition;
attribute vec4 vColor;

uniform vec2 dim;

varying vec4 fColor;

void main()
{
    gl_PointSize = 4.0;
    gl_Position = vPosition / vec4(dim, 1.0, 1.0);
    fColor = vColor;
}
