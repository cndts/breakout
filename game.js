var game = new ex.Engine({
  width: 800,
  height: 600

});

game.setAntialiasing(false);
game.backgroundColor = ex.Color.fromHex("#000080");
var paddle = new ex.Actor(50, game.drawHeight - 40, 150, 20);
var audio = new Audio('/home/praktikum/git/breakout/sound/plop.wav');
var intro = new Audio('/home/praktikum/git/breakout/sound/intro.wav');
var verloren = new Audio('/home/praktikum/git/breakout/sound/gameover.wav')
var gewonnen = new Audio('/home/praktikum/git/breakout/sound/win.wav')
var powerup = new Audio('home/praktikum/git/breakout/sound/powerup.wav')
var badpowerup = new Audio('home/praktikum/git/breakout/sound/wrongitem.wav')
var loader = new ex.Loader(audio, intro, verloren, gewonnen, powerup, badpowerup, paddle);



game.start(loader);

// Position und Größe


// Farbe
paddle.color = ex.Color.Chartreuse;

// Kollision
paddle.collisionType = ex.CollisionType.Fixed;


// Objekt hinzufügen
game.add(paddle);

intro.play();
intro.volume = 0.2;
// Maus bewegungen erkennen
game.input.pointers.primary.on('move', function(evt) {
  paddle.pos.x = evt.worldPos.x;

});

// Ball entstehen lassen
var ball = new ex.Actor(100, 300, 20, 20);

// Farbe
ball.color = ex.Color.Red;

// Geschwindigkeit
var h = 240;
ball.vel.setTo(h, h);

// Kollision
ball.collisionType = ex.CollisionType.Aktive;



ball.on('postupdate', function() {

  // Links
  if (this.pos.x < (this.getWidth() / 2)) {
    this.vel.x *= -1;
    audio.play();
  }

  // Rechts
  if (this.pos.x + (this.getWidth() / 2) > game.drawWidth) {
    this.vel.x *= -1;
    audio.play();
  }

  // Oben
  if (this.pos.y < (this.getHeight() / 2)) {
    this.vel.y *= -1;
    audio.play();
  }
});

// Ball machen
ball.draw = function(ctx, delta) {
  ctx.fillStyle = this.color.toString();
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

// Ball hinzufügen
game.add(ball);

ball.on('exitviewport', function() {
  verloren.play();
  var label1 = new ex.Label();
  label1.x = 400;
  label1.y = 340;
  label1.fontFamily = "Arial";
  label1.fontSize = 80;
  label1.fontUnit = ex.FontUnit.Px
  label1.text = "Verloren";
  label1.color = ex.Color.Chartreuse;
  label1.textAlign = ex.TextAlign.Center;
  label1.fontFamily = "Verloren, Arial, Sans-Serif";
  game.add(label1);
  paddle.kill();
  audio = false;

});

// Lücken zwischen und neben den Blöcken
var padding = 20;
var xoffset = 65;
var yoffset = 20;
var columns = 5;
var rows = 3;

var brickColor = [ex.Color.fromHex("#FFFF00"), ex.Color.fromHex("#ff0000"), ex.Color.fromHex("#00FFFF")];
var itemColor = [ex.Color.None, ex.Color.None, ex.Color.None];

var a = 0
var b = 0

// Blöcke und Items erzeugen
var brickWidth = game.drawWidth / columns - padding - padding / columns; // px
var itemWidth = (game.drawWidth / columns - padding - padding / columns) / 3.75; // px
var brickHeight = 30;
var itemHeight = 20;
var bricks = [];
var items = [];
for (var j = 0; j < rows; j++) {
  a++
  for (var i = 0; i < columns; i++) {
    b++
    if (i % 3 == 1) {
      var speedy = ex.Actor.extend({
        typ: "Speedy",
        getTyp: function() {
          return (this.typ);
        },
        getSpeed: function() {
          return (1.2);

        }

      });

      var actor = new speedy(xoffset + i * ((itemWidth + padding) * 2.75) + padding, yoffset + j * ((itemHeight + padding) * 1.2) + padding, itemWidth, itemHeight, ex.Color.Green);

    } else {

      var slowy = ex.Actor.extend({
        typ: "Slowy",
        getTyp: function() {
          return (this.typ);
        },
        getSpeed: function() {
          return (0.9);

        }
      });

      var actor = new slowy(xoffset + i * ((itemWidth + padding) * 2.75) + padding, yoffset + j * ((itemHeight + padding) * 1.2) + padding, itemWidth, itemHeight, ex.Color.Red)
    }

    // Item Array erzeugen
    items.push(actor);

    // Block Array erzeugen
    bricks.push(new ex.Actor(xoffset + i * (brickWidth + padding) + padding, yoffset + j * (brickHeight + padding) + padding, brickWidth, brickHeight, brickColor[j % brickColor.length]));

  }
}

// erst die Items hinzufügen
items.forEach(function(item) {
  // Block hinzufügen
  game.add(item);
});

// dann darüber die Blöcke
bricks.forEach(function(brick) {
  //Kollision
  brick.collisionType = ex.CollisionType.Active;
  // Block hinzufügen
  game.add(brick);
});

var score = 0;


ball.on('precollision', function(ev) {
  audio.play();
  var speedup = 0;

  // Wenn der Ball einen Block berührt, zerstöre ihn und erhöhe die Punkte
  if (bricks.indexOf(ev.other) > -1) {

    // neue Kollisionsitem ableiten
    var collisionItem = (items[bricks.indexOf(ev.other)]);

    collisionItem.collisionType = ex.CollisionType.Passive;
    collisionItem.on('precollision', function(ev) {

      if (ev.other.id == 0) {

        // Paddle getroffen, geht bestimmt noch besser,
        // da man nicht davon ausgehen kann, dass paddle id 0 hat

        // Speedup aus dem Item holen
        speedup = collisionItem.getSpeed();


        ball.vel.x = ball.vel.x * speedup;
        ball.vel.y = ball.vel.y * speedup;

        // zerstöre das Item
        collisionItem.kill();
      }
    });

    // Item fallen lassen
    collisionItem.vel.setTo(0, 200);

    // Punktzahl erhöhen
    score++;
    label.text = "     Score: " + score;

    // Block zerstören
    ev.other.kill();
  }

  if (score == bricks.length) {
    gewonnen.play();
    var label1 = new ex.Label();
    label2.x = 400;
    label2.y = 360;
    label2.fontFamily = "Arial";
    label2.fontSize = 80;
    label2.fontUnit = ex.FontUnit.Px
    label2.text = "Gewonnen";
    label2.color = ex.Color.Chartreuse;
    label2.textAlign = ex.TextAlign.Center;
    label2.fontFamily = "Verloren, Arial, Sans-Serif";
    game.add(label2);
    paddle.kill();
    audio = false;
  }

  // reverse course after any collision
  // intersections are the direction body A has to move to not be clipping body B
  // `ev.intersection` is a vector `normalize()` will make the length of it 1
  // `negate()` flips the direction of the vector
  var intersection = ev.intersection.normalize();
  if (Math.abs(intersection.x) > Math.abs(intersection.y)) {
    ball.vel.x *= -1;
  } else {
    ball.vel.y *= -1;
  }
});

var label = new ex.Label();
label.x = 50;
label.y = 600;
label.fontFamily = "Arial";
label.fontSize = 30;
label.fontUnit = ex.FontUnit.Px
label.text = "     Score: 0";
label.color = ex.Color.White;
label.textAlign = ex.TextAlign.Center;

game.add(label);

// Engine starten
game.start();
