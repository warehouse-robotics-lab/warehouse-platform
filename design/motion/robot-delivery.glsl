// ---------------------------------------------------------------------------
// pen.dev shader effect - robot delivery loop (WebGL 1 / GLSL ES 1.00)
// ---------------------------------------------------------------------------
// Attach to the 960x540 "Motion layer" as a shader effect with
// u_content = pencil:object. That layer contains only two native sprites at
// their home cells, in frame pixels with a top-left origin (y down):
//   robot: centre (168,216), box half-extent 32
//   cargo: centre (186,170), box half-extent 12
// The shader masks each home cell out of the render and stamps the same pixels
// at the animated position. No new robot/cargo artwork is drawn; the sprite
// artwork is reused as-is, and the composite uses premultiplied alpha.
//
// 18 s loop. Every move uses smoothstep easing; stops between moves are exact
// holds, so both sprites stay continuous and the loop wraps cleanly.
// ---------------------------------------------------------------------------

#ifdef GL_ES
precision highp float;
#endif

/** @time */
uniform float u_time;

/** @resolution */
uniform vec2 u_resolution;

/**
 * @label Content
 */
uniform sampler2D u_content;

/**
 * @label Playing
 * @default 1
 * @range 0,1
 */
uniform float u_playing;

/**
 * @label Frozen time (s)
 * @default 5
 * @range 0,18
 */
uniform float u_frozenTime;

/**
 * @label Host y-down
 * @default 0
 * @range 0,1
 */
uniform float u_yDown;

/**
 * @label Trail color
 * @color
 * @default #93C5FD
 */
uniform vec3 u_trailColor;

/**
 * @label Trail width (px)
 * @default 4
 * @range 0,12
 */
uniform float u_trailWidth;

// Scene and route, in frame pixels (top-left origin, y down).
const vec2 SCENE = vec2(960.0, 540.0);
const float CYCLE = 18.0;

const vec2 P0 = vec2(168.0, 216.0);
const vec2 P1 = vec2(504.0, 216.0);
const vec2 P2 = vec2(504.0, 408.0);
const vec2 P3 = vec2(792.0, 408.0);

// Forward-path lengths (the trail parameter uses distance, not time).
const float L01 = 336.0;
const float L12 = 192.0;
const float L23 = 288.0;
const float LTOTAL = 816.0;

const float ROBOT_HALF = 32.0;
const float CARGO_HALF = 12.0;
const vec2 ROBOT_HOME = P0;               // where the robot sprite is drawn in the layer
const vec2 CARGO_HOME = vec2(186.0, 170.0); // where the cargo sprite is drawn in the layer
const vec2 CARGO_DROP = vec2(810.0, 362.0);
const vec2 CARRY = vec2(14.0, -18.0);     // cargo centre relative to robot while carried

// Source-over for premultiplied colours (u_content is premultiplied).
vec4 over(vec4 src, vec4 dst) {
  return src + dst * (1.0 - src.a);
}

// Scene pixel -> content UV. u_yDown 0 means the host texture is GL
// bottom-left, so V is flipped once; 1 means the host texture is top-left.
vec2 sceneToUV(vec2 px, vec2 res) {
  vec2 uv = px / res;
  return vec2(uv.x, u_yDown > 0.5 ? uv.y : 1.0 - uv.y);
}

bool insideScene(vec2 px, vec2 res) {
  return px.x >= 0.0 && px.y >= 0.0 && px.x <= res.x && px.y <= res.y;
}

// Cut one sprite out of u_content by its home box and stamp it at `center`.
// The sample offset is clamped to the home box's outer pixel centres, so a
// moved sprite never picks up the other sprite's pixels or empty layer pixels.
vec4 cutSprite(vec2 px, vec2 center, float halfSize, vec2 home, vec2 res) {
  vec2 local = px - center;
  if (abs(local.x) > halfSize || abs(local.y) > halfSize) return vec4(0.0);
  vec2 src = home + clamp(local, vec2(0.5 - halfSize), vec2(halfSize - 0.5));
  if (!insideScene(src, res)) return vec4(0.0); // outside UV: transparent, no clamp ghost
  return texture2D(u_content, sceneToUV(src, res));
}

// Trail alpha from one forward segment. progress is the distance in px the
// robot has already travelled along the forward path. Behind the robot the
// stroke tapers out; degenerate segments are skipped instead of divided by 0.
float segmentTrail(vec2 p, vec2 a, vec2 b, float s0, float s1, float progress, float halfWidth) {
  vec2 ab = b - a;
  float len = length(ab);
  if (len < 0.5) return 0.0;
  vec2 dir = ab / len;
  vec2 ap = p - a;
  float along = clamp(dot(ap, dir), 0.0, len);
  float s = s0 + (s1 - s0) * (along / len);
  float behind = progress - s;
  if (behind < 0.0) return 0.0; // travelled part only
  float d = length(ap - dir * along);
  // Ascending smoothstep edges: halfWidth - 1 < halfWidth for every width > 0.
  float edge = 1.0 - smoothstep(max(halfWidth - 1.0, 0.0), halfWidth, d);
  float taper = 1.0 - smoothstep(0.0, 140.0, behind);
  return edge * taper;
}

float trailAt(vec2 p, float t, float progress) {
  float width = clamp(u_trailWidth, 0.0, 32.0);
  float fade = 1.0 - smoothstep(9.7, 10.4, t);
  if (width <= 0.01 || fade <= 0.0 || progress <= 0.5) return 0.0; // zero width: no stroke
  float halfWidth = width * 0.5;
  float a = segmentTrail(p, P0, P1, 0.0, L01, progress, halfWidth);
  a = max(a, segmentTrail(p, P1, P2, L01, L01 + L12, progress, halfWidth));
  a = max(a, segmentTrail(p, P2, P3, L01 + L12, LTOTAL, progress, halfWidth));
  return a * fade;
}

vec2 robotPos(float t) {
  if (t < 1.2) return P0;
  if (t < 3.8) return mix(P0, P1, smoothstep(1.2, 3.8, t));
  if (t < 4.3) return P1;
  if (t < 6.0) return mix(P1, P2, smoothstep(4.3, 6.0, t));
  if (t < 6.5) return P2;
  if (t < 8.8) return mix(P2, P3, smoothstep(6.5, 8.8, t));
  if (t < 10.2) return P3;
  if (t < 12.2) return mix(P3, P2, smoothstep(10.2, 12.2, t));
  if (t < 12.6) return P2;
  if (t < 14.1) return mix(P2, P1, smoothstep(12.6, 14.1, t));
  if (t < 14.5) return P1;
  if (t < 16.8) return mix(P1, P0, smoothstep(14.5, 16.8, t));
  return P0;
}

float forwardProgress(float t) {
  if (t < 1.2) return 0.0;
  if (t < 3.8) return L01 * smoothstep(1.2, 3.8, t);
  if (t < 4.3) return L01;
  if (t < 6.0) return L01 + L12 * smoothstep(4.3, 6.0, t);
  if (t < 6.5) return L01 + L12;
  if (t < 8.8) return L01 + L12 + L23 * smoothstep(6.5, 8.8, t);
  return LTOTAL;
}

vec2 cargoPos(float t, vec2 robot) {
  // Pickup from home A, then ride with the robot until the drop at B.
  if (t < 0.9) return mix(CARGO_HOME, P0 + CARRY, smoothstep(0.3, 0.9, t));
  if (t < 9.1) return robot + CARRY;
  if (t < 11.0) return mix(P3 + CARRY, CARGO_DROP, smoothstep(9.1, 9.7, t));
  // Fade out at B, invisible reset, fade in at home A: never slides across.
  if (t < 14.0) return CARGO_DROP;
  return CARGO_HOME;
}

float cargoFade(float t) {
  // 1 -> 0 over 11..12 at B; 0 until 14; 0 -> 1 over 14..15 at home A.
  if (t < 12.0) return 1.0 - smoothstep(11.0, 12.0, t);
  return smoothstep(14.0, 15.0, t);
}

void main() {
  vec2 res = SCENE;
  if (u_resolution.x > 0.5 && u_resolution.y > 0.5) res = u_resolution;

  // Playing uses the host clock; paused holds one frozen moment of the loop.
  float hostTime = u_playing > 0.5 ? u_time : u_frozenTime;
  float t = mod(hostTime, CYCLE);

  // gl_FragCoord is GL bottom-left; scene coordinates are top-left with y down.
  vec2 px = vec2(gl_FragCoord.x, u_yDown > 0.5 ? gl_FragCoord.y : res.y - gl_FragCoord.y);

  vec4 outColor = vec4(0.0);

  float trail = trailAt(px, t, forwardProgress(t));
  outColor = over(vec4(u_trailColor * trail, trail), outColor);

  vec2 robot = robotPos(t);
  outColor = over(cutSprite(px, robot, ROBOT_HALF, ROBOT_HOME, res), outColor);

  float cargo = cargoFade(t);
  if (cargo > 0.001) {
    outColor = over(cutSprite(px, cargoPos(t, robot), CARGO_HALF, CARGO_HOME, res) * cargo, outColor);
  }

  gl_FragColor = clamp(outColor, 0.0, 1.0);
}
