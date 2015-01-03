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
    this.ground = true;
    this.god = false;
    this.crouched = false;
    this.realHeight = 1;
    
    //Methods
    
    this.move = function()
    {
        this.position.add(this.velocity) * (deltaTime / 100);
        this.position.y = this.realHeight - ((this.crouched)?0.2:0);
    }
    
    this.testCollistion = function()
    {
        var collision = false;
        if(this.solid)
        {
            var dest = new THREE.Vector3();
            var r = rooms[1][1];
            dest.add(this.position);
            dest.add(this.velocity);
            //X
            if(Math.abs(dest.x) > 0.5 && Math.abs(dest.z) > 1.8)
                collision = true;
                
            if(Math.abs(dest.z) > 0.5 && Math.abs(dest.x) > 1.8)
                collision = true;
            
            if(r.obstacles.length != 0)
            {
                if(r.obstacles.indexOf("table") != -1 && Math.sqrt((dest.x*dest.x) + (dest.z*dest.z)) < 0.8)
                    collision = true;
                
                if(r.obstacles.indexOf("shrinePillar") != -1 && Math.sqrt((dest.x*dest.x) + (dest.z*dest.z)) < 0.6)
                    collision = true;
            }
            
            if(collision)this.velocity.set(0,0,0);
        }
        return collision;
    }
}

//Player

function Player()
{
    this.solid = true;
    this.speed = 0.015;
    this.update = function()
    {
        // Controls
        var facing = new THREE.Vector2(0,0);
        
        var modSpeed = this.speed * ((this.crouched)?0.5:1);

        if(keys.front) facing.y = 1;
        else if(keys.back) facing.y = -1;

        if(keys.left) facing.x = -1;
        else if(keys.right) facing.x = 1;
        
        if(this.god)
        {
            if(keys.space) this.velocity.y = this.speed;
            else if(keys.shift) this.velocity.y = -this.speed;
        }
        else
        {
            if(keys.space && this.ground)
            {
                this.ground = false;
                this.velocity.y = 0.015;
            }
            
            if(keys.shift) this.crouched = true;
            else this.crouched = false;
        }

        var angle = Math.atan2(facing.y,facing.x) + this.rotation.y;

        if(facing.x != 0 || facing.y != 0)
        {
            this.velocity.x = Math.cos(angle)*modSpeed;
            this.velocity.z = -Math.sin(angle)*modSpeed;
        }
        else
        {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
        
        //gravity
        if(!this.ground)
        {
            this.velocity.y -= 0.001;
            this.realHeight += this.velocity.y;
            if(this.realHeight < 1)
            {
                this.ground = true;
                this.realHeight = 1;
            }
        }
        //Collision
        if(this.testCollistion())this.velocity.set(0,0,0);
        this.move();
        //Room Warping
        var dir;
        if(Math.abs(this.position.x) > 2.52)
        {
            dir = (Math.abs(this.position.x)/this.position.x);
            this.position.x -= dir * 4.98;
            warpRoom(Math.PI/2 * dir);
        }
        if(Math.abs(this.position.z) > 2.52)
        {
            dir = (Math.abs(this.position.z)/this.position.z);
            this.position.z -= dir * 4.98;
            warpRoom(Math.PI/2 + (Math.PI/2)*dir);
        }
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
    /*
    if(x-1 < 0)this.allocation.left = (Math.random() < 0.5)?"wall":"window";
    if( x+1 >= worldSize.x)this.allocation.right = (Math.random() < 0.5)?"wall":"window";
    
    if(y-1 < 0)this.allocation.top = (Math.random() < 0.5)?"wall":"window";
    if( y+1 >= worldSize.y)this.allocation.bottom = (Math.random() < 0.5)?"wall":"window";
    */
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
    //Solid
    if((!generated && (x != 1 || y != 1)) || generated)
    {
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
    }
    //Walkthrough
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