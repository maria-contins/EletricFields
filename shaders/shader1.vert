// CONSTANTS
#define TWOPI 6.28318530718
#define COULOMB pow(8.9875517923, 9.0)
#define SCALE 0.0000000005
#define LENGTH 0.20
#define MAX_CHARGES 20
// UNIFORMS
uniform vec2 dim;
uniform vec3 uPosition[MAX_CHARGES];
// ATRIBUTES
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// colorize "line"
vec4 colorize(vec2 f) {
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

// Function to calculate charge field: E = Ke * q / (r * r)
vec2 calculate_field(vec3 origin) {
   // calculate field
    float radius = distance(vec2(vPosition.x, vPosition.y),vec2(origin.x, origin.y));
    float coulombCharged = COULOMB * origin.z;
    float field = coulombCharged / (radius * radius);

    // get usable vec2
    vec2 vector = vec2(vPosition.x, vPosition.y) - vec2(origin.x, origin.y);
    vector = normalize(vector);
    vector = vector * field * SCALE;
    return vector;
}

// calculate all fields
void electric_field() {
    vec2 field;

    // Adding up all our vectors
    for(int i = 0; i < MAX_CHARGES; i++)
        field += calculate_field(uPosition[i]);

    // shorten "line" if needed
    if (length(field) > LENGTH)
        field = (field * LENGTH) / length(field);

    // caulculate end point of "line"
    vec4 final = vPosition + vec4(field, 0.0, 0.0);
    final.z = 1.0;
    final.w= 1.0;

    // reajust position and get color
    gl_Position = (final /  vec4(dim, 1.0, 1.0));
    fColor = colorize(field);
}

void main() {
        // Checking if it's a duplicate
        if(vPosition.z <= 0.0) {
            gl_Position = vPosition / vec4(dim, 1.0, 1.0);
            fColor = vec4(0.0,0.0,0.0,0.0);
        } else
            electric_field();
}
