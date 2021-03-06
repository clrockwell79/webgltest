var buffers = {
  position: {
    numComponents: 2,
    data: [
      0, 0,
      0, 0.5,
      0.7, 0
    ]
  }
};

var programs = {
  default: {
    vertex: "vertex",
    fragment: "fragment"
  }
};

var toDraw = [];

function makeTri() {
  return {
    program: "default",
    attribs: {
      a_position: "position"
    },
    uniforms: {
      u_color: new Float32Array([Math.random(), Math.random(), Math.random(), 1]),
      u_translate: new Float32Array([randRange(-1, 1), randRange(-1, 1), 0, 0])
    }
  };
}

function randRange(from, to) {
  var range = to - from;
  return (Math.random() * range) + from;
}

function main() {
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl");
  window.gl = gl;
  if (!gl) {
    console.error("WebGL isn't supported on this browser");
    return;
  }

  initPrograms(gl);
  initBuffers(gl);

  for (var i = 0; i < 100; i++) {
    toDraw.push(makeTri());
  }

  window.requestAnimationFrame(mainLoop);
}
main();

function mainLoop(time) {
  var lastObj = toDraw[toDraw.length - 1];
  lastObj.uniforms.u_translate[0] = Math.sin(time / 1000);
  lastObj.uniforms.u_translate[1] = Math.cos(time / 1000);

  render(window.gl);
  window.requestAnimationFrame(mainLoop);
}

function render(gl) {
  resize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawObjects(gl, toDraw);
}

function drawObjects(gl, objectInfos) {
  for (var i = 0; i < objectInfos.length; i++) {
    drawObject(gl, objectInfos[i]);
  }
}

var lastProgramInfo;

function drawObject(gl, objectInfo) {
  var programInfo = programs[objectInfo.program];
  if (programInfo !== lastProgramInfo) {
    lastProgramInfo = programInfo;
    gl.useProgram(programInfo.program);
  }

  var count = 0;

  for (var attribName in objectInfo.attribs) {
    var bufferName = objectInfo.attribs[attribName];
    var bufferInfo = buffers[bufferName];
    count = bufferInfo.numElements;
    var attribSetter = programInfo.attribs[attribName];
    attribSetter(bufferInfo);
  }

  for (var uniformName in objectInfo.uniforms) {
    var uniformValue = objectInfo.uniforms[uniformName];
    var uniformSetter = programInfo.uniforms[uniformName];
    uniformSetter(uniformValue);
  }

  var primitiveType = objectInfo.type || gl.TRIANGLES;
  var offset = 0;
  // var count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}
