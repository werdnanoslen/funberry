// game variables
var game, video, knocker, leftEmitter, rightEmitter;
var knockerSpeed = 300;

// fallback canvas dimensions
var canvasWidth = 800;
var canvasHeight = 600;

// get video feed, then start building the game
if (hasGetUserMedia()){
    navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
    navigator.getUserMedia({
        video: true,
        audio: false
    }, function(localMediaStream) {
        video = document.querySelector('video');
        video.src = window.URL.createObjectURL(localMediaStream);
        // wait until video data has loaded before creating/sizing canvas
        video.onloadeddata = function (metadata) {
            console.log(metadata);
            canvasWidth = video.videoWidth;
            canvasHeight = video.videoHeight;
            init();
        };
    }, function(error) {
        console.error('getUserMedia error: ', error);
    });
} else {
    alert('getUserMedia() is not supported in your browser');
}



function create() {
    // interactions
    game.physics.startSystem(Phaser.Physics.ARCADE);
    cursors = game.input.keyboard.createCursorKeys();

    // add sprite to screen
    knocker = game.add.sprite(canvasWidth/2, canvasHeight/2, 'knocker');
    game.physics.enable(knocker, Phaser.Physics.ARCADE);
    knocker.body.immovable = true;
    knocker.body.collideWorldBounds = true;

    leftEmitter = game.add.emitter(0, 0);
    leftEmitter.bounce.setTo(0.5, 0.5);
    leftEmitter.setXSpeed(100, 200);
    leftEmitter.setYSpeed(-50, 50);
    leftEmitter.makeParticles('balloon', 0, 5, 1, true);

    rightEmitter = game.add.emitter(game.world.width, 0);
    rightEmitter.bounce.setTo(0.5, 0.5);
    rightEmitter.setXSpeed(-100, -200);
    rightEmitter.setYSpeed(-50, 50);
    rightEmitter.makeParticles('balloon', 1, 5, 1, true);

    // explode, lifespan, frequency
    leftEmitter.start(false, 10000, 2000);
    rightEmitter.start(false, 10000, 2000);
}

// test if browser supports usermedia
function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

// create, configure game
function init() {
    game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.CANVAS, 'phaser-example', {
        preload: preload,
        create: create,
        update: update
    }, true);
}

// preload asset files
function preload() {
    game.load.spritesheet('balloon', 'balloon.png', 74, 100);
}

function update() {
    // Enable physics between the knocker and the balloonss
    game.physics.arcade.collide(knocker, leftEmitter);
    game.physics.arcade.collide(knocker, rightEmitter);
    game.physics.arcade.collide(leftEmitter, rightEmitter);
    game.physics.arcade.collide(leftEmitter, leftEmitter);
    game.physics.arcade.collide(rightEmitter, rightEmitter);

    // knocker controls
    if (cursors.up.isDown) {
        knocker.body.velocity.y = -knockerSpeed;
    } else if (cursors.down.isDown) {
        knocker.body.velocity.y = knockerSpeed;
    } else if (cursors.left.isDown) {
        knocker.body.velocity.x = -knockerSpeed;
    } else if (cursors.right.isDown) {
        knocker.body.velocity.x = knockerSpeed;
    } else {
        knocker.body.velocity.setTo(0, 0);
    }
}
