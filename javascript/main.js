//Three.js initialisation


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(90,(window.innerWidth) / window.innerHeight,0.001,1000);
var renderer = new THREE.WebGLRenderer();

camera.rotation.order = "YXZ";

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.domElement.id = "game";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.setClearColor(0x220011);
document.getElementById("display").appendChild(renderer.domElement);

var mat = new THREE.MeshBasicMaterial({color:0xffffff});
var mat2 = new THREE.MeshBasicMaterial({color:0x007799});
var geo = new THREE.BoxGeometry(1,1,1);
var geo2 = new THREE.BoxGeometry(-1.05,-1.05,-1.05);
var geo3 = new THREE.BoxGeometry(-1.1,-1.1,-1.1);

scene.add(new THREE.Mesh(geo,mat));
scene.add(new THREE.Mesh(geo2,mat2));
scene.add(new THREE.Mesh(geo3,mat));

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

//Global variables

var player = new Player();
player.position.z = 3;

//Functions

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

function render()
{
    renderer.render(scene,camera);
    composer.render();
}

function main()
{
    if(isFocused())player.update();
    camera.position.set(player.position.x,player.position.y,player.position.z);
    camera.rotation.set(player.rotation.x,player.rotation.y,player.rotation.z);
    render();
    requestAnimationFrame(main);
}

function init()
{
    console.log("game initiated.");
    main();
}
init();