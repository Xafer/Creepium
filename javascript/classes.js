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

function Player()
{
    this.solid = true;
    this.speed = 0.05;
    this.update = function() // Controls
    {
        var facing = new THREE.Vector2(0,0);

        if(keys.front) facing.y = 1;
        else if(keys.back) facing.y = -1;

        if(keys.left) facing.x = -1;
        else if(keys.right) facing.x = 1;

        var angle = Math.atan2(facing.y,facing.x) + this.rotation.y;

        if(facing.x != 0 || facing.y != 0)
        {
            this.velocity.x = Math.cos(angle)*this.speed;
            this.velocity.z = -Math.sin(angle)*this.speed;
        }
        else
        {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.velocity.z = 0;
        }
        this.move();
    }
}

Player.extends(Entity);