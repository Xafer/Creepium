//Three.js initialisation


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(90,(window.innerWidth) / window.innerHeight,0.001,1000);
var renderer = new THREE.WebGLRenderer();

camera.rotation.order = "YXZ";

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.domElement.id = "game";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
document.getElementById("display").appendChild(renderer.domElement);

renderer.shadowMapEnabled = true;

var fogColor = new THREE.Color(0xffffff);
var destinationFog = new THREE.Color(0x110011);

scene.fog = new THREE.Fog( fogColor, 3,5 );
renderer.setClearColor(fogColor);

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

canvas.exitPointerLock = canvas.exitPointerLock ||
                           canvas.mozExitPointerLock ||
                           canvas.webkitExitPointerLock;

canvas.onclick = function() {
    canvas.requestPointerLock();
}

function isFocused()
{
    return true//document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas;
}

/////////////////////////////////////////////
///////// Main programming section //////////
/////////////////////////////////////////////

//Global variables

var player = new Player();
var playerLight = new THREE.PointLight( 0xddaa77,1,10 );
var basePlayerLightDistance = 10;
var playerLightDisturbance = 0.01;
scene.add(playerLight);
player.position.y = 1;
var deltaTime = 0;
var lastFrame = (new Date()).getTime();

var ambiantLightColor = new THREE.Color(0x000000);
var destinationLightColor = new THREE.Color(0x000000);
var ambiantLight = new THREE.AmbientLight(ambiantLightColor);
scene.add(ambiantLight);

var models = new Array();
var rooms = new Array();
var entities = new Array();

var generated = false;

var worldSize = new THREE.Vector2(3,3);

var beatIndex = 0;

var dangerFactor = 0;

var difficulty = 1;


//Functions

function playerFollowers()
{
    camera.position.set(player.position.x,player.position.y,player.position.z);
    camera.rotation.set(player.rotation.x,player.rotation.y,player.rotation.z);
    playerLight.position.copy(player.position);
    playerLight.position.y = player.realHeight + (Math.random() - 0.5)*playerLightDisturbance;
    playerLight.position.x += (Math.random() - 0.5)*playerLightDisturbance;
    playerLight.position.z += (Math.random() - 0.5)*playerLightDisturbance;
    playerLight.distance = basePlayerLightDistance + (Math.random() - 0.5) * playerLightDisturbance;
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
    rooms[x][y] = room;
    scene.add(room.models);
}

function removeRoom(room)
{
    scene.children.splice(scene.children.indexOf(room.models),1);
    rooms[room.position.x][room.position.y = undefined];
}

function addEntity(entity)
{
    scene.add(entity.model);
    entities.push(entity);
}

function removeEntity(entity)
{
    scene.children.splice(scene.children.indexOf(entity.model),1);
    entities.splice(entities.indexOf(entity),1);
}

function generateWorld()
{
    for(var i = 0; i < worldSize.x; i++)
    {
        rooms[i] = new Array();
        for(var j = 0; j < worldSize.y; j++)
        {
            rooms[i][j] = new Room(i,j,rooms);
            addRoom(i,j,rooms[i][j]);
        }
    }
    generated = true;
}

function generateHalls()
{
    var halls = new THREE.Group();
    for(var i = 0; i < 4; i++)
    {
        var globalAngle = (i/2) * Math.PI;
        for(var j = 0; j < 4; j++)
        {
            var localAngle = (j/2) * Math.PI;
            var x = Math.cos(globalAngle)*5 + Math.cos(localAngle)*2.5;
            var y = Math.sin(globalAngle)*5 + Math.sin(localAngle)*2.5;
            var m = loadModel(ModelData.decorative.hall);
            m.position.x = x;
            m.position.z = y;
            m.position.y += (Math.random() - 0.5)/8;
            m.rotation.y = localAngle;
            halls.add(m);
        }
    }
    scene.add(halls);
}

function createMonster()
{
    if(dangerFactor >= 1)
    {
        var x = (Math.random() >= 0.5)?-1:1;
        var z = (Math.random() >= 0.5)?-1:1;
        
        var ghost = new Ghost();
        
        ghost.position.x = x*5;
        ghost.position.y = 0.5;
        ghost.position.z = z*5;
        
        addEntity(ghost);
        
        dangerFactor = 0;
    }
}

function warpRoom(direction)//1 to 4
{
    var x = Math.round(Math.sin(direction));
    var y = -Math.round(Math.cos(direction));
    
    var l = entities.length;
    
    for(var i = 0; i < l; i++)
    {
        entities[i].position.x -= x*5;
        entities[i].position.z -= y*5;
    }
    
    var res = new Array();
    for(var i = 0; i < 3; i++)
    {
        res[i] = new Array();
        for(var j = 0; j < 3; j++)
        {
            if(rooms[i+x] != undefined && rooms[i+x][j+y] != undefined)
            {
                res[i][j] = rooms[i+x][j+y];
            }
            else
            {
                res[i][j] = new Room(i+x,j+y,rooms);
            }
        }
    }
    for(var i in rooms)
        for(var j in rooms[i])
            removeRoom(rooms[i][j]);
    for(var i in res)
    {
        for(var j in res[i])
        {
            res[i][j].position.set(i,j);
            addRoom(i,j,res[i][j]);
        }
    }
    
    dangerFactor += (difficulty/10);
}

function updateFog()
{
    if( Math.abs(fogColor.r - destinationFog.r) > 0.01 )fogColor.r = (fogColor.r - (fogColor.r - destinationFog.r) / 32);
    if( Math.abs(fogColor.g - destinationFog.g) > 0.01 )fogColor.g = (fogColor.g - (fogColor.g - destinationFog.g) / 32);
    if( Math.abs(fogColor.b - destinationFog.b) > 0.01 )fogColor.b = (fogColor.b - (fogColor.b - destinationFog.b) / 32);
    
    if( Math.abs(ambiantLightColor.r - destinationLightColor.r) > 0.01 )ambiantLightColor.r = (ambiantLightColor.r - (ambiantLightColor.r - destinationLightColor.r) / 32);
    if( Math.abs(ambiantLightColor.g - destinationLightColor.g) > 0.01 )ambiantLightColor.g = (ambiantLightColor.g - (ambiantLightColor.g - destinationLightColor.g) / 32);
    if( Math.abs(ambiantLightColor.b - destinationLightColor.b) > 0.01 )ambiantLightColor.b = (ambiantLightColor.b - (ambiantLightColor.b - destinationLightColor.b) / 32);
    
    renderer.setClearColor(fogColor);
    scene.fog.color = fogColor;
    
    ambiantLight.color = ambiantLightColor;
}

function render()
{
    renderer.render(scene,camera);
    composer.render();
}

function updateDeltaTime()
{
    var time = (new Date()).getTime();
    deltaTime = time - lastFrame;
    lastFrame = time;
}

function updateStartLight()
{
    if(basePlayerLightDistance > 2.4)basePlayerLightDistance -= 0.03;
    else basePlayerLightDistance = 2.4;
}

function soundify()
{
    if(Math.random() < 0.0001)
    {
        playSound("ambiance"+(Math.floor(Math.random()*2) + 1))
    }
    if(beatIndex > 400)
    {
        playSound("beat1");
        beatIndex = 0;
    }
    else beatIndex++;
}

function updateEntities()
{
    if(isFocused())player.update();
    var l = entities.length;
    for(var i = 0; i < l; i++)
    {
        var e = entities[i];
        e.update();
    }
}

function main()
{
    updateEntities();
    updateDeltaTime();
    updateStartLight();
    createMonster();
    updateFog();
    soundify();
    render();
    requestAnimationFrame(main);
}

function init()
{
    console.log("game initiated.");
    generateWorld();
    generateHalls();
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
        
        /*
        if(!(model === ModelData.wood.floor) || i < 4)mesh.castShadow = true;
        mesh.receiveShadow = true;
        */
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