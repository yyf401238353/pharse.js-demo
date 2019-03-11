var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var player;
var stars;
var bombs;
var cursors
var platforms;
var score = 0;
var gameOver = false;
var scoreText;
var rootPath= '/static/';
var playerId;
var firstTime = true;

var game = new Phaser.Game(config);

game.removePlayer = function(id){
  game.playerMap[id].destroy();
  delete game.playerMap[id];
};
function preload ()
{
  this.load.image('sky', rootPath+'assets/sky.png');
  this.load.image('ground', rootPath+'assets/platform.png');
  this.load.image('star',rootPath+ 'assets/star.png');
  this.load.image('bomb', rootPath+'assets/bomb.png');
  this.load.spritesheet('dude', rootPath+'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
  game.addNewPlayer = (id,x,y)=>{
    console.log(game)
    game.playerMap[id] = this.physics.add.sprite(x,y,'dude');
    console.log(firstTime)
    if(firstTime){
      playerId=id
      firstTime=false
    }
    this.physics.add.collider(game.playerMap[id], platforms);
    game.playerMap[id].setBounce(0.2);
    game.playerMap[id].setCollideWorldBounds(true);
    this.physics.add.overlap(game.playerMap[id], stars, collectStar, null, this);
    this.physics.add.collider(game.playerMap[id], bombs, hitBomb, null, this);
  };
  game.movePlayer = (id,moveX,moveY)=>{
    console.log(moveX)
    console.log(moveY)
    console.log(id)
    if (moveX == 'left')
    {
      game.playerMap[id].setVelocityX(-160);
      game.playerMap[id].anims.play('left', true);
    }
    else if (moveX == 'right')
    {
      game.playerMap[id].setVelocityX(160);
      game.playerMap[id].anims.play('right', true);
    }
    else if (moveX == 'turn')
    {
      game.playerMap[id].setVelocityX(0);
      game.playerMap[id].anims.play('turn');
    }

    if (moveY == 'up' && game.playerMap[id].body.touching.down)
    {
      game.playerMap[id].setVelocityY(-330);
    }
};
  //  A simple background for our game
  this.add.image(400, 300, 'sky');
  cursors = this.input.keyboard.createCursorKeys();
  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  // // The player and its settings
  // console.log(this)
  // player = this.physics.add.sprite(100, 450, 'dude');

  // //  Player physics properties. Give the little guy a slight bounce.
  // player.setBounce(0.2);
  // player.setCollideWorldBounds(true);

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
  });

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
  });

  //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {

      //  Give each star a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

  });

  bombs = this.physics.add.group();

  //  The score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  //  Collide the player and the stars with the platforms
  // this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  // this.physics.add.overlap(player, stars, collectStar, null, this);

  // this.physics.add.collider(player, bombs, hitBomb, null, this);
  
  game.playerMap = {};
  Client.askNewPlayer();



}

function update ()
{
  if (gameOver)
  {
      return;
  }
  console.log(game.playerMap[playerId])
  if(game.playerMap[playerId]){
    var moveObj={moveX:'',moveY:''}
    var changed=false
    if (cursors.left.isDown)
    {
      if(game.playerMap[playerId].moveX != 'left'){
        moveObj.moveX ='left'
        game.playerMap[playerId].moveX = 'left'
        changed = true
      }
      // Client.socket.emit('keydown','left');
      // console.log('left')
    }
    else if (cursors.right.isDown)
    {
      if(game.playerMap[playerId].moveX != 'right'){
        moveObj.moveX ='right'
        game.playerMap[playerId].moveX = 'right'
        changed = true
      }
      // Client.socket.emit('keydown','right');
      // console.log('right')
    }else {
      if(game.playerMap[playerId].moveX != 'turn'){
        moveObj.moveX ='turn'
        game.playerMap[playerId].moveX = 'turn'
        changed = true
      }
      // Client.socket.emit('keydown','turn');
      // console.log('turn')
    }
    
    if (cursors.up.isDown)
    {
      moveObj.moveY='up'
      changed = true
      // Client.socket.emit('keydown','up');
      // console.log('jump')
    }
    if(changed){
      Client.socket.emit('keydown',moveObj);
    }
  }
  
}

function collectStar (player, star)
{
  star.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0)
  {
      //  A new batch of stars to collect
      stars.children.iterate(function (child) {

          child.enableBody(true, child.x, 0, true, true);

      });

      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;

  }
}

function hitBomb (player, bomb)
{
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}