var game = new ex.Engine({
  width: 800,
  height: 600

});

game.setAntialiasing(false);
game.backgroundColor = ex.Color.fromHex("#000080");
var paddle = new ex.Actor(50, game.drawHeight - 40, 150, 20);
var audio = new Audio('/home/praktikum/git/breakout/sound/plop.wav');
var intro = new Audio('/home/praktikum/git/breakout/sound/powerup.wav');
var verloren = new Audio('/home/praktikum/git/breakout/sound/gameover.wav')
var gewonnen = new Audio('/home/praktikum/git/breakout/sound/win.wav')


var loader = new ex.Loader(intro, verloren, gewonnen, audio, paddle);

game.start(loader);

// Farbe des Paddles
paddle.color = ex.Color.Chartreuse;

// Kollisionstyp des Paddles
paddle.collisionType = ex.CollisionType.Fixed;

// Paddle hinzufügen
game.add(paddle);

// Lautstärke der Hintergrundmusik
intro.volume = 0.2;

// Mausbewegungen erkennen und auf Paddle übertragen
game.input.pointers.primary.on('move', function(evt) {
  paddle.pos.x = evt.worldPos.x;

});

// Ball entstehen lassen
var ball = new ex.Actor(100, 300, 20, 20);

// Farbe des Balls
ball.color = ex.Color.Red;

// Geschwindigkeit des Balls
var h = 240;
ball.vel.setTo(h, h);

// Kollisionstyp des Balls
ball.collisionType = ex.CollisionType.Aktive;

// Ball trifft Wand
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

// Ball erstellen
ball.draw = function(ctx, delta) {
  ctx.fillStyle = this.color.toString();
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

// Ball hinzufügen
game.add(ball);

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

// Blöcke erzeugen
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
    // Block Array erzeugen
    bricks.push(new ex.Actor(xoffset + i * (brickWidth + padding) + padding, yoffset + j * (brickHeight + padding) + padding, brickWidth, brickHeight, brickColor[j % brickColor.length]));
  }
}

// Blöcke hinzufügen
bricks.forEach(function(brick) {
  //Kollision
  brick.collisionType = ex.CollisionType.Active;
  // Block hinzufügen
  game.add(brick);
});

var score = 0;
var steineübrig = bricks.length;
var itemsdropped = 0
var itemsmax = Math.round(bricks.length / 3);
//var itemsmax =  Math.round(bricks.length); // zum testen immer ein Item droppen

// Item vom Typ Speedy
var speedy = ex.Actor.extend({
  typ: "Speedy",
  getTyp: function() {
    return (this.typ);
  },
  getSpeed: function() {
    return (1.2);
  },
  getPaddleSize: function() {
    return (150);
  }
});

// Item vom Typ Slowy
var slowy = ex.Actor.extend({
    typ: "Slowy",
    getTyp: function() {
      return (this.typ);
    },
    getSpeed: function() {
      return (0.9);
    },
    getPaddleSize: function() {
      return (150);
    }
  });

// Item vom Typ BigPaddle
var bigpaddle = ex.Actor.extend({
    typ: "BigPaddle",
    getTyp: function() {
      return (this.typ);
    },
    getSpeed: function() {
      return (1);
    },
    getPaddleSize: function() {
      return (250);
    }
  });

// Item vom Typ SmallPaddle
var smallpaddle = ex.Actor.extend({
    typ: "SmallPaddle",
    getTyp: function() {
      return (this.typ);
    },
    getSpeed: function() {
      return (1);
    },
    getPaddleSize: function() {
      return (50);
    }
  });

ball.on('precollision', function(ev) {
  audio.play();
  var speedup = 0;

  // Wenn der Ball einen Block berührt, zerstöre ihn und erhöhe die Punkte
  if (bricks.indexOf(ev.other) > -1) {

    var dropit = false;

    // Zufallszahl ob Item gedroppt werden soll
    var mathrandom = (Math.floor(Math.random() * 3));

    // ein Item soll immer fallen, wenn minimale Anzahl nicht mehr erreicht werden kann
    if (itemsmax - itemsdropped == steineübrig) {
      dropit = true;
    } else if (mathrandom == 1) {
        dropit = true;
    }

    // Item soll fallen
    if (dropit == true) {

      // Zufallszahl welches Item erscheinen soll
      var mathrandom2 = Math.random();
      console.log(mathrandom2);
      if (mathrandom2 <= 0.25) {
        var collisionItem = new speedy(ev.other.x, ev.other.y, 20, 20, ex.Color.Green);
      }
      if (mathrandom2 > 0.25 &&  mathrandom2 <= 0.5) {
        var collisionItem = new slowy(ev.other.x, ev.other.y, 20, 20, ex.Color.Red);
      }
      if (mathrandom2 > 0.5 &&  mathrandom2 <= 0.75) {
        var collisionItem = new bigpaddle(ev.other.x, ev.other.y, 20, 20, ex.Color.Yellow);
      }
      if (mathrandom2 > 0.75) {
        var collisionItem = new smallpaddle(ev.other.x, ev.other.y, 20, 20, ex.Color.Orange);
      }
      itemsdropped++;
      game.add(collisionItem);

      // Funktion um Kollision von Item und Paddle zu prüfen
      collisionItem.collisionType = ex.CollisionType.Passive;
      collisionItem.on('precollision', function(ev) {
        if (ev.other.id == 0) {
          // Paddle getroffen, geht bestimmt noch besser,
          // da man nicht davon ausgehen kann, dass paddle id 0 hat

          intro.play();

          // Speedup aus dem Item holen

          speedup = collisionItem.getSpeed();

          ball.vel.x = ball.vel.x * speedup;
          ball.vel.y = ball.vel.y * speedup;

          paddlewidth = collisionItem.getPaddleSize();
          paddle.setWidth(paddlewidth);

          // zerstöre das Item
          collisionItem.kill();

        }
      });

      // Item fallen lassen
      collisionItem.vel.setTo(0, 200);

    }

    // Punktzahl erhöhen und Anzahl übriger Steine berechnen
    steineübrig--;
    score++;
    label.text = "     Score: " + score;

    // Block zerstören
    ev.other.kill();
  }

// gewonnen Label erstellen
  if (score == bricks.length) {
    var label2 = new ex.Label();
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
    ball.kill();
    label.kill();
    audio = false;
    gewonnen.play();

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

// Score Label
var label = new ex.Label();
label.x = 50;
label.y = 600;
label.fontFamily = "Arial";
label.fontSize = 25;
label.fontUnit = ex.FontUnit.Px
label.text = "     Score: 0";
label.color = ex.Color.White;
label.textAlign = ex.TextAlign.Center;
label.fontFamily = "Verloren, Arial, Sans-Serif"

game.add(label);

// Verloren Label
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
  ball.kill();
  label.fontSize = 50;
  label.x = 300;
  label.y = 390;
});

// Engine starten
game.start();
