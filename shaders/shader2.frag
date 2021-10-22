/*
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}*/

/*precision mediump float;

void main() {
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    float distanceSqrd = distance * distance;
    gl_FragColor = vec4(
    0.3/distanceSqrd,
    0.0/distanceSqrd,
    0.0, 1.0); // eventually change to red and green w uniforms maybe?
}*/

precision mediump float;
varying vec4 fColor;
varying float fCharge;

void main() {
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    float distanceSqrd = distance * distance;
    
    if(pow(gl_PointCoord.x - 0.5, 2.0) + pow(gl_PointCoord.y - 0.5, 2.0) >= pow(0.5,2.0)){
        discard;
    }

    if( gl_PointCoord.y < 0.6 && gl_PointCoord.y > 0.4 &&
     pow(gl_PointCoord.x - 0.5, 2.0) + pow(gl_PointCoord.y - 0.5, 2.0) < pow(0.45,2.0)){
        discard;
    }

    if(fCharge >= 1.0){
        if( gl_PointCoord.x < 0.6 && gl_PointCoord.x > 0.4 &&
        pow(gl_PointCoord.x - 0.5, 2.0) + pow(gl_PointCoord.y - 0.5, 2.0) < pow(0.45,2.0)){
            discard;
        }
    }

    gl_FragColor = fColor;
}

// maybe change the way the charges are added to the window? and use uniforms? or use method used in ex17?
