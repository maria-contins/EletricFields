
/*void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}*/

#version 100
precision mediump float;
uniform vec4 cCharge;

void main() {
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    float distanceSqrd = distance * distance;
    gl_FragColor = vec4(
    0.5/distanceSqrd,
    0.0/*/distanceSqrd*/,
    0.0, 1.0); // eventually change to red and green w uniforms maybe?
}