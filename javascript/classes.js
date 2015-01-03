//Classes related functions

Function.prototype.extends = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
    return this;
}

//Base Entity Class

function Entity()
{
    this.position = new THREE.Vector3(0,0,0);
    this.velocity = new THREE.Vector3(0,0,0);
    this.rotation = new THREE.Euler();
    this.rotation.order = "YXZ";
    this.solid = true
    this.speed = 0;
    
    //Methods
    
    this.move = function()
    {
        this.position.add(this.velocity);
    }
}

//Player

function Player()
{
    this.solid = true;
    this.speed = 0.03;
    this.update = function() // Controls
    {
        var facing = new THREE.Vector2(0,0);

        if(keys.front) facing.y = 1;
        else if(keys.back) facing.y = -1;

        if(keys.left) facing.x = -1;
        else if(keys.right) facing.x = 1;
        
        if(keys.space) this.velocity.y = this.speed;
        else if(keys.shift) this.velocity.y = -this.speed;
        else this.velocity.y = 0;

        var angle = Math.atan2(facing.y,facing.x) + this.rotation.y;

        if(facing.x != 0 || facing.y != 0)
        {
            this.velocity.x = Math.cos(angle)*this.speed;
            this.velocity.z = -Math.sin(angle)*this.speed;
        }
        else
        {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
        this.move();
    }
}

Player.extends(Entity);

//Ghost

function Ghost()
{
    
}

Ghost.extends(Entity);

//Model

var modelId = 0;

function Model()
{
    this.id = modelId;
    modelId++;
    
    this.parts = new Array();
}

function Room(x,y,parent)
{
    this.parent = parent = parent;
    if(x == undefined)x = 0;
    if(y == undefined)Y = 0;
    this.position = new THREE.Vector2(x,y);
    this.type = ["wood"][Math.floor(Math.random()*0)];
    this.models = new THREE.Group();
    this.obstacles = [];
    
    this.allocation =
    {
        top:"doorframe",
        right:"doorframe",
        bottom:"doorframe",
        left:"doorframe"
    }
    
    if(x-1 < 0)this.allocation.left = (Math.random() < 0.5)?"wall":"window";
    if( x+1 >= worldSize.x)this.allocation.right = (Math.random() < 0.5)?"wall":"window";
    
    if(y-1 < 0)this.allocation.top = (Math.random() < 0.5)?"wall":"window";
    if( y+1 >= worldSize.y)this.allocation.bottom = (Math.random() < 0.5)?"wall":"window";
    
    for(var i = 0; i < 4;i++)
    {
        var angle = (i/4) * (Math.PI * 2) - Math.PI/2;
        var n = this.allocation[["top","right","bottom","left"][i]];
        var model = loadModel(ModelData[this.type][n]);
        this.models.add(model);
        model.position.x = Math.cos(angle) * 2;
        model.position.z = Math.sin(angle) * 2;
        model.rotation.y = angle;
    }
    
    this.models.add(loadModel(ModelData[this.type]["floor"]));
    
    var m;
    
    //Decorations
    if(Math.random() < 0.1)
    {
        m = loadModel(ModelData["wood"]["table"]);
        m.rotation.y = Math.random() * Math.PI;
        m.rotation.x = Math.random()/10;
        this.models.add(m);
        this.obstacles.push("table");
        if(Math.random() < 0.4)
        {
            m = loadModel(ModelData["decorative"]["lamp"]);
            m.position.x = Math.random()*0.1 - 0.5;
            m.position.y = 0.33;
            m.rotation.y = Math.random()*Math.PI;
            this.models.add(m);
        }
    }
    else if(Math.random() < 0.05)
    {
        m = loadModel(ModelData["decorative"]["shrinePillar"]);
        this.obstacles.push("shrinePillar");
        this.models.add(m);
    }
    
    if(Math.random() < 0.2)
    {
        m = loadModel(ModelData["decorative"]["puddle1"]);
        m.position.x = Math.random()*3.8 - 2;
        m.position.y -= Math.random()/4;
        m.rotation.y = Math.random()*Math.PI;
        this.models.add(m);
    }
}

/*
{
    name:"string",
    type:"type",
    description:"description"
    parts:
    [
        {
            size:[x,y,z],
            color:[r,g,b,a],
            position:[x,y,z],
            rotation:[x,y,z,w] || rotation:[x,y,z]
        },
        {}...
    ]
}
*/