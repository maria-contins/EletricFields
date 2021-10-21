attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec4 re_dim;

uniform vec2 dim;

 vec4 fColor;

//new
precision highp float;
attribute vec2 position;
// --

/*void main()
{
    gl_PointSize = 4.0;

    gl_Position = vPosition / vec4(dim, 1.0, 1.0);

    fColor = vColor;
}*/

void main()
{
    gl_PointSize = 8.0; // Not keeping 20 cause it's ugly

    gl_Position = vPosition / vec4(dim, 1.0, 1.0);
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
    fColor = vColor;
}
