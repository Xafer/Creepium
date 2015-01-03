//Three.js initialisation


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(90,(window.innerWidth) / window.innerHeight,0.001,1000);
var renderer = new THREE.WebGLRenderer();

camera.rotation.order = "YXZ";

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.domElement.id = "game";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.setClearColor(0x110011);
document.getElementById("display").appendChild(renderer.domElement);

renderer.shadowMapEnabled = true;

scene.fog = new THREE.Fog( 0x110011, 3,6 );

//PostProcessing
var composer = new THREE.EffectComposer( renderer );
composer.addPass( new THREE.RenderPass( scene, camera ) );

var effect = new THREE.ShaderPass( THREE.PixelShader );
effect.renderToScreen = true;
composer.addPass( effect );

//Setting the canvas

var canvas = document.getElementById("game");

canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
                            canvas.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock ||
                           document.webkitExitPointerLock;

canvas.onclick = function() {
    canvas.requestPointerLock();
}

function isFocused()
{
    return document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas;
}

/////////////////////////////////////////////
///////// Main programming section //////////
/////////////////////////////////////////////

//Global variables

var player = new Player();
var playerLight = new THREE.PointLight( 0xddaa77,1,2 );
scene.add(playerLight);
player.position.y = 1;

var models = new Array();
var rooms = new Array();

var worldSize = new THREE.Vector2(3,3);


//Functions

function playerFollowers()
{
    camera.position.set(player.position.x,player.position.y,player.position.z);
    camera.rotation.set(player.rotation.x,player.rotation.y,player.rotation.z);
    playerLight.position.copy(player.position);
}

function updateRotation()
{
    if(isFocused())
    {
       var rotMax = Math.PI / 2 - Math.PI / 8;
    
       player.rotation.y -= mouse.movement.x/100;
       player.rotation.x -= mouse.movement.y/100;
    
       player.rotation.x = Math.min(player.rotation.x, rotMax);
       player.rotation.x = Math.max(player.rotation.x, -rotMax);
    }
}

function addModel(model)
{
    scene.add(model);
    models.push(model);
}

function removeModel(model)
{
    scene.remove(model);
    models.splice(models.indexOf(model),1);
}

function addRoom(x,y,room)
{
    room.models.position.x = x*5 - 5;
    room.models.position.z = y*5 - 5;
    scene.add(room.models);
}

function removeRoom(room)
{
    scene.remove(room);
    rooms.splice(room.indexOf(room),1);
}

function generateWorld()
{
    for(var i = 0; i < worldSize.x; i++)
    {
        rooms.push(new Array());
        for(var j = 0; j < worldSize.y; j++)
        {
            addRoom(i,j,new Room(i,j,rooms));
        }
    }
}

function render()
{
    renderer.render(scene,camera);
    composer.render();
}

function main()
{
    if(isFocused())player.update();
    playerFollowers();
    render();
    requestAnimationFrame(main);
}

function init()
{
    console.log("game initiated.");
    generateWorld();
    main();
}
init();

//Model Importation functions

function loadModel(model)
{
    var loadedModel = new THREE.Group();
    var parts = model.parts;
    var l = parts.length;
    
    for(var i = 0; i < l; i++)//Parsing through the parts
    {
        var p = parts[i];
        var size = new THREE.Vector3(p.size[0], p.size[1], p.size[2]);
        var color = new THREE.Color(p.color[0],p.color[1],p.color[2]);
        var pos = new THREE.Vector3(p.position[0],p.position[1],p.position[2]);
        var rot;
        if(p.rotation.length == 3)
        {
            rot = new THREE.Euler(p.rotation[0],p.rotation[1],p.rotation[2]);
        }
        else
        {
            rot = new THREE.Quaternion(p.rotation[0],p.rotation[1],p.rotation[2],p.rotation[3]);
        }
        
        var material = new THREE.MeshPhongMaterial( { color:color } );
        var geometry = new THREE.BoxGeometry(size.x,size.y,size.z);
        
        var mesh = new THREE.Mesh(geometry,material);
        mesh.position.copy(pos);
        mesh.rotation.copy(rot);
       
        loadedModel.add(mesh);
        
        if(!(model === ModelData.wood.floor) || i < 4)mesh.castShadow = true;
        mesh.receiveShadow = true;
    }
    
    l = model.lights.length;
    
    for(var i = 0; i < l;i++)
    {
        var light = model.lights[i];
        var resLight = new THREE[light.type](light.color);
        
        resLight.position.set(light.position[0],light.position[1]+1,light.position[2]);
        
        resLight.intensity = light.intensity;
        resLight.distance = light.distance;
        
        if(light.type == "SpotLight")
        {
            resLight.castShadow = true;
            resLight.shadowDarkness = 1;
            resLight.shadowCameraNear = 0.1;
            resLight.shadowCameraFar = 10;
            resLight.shadowCameraFov = 90;
        }
        
        resLight.target = loadedModel.children[0];
        
        loadedModel.add(resLight);
    }
    
    return loadedModel;
}