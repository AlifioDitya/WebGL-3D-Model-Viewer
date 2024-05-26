import { useEffect, useRef } from "react";

export default function Canvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Adjust the canvas size for high DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error(
        "Unable to initialize WebGL. Your browser may not support it.",
      );
      return;
    }

    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec4 aVertexColor;
      varying lowp vec4 vColor;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
      }
    `;

    // Fragment shader program
    const fsSource = `
      varying lowp vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `;

    // Initialize a shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    if (!shaderProgram) {
      console.error("Failed to initialize shader program.");
      return;
    }

    // Collect all the info needed to use the shader program
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          shaderProgram,
          "uProjectionMatrix",
        ),
        modelViewMatrix: gl.getUniformLocation(
          shaderProgram,
          "uModelViewMatrix",
        ),
      },
    };

    // Build all the objects we'll be drawing
    const buffers = initBuffers(gl);

    let rotateX = 0;
    let rotateY = 0;

    // Function to render the scene
    function render() {
      rotateX += 0.02; // Increase the x-axis rotation
      rotateY += 0.028; // Increase the y-axis rotation

      if (gl) {
        drawScene(gl, programInfo, buffers, rotateX, rotateY);
      }

      requestAnimationFrame(render); // Call render again on the next frame
    }

    requestAnimationFrame(render); // Start the render loop
  }, []);

  return (
    <div className="flex size-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="grid-pattern size-full bg-[#1E1E1E]"
        id="glcanvas"
        width={800}
        height={600}
      ></canvas>
    </div>
  );
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  if (!shaderProgram || !vertexShader || !fragmentShader) {
    return null;
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram),
    );
    return null;
  }

  return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    console.error("Error creating shader.");
    return null;
  }

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers(gl: WebGLRenderingContext) {
  // Create buffers for the rings' vertices and colors.
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Define the vertices and colors for the two rings
  const positions = [];
  const colors = [];
  const numSegments = 100;
  const innerRadius = 0.5;
  const outerRadius = 1.0;
  const ringThickness = 0.2;

  for (let i = 0; i < numSegments; i++) {
    const angle1 = (i / numSegments) * 2 * Math.PI;
    const angle2 = ((i + 1) / numSegments) * 2 * Math.PI;

    const xInner1 = innerRadius * Math.cos(angle1);
    const yInner1 = innerRadius * Math.sin(angle1);
    const xOuter1 = outerRadius * Math.cos(angle1);
    const yOuter1 = outerRadius * Math.sin(angle1);

    const xInner2 = innerRadius * Math.cos(angle2);
    const yInner2 = innerRadius * Math.sin(angle2);
    const xOuter2 = outerRadius * Math.cos(angle2);
    const yOuter2 = outerRadius * Math.sin(angle2);

    // Colors for the gradient
    const color1 = [i / numSegments, 0.0, 1.0 - i / numSegments, 1.0];
    const color2 = [
      (i + 1) / numSegments,
      0.0,
      1.0 - (i + 1) / numSegments,
      1.0,
    ];

    // Top face (outer and inner rings)
    positions.push(xInner1, yInner1, ringThickness / 2);
    positions.push(xOuter1, yOuter1, ringThickness / 2);
    positions.push(xInner2, yInner2, ringThickness / 2);

    positions.push(xOuter1, yOuter1, ringThickness / 2);
    positions.push(xOuter2, yOuter2, ringThickness / 2);
    positions.push(xInner2, yInner2, ringThickness / 2);

    for (let j = 0; j < 3; j++) {
      colors.push(...color1);
    }
    for (let j = 0; j < 3; j++) {
      colors.push(...color2);
    }

    // Bottom face (outer and inner rings)
    positions.push(xInner1, yInner1, -ringThickness / 2);
    positions.push(xOuter1, yOuter1, -ringThickness / 2);
    positions.push(xInner2, yInner2, -ringThickness / 2);

    positions.push(xOuter1, yOuter1, -ringThickness / 2);
    positions.push(xOuter2, yOuter2, -ringThickness / 2);
    positions.push(xInner2, yInner2, -ringThickness / 2);

    for (let j = 0; j < 3; j++) {
      colors.push(...color1);
    }
    for (let j = 0; j < 3; j++) {
      colors.push(...color2);
    }

    // Side faces (connecting top and bottom)
    positions.push(xOuter1, yOuter1, ringThickness / 2);
    positions.push(xOuter1, yOuter1, -ringThickness / 2);
    positions.push(xOuter2, yOuter2, ringThickness / 2);

    positions.push(xOuter1, yOuter1, -ringThickness / 2);
    positions.push(xOuter2, yOuter2, -ringThickness / 2);
    positions.push(xOuter2, yOuter2, ringThickness / 2);

    for (let j = 0; j < 3; j++) {
      colors.push(...color1);
    }
    for (let j = 0; j < 3; j++) {
      colors.push(...color2);
    }

    positions.push(xInner1, yInner1, ringThickness / 2);
    positions.push(xInner1, yInner1, -ringThickness / 2);
    positions.push(xInner2, yInner2, ringThickness / 2);

    positions.push(xInner1, yInner1, -ringThickness / 2);
    positions.push(xInner2, yInner2, -ringThickness / 2);
    positions.push(xInner2, yInner2, ringThickness / 2);

    for (let j = 0; j < 3; j++) {
      colors.push(...color1);
    }
    for (let j = 0; j < 3; j++) {
      colors.push(...color2);
    }
  }

  // Pass the positions into WebGL to build the shape.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Pass the colors into WebGL to build the shape.
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}

function drawScene(
  gl: WebGLRenderingContext,
  programInfo: any,
  buffers: any,
  rotateX: number,
  rotateY: number,
) {
  gl.clearColor(0.1, 0.1, 0.1, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix
  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.width / gl.canvas.height;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to start drawing the rings.
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]); // amount to translate

  // Rotate the rings a little
  mat4.rotate(modelViewMatrix, modelViewMatrix, rotateX, [1, 0, 0]); // Rotate around the x-axis
  mat4.rotate(modelViewMatrix, modelViewMatrix, rotateY, [0, 1, 0]); // Rotate around the y-axis

  // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
  {
    const numComponents = 3; // pull out 3 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
  {
    const numComponents = 4; // pull out 4 values per iteration (r, g, b, a)
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );

  // Draw the ring
  const numSegments = 100;
  gl.drawArrays(gl.TRIANGLES, 0, numSegments * 6 * 4);
}

const mat4 = {
  create() {
    const out = new Float32Array(16);
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  },
  perspective(
    out: Float32Array,
    fovy: number,
    aspect: number,
    near: number,
    far: number,
  ) {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
  },
  translate(out: Float32Array, a: Float32Array, v: number[]) {
    let x = v[0],
      y = v[1],
      z = v[2];
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      let a00, a01, a02, a03;
      let a10, a11, a12, a13;
      let a20, a21, a22, a23;

      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];

      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;

      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
  },
  rotate(out: Float32Array, a: Float32Array, rad: number, axis: number[]) {
    let x = axis[0],
      y = axis[1],
      z = axis[2];
    let len = Math.hypot(x, y, z);
    let s, c, t;
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;
    let b00, b01, b02;
    let b10, b11, b12;
    let b20, b21, b22;

    if (len < 0.000001) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
      // If the source and destination differ, copy the unchanged last row
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  },
};
