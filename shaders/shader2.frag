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

void main() {
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    float distanceSqrd = distance * distance;
    gl_FragColor = fColor / vec4(distanceSqrd, distanceSqrd, 1.0, 1.0);
}

// maybe change the way the charges are added to the window? and use uniforms? or use method used in ex17?
