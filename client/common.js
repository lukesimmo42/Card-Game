(function(exports){


exports.empty = function(){
  this.name = "empty";
  this.type = "empty";
  this.condition = "board";
  this.hitBox
};

exports.spell = function(id, name, text) {
  this.type = "spell"
};

exports.monster = function(id, name, text, condition, owner, ap, dp, game, image, code) {
  this.id = id;
  this.name = name;
  this.text = text;
  this.condition = condition;
  this.owner = owner;
  this.ap = ap;
  this.dp = dp;
  this.game = game;
  this.img = image;
  this.code = code;
  this.type = "monster";
  this.lastAttacked = -1000;
  
  this.attack = exports.defaultAttack;
  this.strike = exports.defaultStrike;
  this.use = exports.defaultUse;
  this.play = exports.defaultPlay;
  this.die = exports.defaultDie;
  
  //not used for now
  this.gotAttacked = exports.defaultGotAttacked;
  this.Attacked = exports.defaultAttacked;
  
  this.playStart = [];
  this.playEnd = []
};

exports.defaultStrike = function(target){
  console.log("attacking");
  console.log(target[0].name);
  if (target[0].type !== "empty") {
    if (this.game.monsterDamage === true) {
      target[0].dp -= this.ap;
      this.dp -= target[0].ap;
      exports.checkTrigger(this.game.triggers.monsterAttacked,[target,this]);
      if (target[0].dp<=0) {
        if (target[0].owner === 1) {
          this.game.health1 += target[0].dp
        } else if (target[0].owner === 2) {
          this.game.health2 += target[0].dp
        }
        target[0].die()
      }
      if (this.dp < 0) {
        if(this.game.attackerTakesDamage){
          if (this.owner == 1) {
            this.game.health1 += this.dp;
            exports.checkTrigger(this.game.triggers.playerTookDamage,[1,this])
          } else if (this.owner == 2) {
            this.game.health2 += this.dp;
            exports.checkTrigger(this.game.triggers.playerTookDamage,[2,this])
          }
        }
        this.die()
      }
    }
  } else {
    if (this.owner === 2 && (target === this.game.front1 || target === this.game.backLeft1 || target === this.game.backRight1)) {
      console.log("direct hit");
      this.game.health1 -= this.ap;
      exports.checkTrigger(this.game.triggers.playerGotAttacked,1,this);
      exports.checkTrigger(this.game.triggers.playerTookDamage,1,this)
    } else if (this.owner === 1 && (target === this.game.front2 || target === this.game.backLeft2 || target === this.game.backRight2)) {
      console.log("direct hit");
      this.game.health2 -= this.ap;
      exports.checkTrigger(this.game.triggers.playerGotAttacked,2,this);
      exports.checkTrigger(this.game.triggers.playerTookDamage,2,this)
    }
  }
  this.lastAttacked = this.game.turnNum;
  console.log("attack end");
  console.log(this.game.health1 + " " + this.game.health2);
  //this.game.checkWin()
  return(true)
};

/*not used for now
exports.defaultMonsterAttacked = function(attacker){
  exports.checkTrigger(this.game.triggers.monsterGotAttacked,this)
}

exports.defaultMonsterGoAttacked = function(attacked){
  exports.checkTrigger(this.game.triggers.monsterAttacked,attacked)
}*/

exports.defaultDie = function(cause){
  if (this.condition === "hand") {
    if (this.owner === 1){
      this.game.graveyard.push(this.game.hand1.splice(this.game.hand1.indexOf(this),1)) //find position of self in hand1, remove it and push it onto graveyard
    } else if (this.owner === 2) {
      this.game.graveyard.push(this.game.hand2.splice(this.game.hand2.indexOf(this),1))
    }
  } else {
    //remove all properties
    this.game.graveyard.push(this);
    for (var property in this) {
      if (this.hasOwnProperty(property)) {
          this.property = undefined
      }
    }
    this.type = "empty";
    this.condition = "board"
  }
  exports.checkTrigger(this.game.triggers.monsterDeath,[this,cause])
};

function place(from,game){
  console.log("place");
  var output = from;
  output[0].condition = "board";
  console.log(from);
  from.splice(from.indexOf(from),1);
  console.log(from);
  game.monstersPlayed++;
  output[0].playEnd.forEach(function(element) {
    element()
  });
  console.log(output);
  return(output)
}


function placeFromHand(from, target, game){
  console.log("place from hand")
  if(from[0].owner === 1){
    game.hand1.splice(game.hand1.indexOf(from),1);
  } else if(from[0].owner === 2){
    game.hand2.splice(game.hand2.indexOf(from),1);
  } else {
    return(false)
  }
  exports.overwriteCard(from, target);
  return(true)
}
//PLAYER 1 STUFF THAT USES ABOVE FUNCTION DONT WORK
//!!!!!!!!!!!!!!!!!!

//from and target are whole object
exports.defaultPlay = function(from, target, game) {
  console.log(from[0].name);
  console.log("defaultPlay");
  console.log(target[0].name);
  if (from[0].owner === 1) {
    console.log("requester and turn player 1");
    if (target === game.front1) {
      console.log("front1");
      placeFromHand(from, target, game)
      return(true)
    } else if (target === game.backLeft1) {
      console.log("backleft1");
      game.backLeft1 = place(from,game);
      return(true)
    } else if (target === game.backRight1) {
      console.log("backright1");
      game.backRight1 = place(from,game);
      return(true)
    }
  } else if (from[0].owner === 2) {
    if (target === game.front2) {
      game.front2 = game.hand2[game.hand2.indexOf(from)];
      game.front2[0].condition = "board";
      game.hand2.splice(game.hand2.indexOf(from),1);
      game.monstersPlayed++;
      game.front2[0].playEnd.forEach(function(element) {
        element()
      });
      return(true)
    } else if (target === game.backLeft2) {
      game.backLeft2 = game.hand2[game.hand2.indexOf(from)];
      game.backLeft2[0].condition = "board";
      game.hand2.splice(game.hand2.indexOf(from),1);
      game.monstersPlayed++;
      game.front1.forEach(function(element) {
        element()
      });
      return(true)
    } else if (target === game.backRight2) {
      game.backRight2 = game.hand2[game.hand2.indexOf(from)];
      game.backRight2[0].condition = "board";
      game.hand2.splice(game.hand2.indexOf(from),1);
      game.monstersPlayed++;
      game.front1.forEach(function(element) {
        element()
      });
      return(true)
    }
  }
  console.log("play failed");
  return(false)
};

exports.defaultAttack = function(target) {
  console.log("attack normal");
  if ((this.owner === 1 && (target === this.game.front2 || this.game.front2[0].type === "empty")) || (this.owner === 2 && (target === this.game.front1 || this.game.front1[0].type === "empty"))) {
    this.lastAttacked = this.game.turnNum;
    exports.checkTrigger(this.game.triggers.preAttack,[target,this]);
    return(this.strike(target))
  }
  return(false)
};

//.use functions can use multiple targets
exports.defaultUse = function(from,targets){
  var target = targets[0];
  console.log("using");
  console.log(from[0].name);
  console.log(target[0].name);
  if (from[0].condition === "hand"){
    console.log("hand");
    if (target[0].condition === "board"){
      console.log("board");
      if (from[0].game.monstersPlayed < 2){
        console.log("monstersPlayed < 2");
        if (target[0].type !== "empty") {
          target[0].die()
        }
        if( from[0].play(from,target,from[0].game) ){
          console.log("defaultuse successful");
          return(true)
        }
      }
    }
  } else if (target[0].condition === "board" && from[0].condition === "board" && from[0].lastAttacked !== from[0].game.turnNum) {
    console.log("board");
    if( from[0].attack(target) ){
      console.log("defaultuse successful");
      return(true)
    }
  }
  return(false)
};

//convert text into the corresponding object
exports.testInput = function(string,game){
  if(string === "front1"){
    return(game.front1)
  } else if(string === "backLeft1"){
    return(game.backLeft1)
  } else if(string === "backRight1"){
    return(game.backRight1)
  } else if(string === "front2"){
    return(game.front2)
  } else if(string === "backLeft2"){
    return(game.backLeft2)
  } else if(string === "backRight2"){
    return(game.backRight2)
  } else if(string.slice(0, 5) === "hand1"){
    if (string.slice(5, 6)<game.hand1.length){
      return(game.hand1[string.slice(5, 6)])
    }
  } else if(string.slice(0, 5) === "hand2"){
    if (string.slice(5, 6)<game.hand2.length){
      return(game.hand2[string.slice(5, 6)])
    }
  }
  return(false)
};


exports.drawCard = function(card,x,y,cardWidth,cardHeight,shown,highlight){
  //console.log("drawing", card.name)
  if (highlight===card) {
    stroke(255,255,0)
  } else {
    stroke(0,0,0)
  }
  if (card.type === "fake" || !shown) {//draw back
    noFill();
    rect(x,y,cardWidth,cardHeight)
  } else if(card.type === "empty"){//draw empty rectangle
    noFill();
    rect(x,y,cardWidth,cardHeight)
  } else {//draw card
    if(card.img) {image(card.img,x,y,cardWidth,cardHeight);console.log("draw img")}
    noFill();
    rect(x,y,cardWidth,cardHeight);
    fill(0,0,0);
    noStroke();
    textAlign(CENTER,TOP);
    text(card.name, cardWidth/2 +x, y+2);
    textAlign(LEFT,BOTTOM);
    text(card.ap, x+2, y+cardHeight);
    textAlign(RIGHT,BOTTOM);
    text(card.dp, x-2+cardWidth, y+cardHeight)
  }
};

exports.dealDamageMinion = function(damage){
  console.log("dealDamageMinion()");
  if (damage>0){
    var target = locationSelection();
    target.dp-=damage;
    exports.checkTrigger(target.game.triggers.monsterDamaged,[target,"common.dealDamage"]);
    if (target.dp<=0) {
      if (target.owner === 1) {
        target.game.health1 += target.dp
      } else if (target.owner === 2) {
        target.game.health2 += target.dp
      }
      target.die()
    }
  }
};

exports.dealDamageHealth = function(damage,target){
  console.log("dealDamage()");
  if (damage>0){
    target.dp -= damage;
    exports.checkTrigger(target.game.triggers.monsterDamaged,[target,"common.dealDamage"]);
    if (target.dp<=0) {
      if (target.owner === 1) {
        target.game.health1 += target.dp
      } else if (target.owner === 2) {
        target.game.health2 += target.dp
      }
      target.die()
    }
  }
};

exports.dealDamage = function(damage,target){
  console.log("dealDamage()")
  /*if (damage>0){
    target.dp-=damage
    exports.checkTrigger(target.game.triggers.monsterDamaged,[target,"common.dealDamage"])
    if (target.dp<=0) {
      if (target.owner == 1) {
        target.game.health1 += target.dp
      } else if (target.owner == 2) {
        target.game.health2 += target.dp
      }
      target.die()
    }
  }*/
};

exports.triggers = function(){ //returns an obj with all triggers as properties
  let obj = {}
  obj.monsterDeath = []; //monster,cause
  obj.monsterDamageReceived = []; //monster,cause
  obj.monsterDamaged = []; //monster,cause
  obj.monsterAttacked = []; //attacked,attacker
  obj.preAttack = []; //attacked,attacker

  obj.playerGotAttacked = []; //attacked,attacker
  obj.playerTookDamage = [] //player,cause
  return(obj)
};

//for checking if an event has triggered a condition
//i.e. monster was killed so is there a deathrattle or another cards ability that would be triggered
exports.checkTrigger = function(toCheck,trigger){
  console.log("checking triggers:");
  if (toCheck.length>0){
    console.log(trigger);
    console.log(toCheck);
    var array = toCheck.Splice;
    for(var i=0; i<array.length; i++){
      array[i](trigger)
    }
  } else {
    console.log("toCheck array is empty")
  }
};

//adds monsters functions from its code property
exports.monsterCode = function(monster,code){
  console.log("monsterCode()");
  if (!monster) {
    console.log("no monster");
    return("no monster")
  } else if (!code){
    console.log("code empty");
    return("code empty")
  } else {
    console.log(monster);
    console.log(code);
    var blocks = code.split(";");
    var block;
    var where;
    var what;
    var params = [];
    for (var i=0; i<blocks.length; i++){
      block = blocks[i].split(":");
      console.log("block:" + block);
      
      //put all items from pos 3 into params
      for (var j=2; j<block.length; j++){
        params[j-2]=block[j];
        console.log("parameter created")
      }
      /*if(block[0] == "playEnd"){
        console.log(monster)
        where = monster.playEnd
      }*/
      switch (block[0]) {
        case "playEnd":
          console.log(monster);
          where = monster.playEnd;
          break;
        default: 
          console.log("block[0] empty");
          return(false)
      }
      /*if(block[1] == "dealDamage"){
        what = exports.wrapFunction(exports.dealDamage(),this,[params])
      }*/
      switch (block[1]) {
        case "dealDamage":
          what = (exports.wrapFunction(exports.dealDamage,this,[params]));
          break;
        default: 
          console.log("block[1] empty");
          return(false)
      }
      console.log("1");
      where.push(what);
      console.log("2")
    }
  }
};

//creates an instance of the given monster
exports.createMonsterFromId = function(monster, condition, owner){
  console.log("creating monster:");
  console.log(monster);
  var output = new exports.monster(monster.id,monster.name,monster.text,"database","database",monster.ap,monster.dp,monster.game,null,monster.code);
  output.condition = condition;
  output.owner = owner;
  exports.monsterCode(output,monster.code);
  console.log(output);
  return(output)
};

exports.overwriteCard = function(card, target){
  target[0] = card[0]
  target[1] = card[1]
};

function arrow(x1,x2) { 
  var r = 16; //vertex radius
  stroke(0);
  var offset = r;
  line(x1.x, x1.y, x2.x, x2.y); //draw a line beetween the vertices

  // this code is to make the arrow point
  push(); //start new drawing state
  var angle = atan2(x1.y - x2.y, x1.x - x2.x); //gets the angle of the line
  translate(x2.x, x2.y); //translates to the destination vertex
  rotate(angle-HALF_PI); //rotates the arrow point
  triangle(-offset*0.5, offset, offset*0.5, offset, 0, -offset/2); //draws the arrow point as a triangle
  pop();
  
}

// Function wrapping code.
// fn - reference to function. DONT PUT () AFTER fn i.e. dealDamage() WHEN CALLING wrapFunction
// context - what you want "this" to be.
// params - array of parameters to pass to function.
exports.wrapFunction = function(fn, context, params) {
  return function() {
    fn.apply(context, params)
  };
};

exports.test = function(){
      return 'hello world'
};

exports.rearrange = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

exports.extend = function(_a,_b, remove){ //https://stackoverflow.com/a/18441219
  remove = remove === undefined ? false : remove;
  var a_traversed = [], b_traversed = [];
  _extend(_a,_b);

  function _extend(a,b) {
    if (a_traversed.indexOf(a) == -1 && b_traversed.indexOf(b) == -1){
      a_traversed.push(a);
      b_traversed.push(b);
      if (a instanceof Array){
        for (var i = 0; i < b.length; i++) {
          if (a[i]){  // If element exists, keep going recursive so we don't lose the references
            a[i] = _extend(a[i],b[i]);
          } else {
            a[i] = b[i];    // Object doesn't exist, no reference to lose
          }
        }
        if (remove && b.length < a.length) { // Do we have fewer elements in the new object?
          a.splice(b.length, a.length - b.length);
        }
      }
      else if (a instanceof Object){
        for (var x in b) {
          if (a.hasOwnProperty(x)) {
            a[x] = _extend(a[x], b[x]);
          } else {
            a[x] = b[x];
          }
        }
        if (remove) for (var x in a) {
          if (!b.hasOwnProperty(x)) {
            delete a[x];
          }
        }
      }
      else{
        return b;
      }
      return a;
    }
  }
}

})(typeof exports === 'undefined'? this['common']={}: exports);