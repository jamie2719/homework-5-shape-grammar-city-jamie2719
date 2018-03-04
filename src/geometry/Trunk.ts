import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as OBJ from 'webgl-obj-loader';
import * as Mesh from 'webgl-obj-loader';
import MeshDrawable from './MeshDrawable';

//contains the vertex data of the loaded trunk object, but does not create buffers 
class Trunk extends MeshDrawable {

    center: vec4;


    constructor(center: vec3) {
        super(); // Call the constructor of the super class. This is required.
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    }    

    loadMesh() {
      const canvas = <HTMLCanvasElement> document.getElementById('canvas');
      var gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
      var objStr = document.getElementById('trunk.obj').innerHTML;
        
      var mesh = new OBJ.Mesh(objStr);
      OBJ.initMeshBuffers(gl, mesh);

      this.positions = new Float32Array(mesh.vertices.length + mesh.vertices.length / 3.0);
      this.normals = new Float32Array(mesh.vertexNormals.length +  mesh.vertexNormals.length / 3.0);
      this.indices = new Uint32Array(mesh.indices);
        

      var j = 0;
      for(var i = 0; i < mesh.vertices.length; i+=3) {
        this.positions[j] = mesh.vertices[i] + this.center[0];
        this.positions[j+1] = mesh.vertices[i+1] + this.center[1];
        this.positions[j+2] = mesh.vertices[i+2] + this.center[2];
        this.positions[j+3] = 1;
        j+=4;
      }


      var k = 0;
      for(var i=0; i < mesh.vertexNormals.length; i+=3) {
        this.normals[k] = mesh.vertexNormals[i];
        this.normals[k+1] = mesh.vertexNormals[i+1];
        this.normals[k+2] = mesh.vertexNormals[i+2];
        this.normals[k+3] = 0;
        k+=4;
      }
      this.count = this.indices.length;
    }


  create() {
    console.log(`Loaded branch`);
  }
};

export default Trunk;   