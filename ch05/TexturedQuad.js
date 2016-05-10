// TexturedQuad.js (c) 2012 matsuda and kanda
// Vertex shader program

//Part 1
// Receive the texture coordinates in the vertex shader and then pass them to
// the fragment shader
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program
//Part 2
// Paste the texture image onto the geometric shape inside the fragment shader
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

    // Set the vertex information
    //part 3
    //Set the texture coordinates 
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.');
    return;
  }
}

function initVertexBuffers(gl) {
  var verticesTexCoords = new Float32Array([
    // Vertex coordinates, texture coordinate
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0,
  ]);
  var n = 4; // The number of vertices

  // Create the buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

  return n;
}

    //part 4
    //prepare the texture image for loading, and request the browser to read it
function initTextures(gl, n) {
    // Create a texture object
    // for managing the texture image in the WebGL system
    var texture = gl.createTexture();  //returns null if failed to create
    // this call creates the texture object in the WebGL system.
    // gl.TEXTURE0 to gl.TEXTURE7 are texture units for managing a
    // texture image, and each has an associated gl.TEXTURE_2D,
    // which is the texture target for specifying the type of texture.
    // this will be explained in detail later.
    // the texture object can be deleted using gl.deleteTexture(texture)
    
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

    // Get the storage location of u_Sampler (a uniform variable to pass
    // the texture image to the fragment shader()
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
    // Create the image object
    // it's necessary to request that the browser load the image that will
    // be mapped to the rectangle. We us the JS built in Image object for this
    // purpose
  var image = new Image(); 
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ loadTexture(gl, n, texture, u_Sampler, image); };
  // Tell the browser to load an image
  image.src = '../resources/sky.jpg';

  return true;
}
//part 5
// configure the loaded texture so that it can be used in WebGL
function loadTexture(gl, n, texture, u_Sampler, image) {

    // Flip the image's y axis (when it's loaded)
    // before using the loaded images as a texture, you need
    // to flip the y-axis
    // this is because the t-axis direction of the WebGL texture
    // coordinate system is the inverse of the y-axis direction of
    // the coordinate system used by PNG, BMP, JPG and so on
    // note (you could also flip the t coordinates by hand instead of
    // flipping the image
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 


    // Enable texture unit0
    //WebGL supports multiple texture images (multitexturing) using
    //a mechanism called a texture unit. A texture unit manages texture
    //images by using a unit number for each texture.
    //Because of this, even if you only want to use a single texture image
    //you must specify and use a texture unit
    //The number of texture units supported varies according to your hardware and
    //WebGL implementation, but by default at least eight texture units are supported
    //The built in constants gl.TEXTURE0, gl.TEXTURE1, ..., and gl.TEXTURE7, represent
    //each texture unit
    //Before using a texture unit, it must be made active using a call to gl.activeTexture()
    gl.activeTexture(gl.TEXTURE0);

    
    // Bind the texture object to the target
    // if  a texture unit was made active by gl.activeTexture(), the
    // texture object is also bound to the texture unit (in this case gl.TEXTURE0)
    // We need tot tell the WebGL system what type
    // of texture image is used in the texture object
    // We do this by binding the texture object to the target
    // in a similar way to that of the buffer objects
    // The allowed types are gl.TEXTURE_2D and gl.TEXTURE_CUBE_MAP
    // Note that this method performs two tasks:
    // (1) enabling the texture object and binding it to the target
    // (2) binding it to the active texture unit
    // At this stage, the program has specified the type of texture that is used
    // in the texture object (gl.TEXTURE_2D) and that will be used to deal with
    // the texture object in the future. This is important, because in WebGL, you
    // cannot manipulate the texture object directly. You need to do that through
    // the binding
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters of the texture object
    
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}
