precision mediump float;
// VARYING VARS
varying vec4 fColor;
varying float fCharge;

// DRAWING CHARGES
void main() {
    // dircard pixels outside of the circle
    if(pow(gl_PointCoord.x - 0.5, 2.0) + pow(gl_PointCoord.y - 0.5, 2.0) >= pow(0.5,2.0)) {
        discard;
    }

    // discard pixels from the horizontal line (-) (minus circunference line)
    if( gl_PointCoord.y < 0.6 && gl_PointCoord.y > 0.4 &&
       pow(gl_PointCoord.x - 0.5, 2.0) + pow(gl_PointCoord.y - 0.5, 2.0) < pow(0.45,2.0)) {
        discard;
    }

    // discard pixels from the vertical line (|) (minus circunference line)
    if(fCharge >= 1.0){
        if( gl_PointCoord.x < 0.6 && gl_PointCoord.x > 0.4 &&
        pow(gl_PointCoord.x - 0.5, 2.0) + pow(gl_PointCoord.y - 0.5, 2.0) < pow(0.45,2.0)){
            discard;
        }
    }

    // get color
    gl_FragColor = fColor;
}
