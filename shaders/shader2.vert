attribute vec4 vPosition;
//attribute vec4 vColor;

uniform vec2 dim;

//vec4 fColor;

void main()
{
    gl_PointSize = 20.0;
    gl_Position = vPosition / vec4(dim, 1.0, 1.0);

    //fColor = vColor;
}

/*precision highp float;

attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 128.0;
}*/
