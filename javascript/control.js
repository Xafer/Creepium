//Objects

var keys = 
{
    front:false,
    back:false,
    left:false,
    right:false,
    space:false,
    ctrl:false,
    mouseLeft:false,
    mouseRight:false,
    action:false
}

var mouse =
{
    left:false,
    right:false,
    movement:
    {
        x:0,
        y:0
    }
}

//Functions

function keyHandler(key,state)
{
    switch(key)
    {
        case 38:
        case 87: keys.front = state; break;
        case 40:
        case 83: keys.back = state; break;
        case 37:
        case 65: keys.left = state; break;
        case 39:
        case 68: keys.right = state; break;
        case 32: keys.space = state; break;
        case 17: keys.ctrl = state; break;
        case 69: keys.action = state; break;
    }
}

function mouseHandler(key,state)
{
    switch(key)
    {
         case 0:mouse.left = state; break;   
         case 2:mouse.right = state; break;   
    }
}

//Events

window.addEventListener("keydown",function(e){ keyHandler(e.keyCode, true); });

window.addEventListener("keyup",function(e){ keyHandler(e.keyCode, false); });

window.addEventListener("mousedown",function(e){ mouseHandler(e.button,true); });

window.addEventListener("mouseup",function(e){ mouseHandler(e.button,false); });

window.addEventListener("mousemove",function(e)
{
    mouse.movement.x = e.movementX;
    mouse.movement.y = e.movementY;
    updateRotation();
});