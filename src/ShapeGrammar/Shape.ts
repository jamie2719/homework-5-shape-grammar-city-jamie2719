
import MeshDrawable from './../geometry/MeshDrawable';
import {vec3, vec4, mat3, mat4} from 'gl-matrix';
import House from './../geometry/House';


function degToRad(deg: number) {
    return deg * Math.PI / 180.0;

}

class Shape {
    geometry: MeshDrawable; //Associated geometry instance
    currPos: vec3;
    currScale: vec3;
    currRot: vec3;
    symbol: string;
    // parent: Shape;

    constructor (pos: vec3, scale: vec3, rot: vec3, symbol:string) {
        this.currPos = pos;
        this.currRot = rot;
        this.currScale = scale;
        this.symbol = symbol;
    }


    setHouse(house:House) {
        this.geometry = house;
    }


    computeRotMat() : mat4 {
        var empty = mat4.create();
        var rotx = degToRad(this.currRot[0]);
        var roty = degToRad(this.currRot[1]);
        var rotz = degToRad(this.currRot[2]);

        var rotatex = mat4.rotateX(mat4.create(), mat4.create(), rotx);
        var rotatey = mat4.rotateY(mat4.create(), mat4.create(), roty); 
        var rotatez = mat4.rotateZ(mat4.create(), mat4.create(), rotz); 
        mat4.multiply(rotatex, rotatex, rotatey); 
        mat4.multiply(rotatex, rotatex, rotatez);
        return rotatex;
    }

    computeScaleMat() : mat4 {
        var empty = mat4.create();
        empty = mat4.scale(empty, empty, this.currScale);
        return empty;
    }

};
export default Shape;
