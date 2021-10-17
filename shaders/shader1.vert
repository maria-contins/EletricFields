attribute vec4 vPosition;
uniform vec2 dim;

void main()
{
    gl_PointSize = 4.0;
    gl_Position = vPosition / vec4(dim, 1.0, 1.0);
}
