import {vec3} from 'gl-matrix';
import {mat4, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import { print } from 'util';
import * as OBJ from 'webgl-obj-loader';
import MeshDrawable from './geometry/MeshDrawable';
import LSystem from './LSystem/LSystem';
import CharNode from './LSystem/CharNode';
import TurtleParser from './LSystem/TurtleParser';
import Turtle from './LSystem/Turtle';
import Branch from './geometry/Branch';
import Leaf from './geometry/Leaf';
import Trunk from './geometry/Trunk';
import ShapeGrammar from './ShapeGrammar/ShapeGrammar';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  Red: 0,
  Green: 1,
  Blue: 1,
  Iterations: 0,
  Reload: function() {loadScene()}
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let currTime: number = 0;
let meshDrawable : MeshDrawable;
let lsystem: LSystem;
let turtleParser: TurtleParser;
//original obj data for branches
let indicesB: Uint32Array; 
let positionsB: Float32Array;
let normalsB: Float32Array;
let shapeGrammar : ShapeGrammar;
let groundPlane : Square;



function loadScene() {

  meshDrawable = new MeshDrawable();
  shapeGrammar = new ShapeGrammar();

  //setup ground plane
  groundPlane = new Square(vec3.fromValues(0, 0, 0));
  groundPlane.loadMesh();
  var posVectors = ShapeGrammar.VBOtoVec4(groundPlane.positions);
  var norVectors = ShapeGrammar.VBOtoVec4(groundPlane.normals);
  var groundRot = mat4.create();
  var invRot = mat4.create();
  groundRot = mat4.rotateX(groundRot, groundRot, Math.PI * 110 / 180);
  invRot = mat4.transpose(invRot, groundRot);
  var groundScale = mat4.create();
  groundScale = mat4.scale(groundScale, groundScale, vec3.fromValues(10, 10, 10));
  shapeGrammar.transformVectors(posVectors, groundRot);
  shapeGrammar.transformVectors(norVectors,invRot);
  shapeGrammar.transformVectors(posVectors, groundScale);
  groundPlane.positions = ShapeGrammar.Vec4toVBO(posVectors);
  groundPlane.normals = ShapeGrammar.Vec4toVBO(norVectors);
  groundPlane.create();


  

  //meshDrawable.addMeshComponent(shapeGrammar.defaultHouse);
  shapeGrammar.expandShapes(controls.Iterations);
  meshDrawable = shapeGrammar.renderShapes(meshDrawable);
  

  // lsystem = new LSystem(controls.Axiom, controls.Iterations);
  // lsystem.doIterations();
  // console.log(lsystem.seed);

  // // //load in default branch vertex data
  // var branchDef = new Branch(vec3.fromValues(0, 0, 0));
  // var leafDef = new Leaf(vec3.fromValues(0, 0, 0));
  // var trunk = new Trunk(vec3.fromValues(0, 0, 0));
  // branchDef.loadMesh();
  // leafDef.loadMesh();
  // trunk.loadMesh();
  // meshDrawable.addMeshComponent(trunk);
  // //create first turtle
  // var currTurtle = new Turtle(vec3.fromValues(0, 0, 0));
  // //create turtle stack
  // turtleParser = new TurtleParser(currTurtle);


  
  // //set turtle stack's default branch to the branch you created
  // turtleParser.defaultBranch = branchDef;
  // turtleParser.defaultLeaf = leafDef;
  // //turtleParser.createBranch();
  // meshDrawable = turtleParser.renderSymbols(CharNode.stringToLinkedList(lsystem.seed), meshDrawable);
  meshDrawable.create();

}

//keep resizeable arrays for each thing in drawable class and store copy of original obj data
//- each time you transform position of new branch/component, convert original obj data to vec4s,
//multiply each by transformation, convert back to vbo arrays, append these arrays to resizeable arrays
//finally, call create on all resizeable arrays



function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Red', 0, 1).step(.05);
  gui.add(controls, 'Green', 0, 1).step(.05);
  gui.add(controls, 'Blue', 0, 1).step(.05);
  gui.add(controls, 'Iterations', 0, 3).step(1);
  gui.add(controls, 'Reload');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);


  // This function will be called every frame
  function tick() {
    lambert.setTime(currTime);
    currTime++;
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    let color = vec4.fromValues(controls.Red, controls.Green, controls.Blue, 1);  
    lambert.setGeometryColor(color);
    renderer.clear();
    
   

    renderer.render(camera, lambert, [
      //icosphere,
      //square,
      //cube
      groundPlane,
      meshDrawable
    ]);
  
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();



//load in one copy of primitive
//
