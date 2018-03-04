
import House from './../geometry/House';
import {vec3, vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';
import MeshDrawable from '../geometry/MeshDrawable';
import Shape from './Shape';

class ShapeGrammar {
    renderGrammar : Map<string, Function>;
    shapeSet : Array<Shape>;
    defaultHouse: House;


    constructor() {
        var defaultShape = new Shape(vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1), vec3.fromValues(0, 0, 0), 'A');
        //this.defaultHouse = new House(vec3.fromValues(0, 0, 0));
       // this.defaultHouse.loadMesh();
        //defaultShape.setHouse(this.defaultHouse);
        //defaultShape.geometry = this.defaultHouse;
        //this.shapeSet = new Array<Shape>();
        //this.shapeSet[0] = defaultShape;
    }






    static VBOtoVec4(arr: Float32Array) {
        var vectors: Array<vec4> = new Array<vec4>();
        for(var i = 0; i < arr.length; i+=4) {
          var currVec = vec4.fromValues(arr[i], arr[i+1], arr[i+2], arr[i+3]);
          vectors.push(currVec);
        }
        return vectors;
      }
      
      transformVectors(vectors: Array<vec4>, transform: mat4) {
        for(var i = 0; i < vectors.length; i++) {
            var newVector: vec4 = vec4.create();
            newVector = vec4.transformMat4(newVector, vectors[i], transform);
 
            vectors[i] = newVector;
        }
        return vectors;
      }
      
      // Just converts from vec4 to floats for VBOs
      static Vec4toVBO(vectors: Array<vec4>) {
        var j: number = 0;
        var arr = new Float32Array(vectors.length*4);
        for(var i = 0; i < vectors.length; i++) {
            var currVec = vectors[i];
            arr[j] = currVec[0];
            arr[j+1] = currVec[1];
            arr[j+2] = currVec[2];
            arr[j+3] = currVec[3];
            j+=4;
        }
        return arr;
      }

      shiftHouse(center:vec3, m: House) {
        for(var i = 0; i < m.positions.length; i+=4) {
            m.positions[i] += center[0];
            m.positions[i+1] += center[1];
            m.positions[i+2] += center[2];
        }

        return m;
    }

    createHouse(center: vec3) {
        var newHouse = new House(center);
        newHouse.positions = new Float32Array(this.defaultHouse.positions);
        newHouse.normals = new Float32Array(this.defaultHouse.normals);
        newHouse.indices = new Uint32Array(this.defaultHouse.indices);

        return newHouse;
    }

    transformHouse(house: House, scale: mat4, rot: mat4, newCenter: vec3) {
        var posVectorsL = ShapeGrammar.VBOtoVec4(this.defaultHouse.positions);
        var norVectorsL = ShapeGrammar.VBOtoVec4(this.defaultHouse.normals);
            
        posVectorsL = this.transformVectors(posVectorsL, rot);
        norVectorsL = this.transformVectors(norVectorsL, rot); //change to inverse transpose
        posVectorsL = this.transformVectors(posVectorsL, scale);  

        house.positions = ShapeGrammar.Vec4toVBO(posVectorsL);
        house.normals = ShapeGrammar.Vec4toVBO(norVectorsL);

        house = this.shiftHouse(newCenter, house);

        return house;
    }


    //calls the function to replace the shape with its corresponding new shape(s)
    expandShape(currShape: Shape, newShapes: Array<Shape>, i:number) {
        var newShape;// = new Shape();
        var symbol = currShape.symbol;

        //replace shape with two shapes that are each half of original
        if(symbol == 'A') {
            var halfScale = vec3.create();
            halfScale = vec3.scale(halfScale, currShape.currScale, .5);

            var halfScaleN = vec3.create();
            halfScaleN = vec3.scale(halfScaleN, halfScale, -1);

            var quartScale = vec3.create();
            quartScale = vec3.scale(quartScale, halfScale, .5);

            var quartScaleN = vec3.create();
            quartScaleN = vec3.scale(quartScaleN, halfScaleN, .5);

       

            var backLeftPos = vec3.create();
            var backRightPos = vec3.create();
            var frontLeftPos = vec3.create();
            var frontRightPos = vec3.create();


            backLeftPos = vec3.add(backLeftPos, currShape.currPos, vec3.fromValues(quartScale[0] * 2 * Math.random(), 0, quartScaleN[2] * 2)); //change to currpos+currPos/2
            backRightPos = vec3.add(backRightPos, currShape.currPos, vec3.fromValues(quartScaleN[0] * 2 * Math.random(), 0, quartScaleN[2] * 2)); //change to currpos-currPos/2
            frontLeftPos = vec3.add(frontLeftPos, currShape.currPos, vec3.fromValues(quartScale[0] * 2 * Math.random(), 0, quartScale[2] * 2)); //change to currpos+currPos/2
            frontRightPos = vec3.add(frontRightPos, currShape.currPos, vec3.fromValues(quartScaleN[0] * 2 * Math.random(), 0, quartScale[2] * 2)); //change to currpos-currPos/2



            //create two new subdivided shapes
            var backLeft = new Shape(backLeftPos, vec3.fromValues(halfScale[0], Math.random(), halfScale[2] * (Math.random() + 1)), currShape.currRot, 'B'); 
            // if(Math.random() < .4) {
            //     backLeft.symbol = 'B';
            // }
            var backRight = new Shape(backRightPos, vec3.fromValues(halfScale[0], Math.random(), halfScale[2] * (Math.random() + 1)), currShape.currRot, 'B');
            // if(Math.random() < .62) {
            //     backRight.symbol = 'B';
            // }
            var frontLeft = new Shape(frontLeftPos, vec3.fromValues(halfScale[0], Math.random(), halfScale[2] * (Math.random() + 1)), currShape.currRot, 'B'); 
            // if(Math.random() < .58) {
            //     frontLeft.symbol = 'B';
            // }
            var frontRight = new Shape(frontRightPos, vec3.fromValues(halfScale[0], Math.random(), halfScale[2] * (Math.random() + 1)), currShape.currRot, 'B');
            // if(Math.random() < .53) {
            //     frontRight.symbol = 'B';
            // }

            //create the geometries for these two shapes
            var houseBL = this.createHouse(backLeft.currPos);
            var houseBR = this.createHouse(backRight.currPos);
            var houseFL = this.createHouse(frontLeft.currPos);
            var houseFR = this.createHouse(frontRight.currPos);
        

            //transform new houses
            houseBL = this.transformHouse(houseBL, backLeft.computeScaleMat(), backLeft.computeRotMat(), backLeft.currPos);
            houseBR = this.transformHouse(houseBR, backRight.computeScaleMat(), backRight.computeRotMat(), backRight.currPos);
            houseFL = this.transformHouse(houseFL, frontLeft.computeScaleMat(), frontLeft.computeRotMat(), frontLeft.currPos);
            houseFR = this.transformHouse(houseFR, frontRight.computeScaleMat(), frontRight.computeRotMat(), frontRight.currPos);



            backLeft.setHouse(houseBL);
            backRight.setHouse(houseBR);
            frontLeft.setHouse(houseFL);
            frontRight.setHouse(houseFR);

            newShapes[i] = backLeft;
            newShapes[i+1] = backRight;
            newShapes[i+2] = frontLeft;
            newShapes[i+3] = frontRight;
        }
        else if(symbol == 'B') {
            var halfScale = vec3.create();
            halfScale = vec3.scale(halfScale, currShape.currScale, .5);

            var halfScaleN = vec3.create();
            halfScaleN = vec3.scale(halfScaleN, halfScale, -1);

            var quartScale = vec3.create();
            quartScale = vec3.scale(quartScale, halfScale, .5);

            var quartScaleN = vec3.create();
            quartScaleN = vec3.scale(quartScaleN, halfScaleN, .5);

       

            var backLeftPos = vec3.create();
            var backRightPos = vec3.create();
            var frontLeftPos = vec3.create();
            var frontRightPos = vec3.create();

            var mainPos = vec3.create();
            var subPos = vec3.create();

            var rand = Math.random();

            //main house with door
            if(rand < .4) {
                mainPos = vec3.add(mainPos, currShape.currPos, vec3.fromValues(0, 0, quartScaleN[2])); 
                subPos = vec3.add(subPos, currShape.currPos, vec3.fromValues(0, 0, halfScale[2])); 

                var main = new Shape(mainPos, vec3.fromValues(halfScale[0], Math.random() + 1, halfScale[2] + .5), currShape.currRot, 'B'); 
                var sub = new Shape(subPos, vec3.fromValues(quartScale[0], Math.random() + .5, halfScale[2]+.5), currShape.currRot, 'B'); 
            
                var houseMain = this.createHouse(main.currPos);
                var houseSub = this.createHouse(sub.currPos);

                houseMain = this.transformHouse(houseMain, main.computeScaleMat(), main.computeRotMat(), main.currPos);
                houseSub = this.transformHouse(houseSub, sub.computeScaleMat(), sub.computeRotMat(), sub.currPos);

                main.setHouse(houseMain);
                sub.setHouse(houseSub);

                newShapes[i] = main;
                newShapes[i+1] = sub;
           }

           //main house with chimney/tower
           if(rand < .6) {
                mainPos = vec3.add(mainPos, currShape.currPos, vec3.fromValues(0, 0, quartScale[2])); 
                subPos = vec3.add(subPos, currShape.currPos, vec3.fromValues(quartScale[0], halfScale[1],  quartScale[2])); 

                var main = new Shape(mainPos, vec3.fromValues(halfScale[0], Math.random() + .75, halfScale[2] + .5), currShape.currRot, 'B'); 
                var sub = new Shape(subPos, vec3.fromValues(quartScale[0], Math.random()+.5, quartScale[2]), currShape.currRot, 'B'); 
            
                var houseMain = this.createHouse(main.currPos);
                var houseSub = this.createHouse(sub.currPos);

                houseMain = this.transformHouse(houseMain, main.computeScaleMat(), main.computeRotMat(), main.currPos);
                houseSub = this.transformHouse(houseSub, sub.computeScaleMat(), sub.computeRotMat(), sub.currPos);

                main.setHouse(houseMain);
                sub.setHouse(houseSub);

                newShapes[i] = main;
                newShapes[i+1] = sub;
           }

           //main house with left garage
           else if(rand < .8) {
                mainPos = vec3.add(mainPos, currShape.currPos, vec3.fromValues(quartScale[0], 0, 0)); //change to currpos+currPos/2
                subPos = vec3.add(subPos, currShape.currPos, vec3.fromValues(quartScaleN[0], 0, 0));

                var main = new Shape(mainPos, vec3.fromValues(halfScale[0], Math.random() + 1, halfScale[2] + .5), currShape.currRot, 'B'); 
                var sub = new Shape(subPos, vec3.fromValues(quartScale[0], Math.random() + .5, halfScale[2]), currShape.currRot, 'B'); 
            
                var houseMain = this.createHouse(main.currPos);
                var houseSub = this.createHouse(sub.currPos);

                houseMain = this.transformHouse(houseMain, main.computeScaleMat(), main.computeRotMat(), main.currPos);
                houseSub = this.transformHouse(houseSub, sub.computeScaleMat(), sub.computeRotMat(), sub.currPos);

                main.setHouse(houseMain);
                sub.setHouse(houseSub);

                newShapes[i] = main;
                newShapes[i+1] = sub;
           } 
            //main house with right garage    
            else if(rand < 1) {
                mainPos = vec3.add(mainPos, currShape.currPos, vec3.fromValues(quartScaleN[0], 0, 0)); //change to currpos+currPos/2
                subPos = vec3.add(subPos, currShape.currPos, vec3.fromValues(quartScale[0], 0, 0));

                var main = new Shape(mainPos, vec3.fromValues(halfScale[0], Math.random() + 1, halfScale[2] + .5), currShape.currRot, 'B'); 
                var sub = new Shape(subPos, vec3.fromValues(quartScale[0], Math.random() + .5, halfScale[2]), currShape.currRot, 'B'); 
            
                var houseMain = this.createHouse(main.currPos);
                var houseSub = this.createHouse(sub.currPos);

                houseMain = this.transformHouse(houseMain, main.computeScaleMat(), main.computeRotMat(), main.currPos);
                houseSub = this.transformHouse(houseSub, sub.computeScaleMat(), sub.computeRotMat(), sub.currPos);

                main.setHouse(houseMain);
                sub.setHouse(houseSub);

                newShapes[i] = main;
                newShapes[i+1] = sub;
        }
    }

        return newShapes;
    }


    // Invoke renderSymbol for every shape in a list of shapes
    expandShapes(iterations: number) {
        var currentNode;
        var newShapes= new Array<Shape>();
        var k = 0;
        var newTotalShapes = new Array<Shape>();
        //iterate through list of shapes and for each shape, replace it with expanded
        for(var j = 0; j < iterations; j++) {
            for(var i = 0; i < this.shapeSet.length; i++) {
                if(this.shapeSet[i] != null) {
                newShapes = this.expandShape(this.shapeSet[i], newShapes, k);
                k+= 4;
                console.log(k);
                }

            }
        this.shapeSet = newShapes;
        newShapes = new Array<Shape>();
        k = 0;
 
        console.log(this.shapeSet);
        }

    }

    //for each shape in list of shapes, add to meshDrawable
    renderShapes(meshDrawable: MeshDrawable) {
        for(var i = 0; i < this.shapeSet.length; i++) {
            if(this.shapeSet[i] != null) {
                console.log(this.shapeSet[i].geometry);
            meshDrawable.addMeshComponent(this.shapeSet[i].geometry);
     
            }
         }
         return meshDrawable;
    }

};
export default ShapeGrammar;
