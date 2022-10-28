// import * as ee from "../node_modules/@google/earthengine/build/ee_api_js.js"
const dat = require('dat.gui');
let Papa = require("papaparse")
let BABYLON = require('babylonjs');
let GUI = require('babylonjs-gui')
let Materials = require('babylonjs-materials');
let $ = require('jquery')
var canvas = document.getElementById("renderCanvas");
var privateKey = require('./private-key.json');
let ee = require("@google/earthengine")

//DOESN'T WORK AND IDK WHY
// var YOUR_CLIENT_ID = '567262647144-et5i0cke7sqp73f3posdrtpdeojkestt.apps.googleusercontent.com';




//     var initialize = function() {
//     ee.initialize(null, null, function() {
//         ee.initialize();
//         var imageMetadata = ee.Image(1).getInfo();
//         console.log(JSON.stringify(imageMetadata), null, ' ')
//         $('.output').text(JSON.stringify(imageMetadata), null, ' ');
//     }, function(e) {
//       console.error('Initialization error: ' + e);
//     });
//   };
  
//   // Authenticate using an OAuth pop-up.
//   ee.data.authenticateViaOauth(YOUR_CLIENT_ID, initialize, function(e) {
//     console.error('Authentication error: ' + e);
//   }, null, function() {
//     ee.data.authenticateViaPopup(initialize);
//   });

  console.log("hello world!")
var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}



var createDefaultEngine = function() {
    console.log("creating engine");
    return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false});
};

window.engine = createDefaultEngine();

window.scene = new BABYLON.Scene(engine);
var sceneToRender = null;


// script importation
// var url = "https://cdn.rawgit.com/BabylonJS/Extensions/master/DynamicTerrain/dist/babylon.dynamicTerrain.min.js";
// var s = document.createElement("script");
// s.src = url;
// document.head.appendChild(s);


var createScene = () => {
    
    var scene = new BABYLON.Scene(engine);

    var box = BABYLON.Mesh.CreateBox('SkyBox', 1000, scene, false, BABYLON.Mesh.BACKSIDE);
    box.material = new Materials.SkyMaterial('sky', scene);
    box.material.inclination = -0.35;

    BABYLON.SceneLoader.ImportMesh("rocket", "https://raw.githubusercontent.com/Zerender/Rocket-Trajectory-Tracker/main/assets/", "BigRocketUpright.babylon", scene);
    var tracker = BABYLON.Mesh.CreateCylinder("sphere1", 1, 1,1,8,8, scene);
    tracker.position.y = 7;
    tracker.isVisible = false;
    var camera = new BABYLON.ArcRotateCamera("",0,0,80,tracker,scene);
    //var camera = new BABYLON.ArcRotateCamera("camera1",  0, 0, 0, scene.getMeshByName('rocket'), scene);
    camera.wheelPrecision = 10.0;
    camera.angularSensibilityX = 1000.0;
    camera.angularSensibilityY = 1000.0;
    camera.setPosition(new BABYLON.Vector3(0.0, 50.0, -50.0));
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0.0, 1.0, 0.0), scene);
    light.intensity = 0.75;
    light.specular = BABYLON.Color3.Black();


    // Map data creation
    // The map is a flat array of successive 3D coordinates (x, y, z).
    // It's defined by a number of points on its width : mapSubX
    // and a number of points on its height : mapSubZ

    
    scene.onReadyObservable.add(() => {
        const altitude = [];
        const uploadconfirm = document.getElementById('uploadconfirm').addEventListener('click', () => {
            Papa.parse(document.getElementById('uploadfile').files[0], 
            {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    //csv = results;
                    //console.log(results.data[0].altitude_ft)
                    for (let i = 0; i < results.data.length; i++) {
                            altitude.push(parseInt(results.data[i].altitude_ft));


                    }
                    const moves = []
                    for (let i = 0; i < altitude.length; i++) {
                        console.log(altitude[i])
                        moves[i] = new BABYLON.Vector3(0, altitude[i], 0);
                        setTimeout(()=>{moveTo(moves[i])}, (i+1)*50); 
                    }
                }
                

            });
        });

        
        const mesh = scene.getMeshByName('rocket')
        mesh.rotationQuaternion = mesh.rotation.toQuaternion()

        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var text1 = new GUI.TextBlock();
        text1.text = "Current Height: 0";
        text1.color = "white";
        text1.fontSize = 24;
        text1.setPadding(0, 500, 500, 0)
        advancedTexture.addControl(text1); 
       
     /*  var text2 = new BABYLON.GUI.TextBlock();
       text2.text = "Longitude: "
       text2.color = "white";
       text2.fontSize = 24;
       text2.setPadding(0, 500, 400, 0);
       advancedTexture.addControl(text2); 

       var text3 = new BABYLON.GUI.TextBlock();
       text3.text = "Latitude: "
       text3.color = "white";
       text3.fontSize = 24;
       text3.setPadding(0, 500, 300, 0);
       advancedTexture.addControl(text3); 
        // animate movement

        */
        function moveTo(position) {
            let height = Math.round(mesh.absolutePosition.y);
            text1.text = "Current Height: " + height + "\'";
            // text2.text = "Logitude: " + long;
            // text3.text = "Latitude: " + lat;
            if (position.y < 0) {
                position = new BABYLON.Vector3(0, 7, 0);
            }
            mesh.position = position;
            tracker.position = position;
        }
       // const localPath = new BABYLON.Vector3(10, 100, 0);
       // moveTo(mesh.position.add(localPath))
       // const chungalPath = new BABYLON.Vector3(100, -30, 0);
       // setTimeout(function(){moveTo(mesh.position.add(chungalPath))},4000); 
        function spinTo(quaternion) {
            //var ease = new BABYLON.CubicEase();
            //ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            mesh.rotationQuaternion = quaternion;
            tracker.rotationQuaternion = quaternion;
            BABYLON.Animation.CreateAndStartAnimation('spinTo', mesh, 'rotationQuaternion', 30, 120, mesh.rotationQuaternion, quaternion, 0/*, ease*/);
        }
        var toAngle = -Math.PI;  // animate to this angle
        var currentRotation = mesh.rotationQuaternion.toEulerAngles();
        // spinTo(new BABYLON.Quaternion.FromEulerAngles(currentRotation.x, currentRotation.y, toAngle));

    })

    let max_height = 185;
    let width = 1000;

    let groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("../assets/terrain/texture_b1_auto.png", scene);
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", "../assets/heightmaps/B1/heightmap_b1_auto.png", {
        width: width, height: 2.05700326*width, subdivisions: 1000, maxHeight: max_height, minHeight: max_height - 256});
    ground.material = groundMaterial

    ground.position = new BABYLON.Vector3(0, 0, 0)



    return scene;
}


    

// ######################################################
window.initFunction = async function() {


    var asyncEngineCreation = async function() {
        try {
        return createDefaultEngine();
        } catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    //console.log(engine)
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();};
    initFunction().then(() => {sceneToRender = scene                    
    });

    // Resize
window.addEventListener("resize", function () {
    engine.resize();
});