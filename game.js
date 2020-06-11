let config = {
    type : Phaser.AUTO,
    scale: {
        mode : Phaser.Scale.FIT,
        height : 600,
        width : 1200
    },
    physics : {
        default : "arcade",
        arcade: {
            gravity : {
                y : 5000
            }
        }
    },
    backgroundColor : 0xffff11,
    scene : {
        preload : preload,
        create : create,
        update : update
    }
};

let game = new Phaser.Game(config);

let player_config = {
    player_speed : 450,
    player_jumpspeed : -2700
};

function preload(){
    this.load.image("ground","Assets/topground.png");
    this.load.image("sky","Assets/background.png");
    this.load.image("apple","Assets/apple.png");
    this.load.image("ray","Assets/ray.png")
    this.load.image("tree","Assets/tree.png")
    this.load.spritesheet("player","Assets/dude.png",{
        frameWidth : 32,
        frameHeight : 48
    });
}

function create(){
    W = game.config.width;
    H = game.config.height;
    
    let ground = this.add.tileSprite(0,H-128,W,128,"ground"); // Repeat image from 0,H-128 to W,128
    ground.setOrigin(0,0); // Image Origin from centre to top left
    
    let sky = this.add.sprite(0,0,"sky");
    sky.setOrigin(0,0);
    sky.displayWidth = W;
    sky.displayHeight = H;
    sky.depth = -1;
    
    let tree = this.add.sprite(500,H-128,"tree");
    let tree1 = this.add.sprite(100,H-128,"tree");
    let tree2 = this.add.sprite(1000,H-128,"tree");
    tree.setOrigin(0.5,1);
    tree.setScale(0.6);
    tree1.setOrigin(0.5,1);
    tree1.setScale(0.3);
    tree2.setOrigin(0.5,1);
    tree2.setScale(0.4);
    let rays = [];
    for(let i=-10;i<=10;i++){
        let ray = this.add.sprite(W/2,H-100,"ray");
        ray.displayHeight = 1.2*H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*20;
        ray.depth = -1;
        rays.push(ray);
    }
    
    this.tweens.add({
        targets : rays,
        props: {
            angle : {
                value : "+=160"
            }
        },
        duration : 6000,
        repeat : -1
    });
    
    this.player = this.physics.add.sprite(100,100,"player",4); // Using this.player instead of let so that can be used in other
//    this.player.setScale(2);       //  Functions as well and increased character size to twice 
    this.player.setBounce(0.5);
    this.player.setCollideWorldBounds(true);
    //Adding Animations and Movements
    
    this.anims.create({
        key : 'left',
        frames : this.anims.generateFrameNumbers('player',{start: 0, end:3}),
        frameRate : 10,
        repeat : -1
    });
    
    this.anims.create({
        key : 'center',
        frames : this.anims.generateFrameNumbers('player',{start: 4, end:4}),
        frameRate : 10,
    });
    
    this.anims.create({
        key : 'right',
        frames : this.anims.generateFrameNumbers('player',{start: 5, end:8}),
        frameRate : 10,
        repeat : -1
    });
    
    this.cursors = this.input.keyboard.createCursorKeys();
    
    let fruits = this.physics.add.group({
        key: "apple",
        repeat : 8,
        setScale : {x:0.2,y:0.2},
        setXY : {x : 10 , y : 0 , stepX : 140}
    });
    
    fruits.children.iterate(function(f){
        f.setBounce(Phaser.Math.FloatBetween(0.3,0.6));
    });
    
    let platforms = this.physics.add.staticGroup();
    platforms.add(ground);
    platforms.create(900,400,"ground").setScale(2,0.5).refreshBody();
    platforms.create(600,300,"ground").setScale(2,0.5).refreshBody();
    platforms.create(300,400,"ground").setScale(2,0.5).refreshBody();
    
    
    this.physics.add.existing(ground,true);  // Passing true makes ground a static object
    ground.body.allowGravity = false;
    ground.body.immovable = true;   // False on Collision due to Momentum if false
    this.physics.add.collider(ground,this.player); // Add a Collider between Player an Ground
//    this.physics.add.collider(ground,fruits);
    this.physics.add.collider(platforms,fruits);
    this.physics.add.collider(platforms,this.player);
    this.physics.add.overlap(this.player,fruits,eatFruit,null,this);
    
    this.cameras.main.setBounds(0,0,W,H);
    this.physics.world.setBounds(0,0,W,H);
    
    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(2);
}

function update(){
    if(this.cursors.left.isDown){
        this.player.setVelocityX(-player_config.player_speed);
        this.player.anims.play('left',true);
    }
    else if(this.cursors.right.isDown){
        this.player.setVelocityX(player_config.player_speed);
        this.player.anims.play('right',true);
    }
    else{
        this.player.setVelocityX(0);
        this.player.anims.play('center',true);
    }
    
    // Add Jump
    if(this.cursors.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(-player_config.player_jumpspeed);
    }
}

function eatFruit(player,fruit){
    fruit.disableBody(true,true);
}