import { shaderMaterial } from "drei";
import { extend } from "react-three-fiber";

/**
 * Variables to be explained: wiggle, factor, scaleFactor, movementVector
 */
const LayerMaterial = shaderMaterial(
  //Default values for the destructured elements (look in the App.js file, these values
  //are not used for every layer. When they are not used, the defaults below are used instead.
  //)
  { textr: null, movementVector: [0, 0, 0], scaleFactor: 1, factor: 0, wiggle: 0, time: 0 },
  //vertexShader takes care of the wiggling. Basically this one is only used for the leaves.
  ` uniform float time;
    uniform vec2 resolution;
    uniform float wiggle;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main()	{
      vUv = uv;
      //model matrix
      vec3 transformed = vec3(position);
      //If you want the object to wiggle,
      if (wiggle > 0.) {
        //Define angle for vertical wiggling.
        //position.y gives it the waviness (different for all y verts).
        float theta = sin(time + position.y) * wiggle ;

        //Define movement and apply the m transformation matrix to the matrix of the object.
        float c = cos(theta);
        float s = sin(theta);
        //Let's call this the x & y wave.
        mat3 m = mat3(c, 0, s, 
                      0, 1, 0, 
                      -s, 0, c);
        //for reference, here's how to write the 3d identity matrix:
        // mat3 m = mat3(1, 0, 0, 
        //               0, 1, 0, 
        //               0, 0, 1);
        transformed = transformed * m;
        vNormal = vNormal * m;
      }
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    }`,
  //This one is for the parallax fx
  //Scale factor is used to set the size of each layer.
  /**
   * Parallax works because even though the movement vector is the same for all layers,
   * the scale factor isn't. This results in larger layers being more affected, therefore, more "movement".
   */
  ` uniform float time;
    uniform vec2 resolution;
    uniform float factor;
    uniform float scaleFactor;
    uniform vec3 movementVector;
    uniform sampler2D textr;
    varying vec2 vUv;
    void main()	{
      vec2 uv = vUv / scaleFactor + movementVector.xy * factor;
      vec4 color = texture2D(textr, uv);
      if (color.a < 0.1) discard;
      gl_FragColor = vec4(color.rgb, .1);
    }`
);

extend({ LayerMaterial });
