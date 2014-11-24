var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('soldier', 'assets/yellow_soldier.png', 50, 50);
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('explosion', 'assets/explosion.png');

}

var player;
var isDown = false;
var bullets = [];
var explosion;
var platforms;
var cursors;
var keyboard;
var updateCounter = 0;
var weapon = {
    velocity:100, //milliseconds
    damage: 1
};
var lastShoot; //timestamp

var stars;
var score = 0;
var scoreText;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(64, game.world.height - 250, 'soldier');
    player.direction = 'right';

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 650;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [14, 15, 16, 17, 18, 19, 20, 21], 7, true);
    player.animations.add('right', [6, 7, 8, 9, 10, 11, 12, 13], 10, true);

    bullets = game.add.group();
    bullets.enableBody = true;

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    keyboard = game.input.keyboard;
    cursors = keyboard.createCursorKeys();

    lastShoot = new Date();
}

function update() {
    // console.log('++updateCounter');

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
        player.direction = 'left';
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
        player.direction = 'right';
    }
    else
    {
        //  Stand still
        player.animations.stop();

        if(player.direction === 'right'){
            player.frame = 0;
        } else {
            player.frame = 1;
        }
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -650;
    }

    if (keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        // console.log(new Date() - lastShoot);
        if (new Date() - lastShoot > weapon.velocity ){
            lastShoot = new Date();
            if(player.direction === 'right'){
                var bullet = bullets.create(player.body.position.x + 35, player.body.position.y +18, 'bullet');
                bullet.body.velocity.x = 300;
            } else {
                var bullet = bullets.create(player.body.position.x, player.body.position.y +18, 'bullet');
                bullet.body.velocity.x = -300;
            }
        }
    }

    // if(cursors.down.isDown){
    //     if (!isDown){
    //         player.body.velocity /= 2;
    //     }
    //     isDown = true;
    //     if (player.direcion === 'right'){
    //         player.frame = 2;
    //     } else {
    //         player.frame = 3;
    //     }
    // } else {
    //     isDown = false;
    //     player.body.velocity *= 2;

    // }

    function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
}
}
