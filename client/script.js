"use strict";

var width;
var height;

var executing = false;
var executionQueue = [];
var requestAmount = 0;
var selectingBoard = false;

var perspec = 1;
var me = -1;
var selected = false;
var selectedStr;

var message;

var game = gameInstance();

//io object is declared in the socket.io.js library referenced in header
//connect to the website
var  socket  =  io.connect("http://localhost:8080");

socket.on("message", function(text){
  message = text;
  console.log(message);
});

socket.on("turn",function(newPlayer){
  console.log("'turn'");
  var x = common.wrapFunction(turn,this,[newPlayer]);
  executionQueue.push(x);
  if (executing === false){
    nextInstruction()
  }
});

function turn(newPlayer){
  executing = true;
  console.log("turn: " + newPlayer);
  //check turn end effects
  game.turnNum++;
  game.currentPlayer = newPlayer;
  resetStuff();
  //check turn start effects
  if (newPlayer === 1){
    var hand = game.hand1;
    var deck = game.deck1
  } else if (newPlayer === 2){
    var hand = game.hand2;
    var deck = game.deck2
  }
  var x = common.wrapFunction(pickUp,this,[hand, deck, newPlayer, newPlayer]);
  executionQueue.push(x);
  executing = false;
  nextInstruction()
}


function gameInstance(){
  let x = {
    health1: 30,
    health2: 30,
    decklist1: [],
    decklist2: [],
    deck1: [],
    deck2: [],
    hand1: [],
    hand2: [],
    front1: [],
    front2: [],
    backLeft1: [],
    backRight1: [],
    backLeft2: [],
    backRight2: [],
    graveyard: [],
    lostspells: [],
    monsters: [],
    triggers: new common.triggers(),

    currentPlayer: 1,
    turnNum: 0,
    monstersPlayed: 0,

    monsterDamage: true,
    attackerTakesDamage: true,
  }
  x.front1[0] = new common.empty();
  x.front2[0] = new common.empty();
  x.backLeft1[0] = new common.empty();
  x.backRight1[0] = new common.empty();
  x.backLeft2[0] = new common.empty();
  x.backRight2[0] = new common.empty();

  return(x)
}

function fake(condition,owner){
  this.type = "fake";
  this.owner = owner;
  this.condition = condition;
  this.hitBox
}

socket.emit("quickplay");

//monsters[0] = new monster(1, "wizard", "", "database", "database", 4, 2, game)

function locationSelection(){
  
}

function requestCard(id) {
  socket.emit("request card", id, function(id,name,type,ap,dp,text,image,code){
    console.log("call back");
    console.log(ap,dp);
    x=new common.monster(id,name,text,"database","database",ap,dp,game)
  })
}

socket.on("use", function(from, to, unknown){
  console.log("received use: " + from + to);
  var x = common.wrapFunction(using, this, [from, to, unknown]);
  executionQueue.push(x);
  if (executing === false){
    nextInstruction()
  }
});


//Finds unknown cards to allow the .use function to be called
function using(from, to, unknown){
  executing = true;
  console.log("'use'");
  var card=common.testInput(from,game);
  var targets = [];
  to.forEach(function(element,i){
    targets[i] = common.testInput(element,game)
  });
  if(card === false || targets.some === false){
    console.log("one of the cards doesnt exist");
    executing = false;
    nextInstruction()
  
  //if cards passed exist (ie not "front3")
  }else{
    var wait = 0; // only continue once all cards are known
    if (card[0].type === "fake"){
      wait+=1;// dont know card so need to wait for server to tell us
      socket.emit("whatdis", card[1], function(monsterid){
        console.log(monsterid);
        var owner = card[0].owner;
        //is card known?
        if (!game.monsters[monsterid]){
          //then request card
          console.log("requesting card with id: " + monsterid);
          socket.emit("request card", monsterid, function(id,name,type,ap,dp,text,image,code){
            console.log("call back");
            console.log(ap,dp);
            //add card to database
            game.monsters[monsterid]=new common.monster(id,name,text,"database","database",ap,dp),game;
            card[0]= new common.monster(id,name,text,"database","database",ap,dp,game);
            card[0].condition = "hand";
            card[0].owner = owner;
            wait-=1;
            if (wait === 0) {
              card[0].use(card,targets);
              executing = false;
              nextInstruction()
            }
          })
        } else {
          card[0] = new common.monster(game.monsters[monsterid].id,game.monsters[monsterid].name,game.monsters[monsterid].text,"database","database",game.monsters[monsterid].ap,game.monsters[monsterid].dp,game);
          card[0].condition = "hand";
          card[0].owner = owner;
          wait-=1;
          if (wait === 0) {
            console.log("correct");
            card[0].use(card,targets);
            executing = false;
            nextInstruction()
          }
        }
      });
    }
    targets.forEach(function(target,i){
      if (target[0].type == "fake"){
        wait+=1;
        socket.emit("whatdis", target[1], function(monsterid){
          console.log(monsterid);
          var owner = target[0].owner;
          //is card known?
          if (!game.monsters[monsterid]){
            //request card
            console.log("requesting card with id: " + monsterid);
            socket.emit("request card", monsterid, function(id,name,type,ap,dp,text,image,code){
              console.log("call back");
              console.log(ap,dp);
              //add card to database
              game.monsters[monsterid]=new common.monster(id,name,text,"database","database",ap,dp);
              target[0] = new common.monster(id,name,text,"database","database",ap,dp,game);
              target[0].condition = "hand";
              target[0].owner = owner;
              wait-=1;
              if (wait === 0) {
                card[0].use(card,targets);
                executing = false;
                nextInstruction()
              }
            })
          } else {
            target[0] = new common.monster(game.monsters[monsterid].id,game.monsters[monsterid].name,game.monsters[monsterid].text,"database","database",game.monsters[monsterid].ap,game.monsters[monsterid].dp,game);
            target[0].condition = "hand";
            target[0].owner = owner;
            wait-=1;
            if (wait == 0) {
              card[0].use(card,targets);
              executing = false;
              nextInstruction()
            }
          }
        });
      }
    });
    if (wait === 0) {
      card[0].use(card,targets);
      executing = false;
      nextInstruction()
    }
  }
}

socket.on("quickplay start", function(player,deckSize1,deckSize2){
  message="";
  console.log("quickplay start");
  perspec = player;
  me = player;
  var i;
  //creates decks of unknown cards numbered from 0 to 39
  for(i=0; i<deckSize1; i++) {
   game.deck1.push([new fake("deck",1),i])
  }
  for(i; i<deckSize1+deckSize2; i++) {
   game.deck2.push([new fake("deck",2),i])
  }
  startGame()
});

// Link prototypes and add prototype methods
//monster.prototype = Object.create(card.prototype)
//spell.prototype = Object.create(card.prototype)


function nextInstruction(){
  console.log("next instruction");
  if (executionQueue.length>0){
    (executionQueue.shift())()
  } else {
    console.log("queue empty");
    executing = false
  }
}

function startGame(){
  var x;
  console.log("start game");
  executionQueue = [];
  x = common.wrapFunction(pickUp,this,[game.hand2,game.deck2,2,2]);
  console.log(x);
  executionQueue.push(x);
  console.log(executionQueue);
  for (var i=0; i<4; i++) {
    x = common.wrapFunction(pickUp,this,[game.hand1,game.deck1,1,1]);
    executionQueue.push(x);
    console.log(executionQueue);
    x = common.wrapFunction(pickUp,this,[game.hand2,game.deck2,2,2]);
    executionQueue.push(x);
    console.log(executionQueue)
  }
  x = common.wrapFunction(turn,this,[1]);
  executionQueue.push(x);
  console.log(executionQueue);
  nextInstruction()
}

function resetStuff(){
  game.monstersPlayed = 0
}

function pickUp(hand,deck,requester){
  executing = true;
  console.log("pickup from " + requester);
  if (deck.length<1) {
    console.log("deck empty");
    executing = false;
    nextInstruction()
  } else {
    //does client know of monster
    if (deck[0][0].type === "fake" && requester === me){
      var owner = deck[0][0].owner;
      console.log("whatdis", deck[0][1]);
      socket.emit("whatdis", deck[0][1], function(cardId){//what is the id of this card
        console.log(cardId);
        if (!game.monsters[cardId]){//if card not in monsters array then we must receive it from the server
          console.log("requesting card with id: " + cardId);
          socket.emit("request card", cardId, function(id,name,type,ap,dp,text,image,code){
            console.log("card received called:" + name);
            game.monsters[cardId] = new common.monster(id,name,text,"database","database",ap,dp,game,null,code); //add card to database
          })
        }
        deck[0][0] = common.createMonsterFromId(game.monsters[cardId],"hand", owner);
        moveCardFromDeckToHand(hand, deck);
      });
    } else {
      deck[0][0].condition = "hand";
      moveCardFromDeckToHand(hand, deck)
    }
  }

  function moveCardFromDeckToHand(hand, deck){
    hand.push(deck[0]);
    deck.splice(0,1);
    executing = false;
    nextInstruction()
  }
}

function mousePressed() {
  if (executing === false){
  if (selectingBoard){
    var target = checkHitBoxes();
    if (target !== "no collision") {
      selected = common.testInput(target,game);
      var targets = [target,];
      socket.emit("use",selectedStr,targets)
    }
  } else {
    message = false;
    if(mouseButton == RIGHT) {
      selected = false
    } else if(mouseButton == LEFT) {
      var target = checkHitBoxes();
      console.log(target);
      if (target !== "no collision") {
        if(selected) {
          selected = common.testInput(target,game);
          var targets = [target,"front2"];
          socket.emit("use", selectedStr, targets);
          console.log("use " + selectedStr + " against " + target);
          //selected.use(target)
          selected = false
        } else{
          selectedStr=target;
          selected = common.testInput(target,game)
        }
      }
      //check buttons
      if (mouseX >= width * 13/15 && mouseX <= width * 13/15 + width / 15 - 2 && mouseY >=height/2 && mouseY <= height/2 + height/12 -2){
        console.log("end turn");
        socket.emit("end turn")
      }
      if (mouseX >= width * 1/15 && mouseX <= width * 1/15 + width / 15 - 2 && mouseY >= height*1/15 && mouseY <= height*1/15 + height/12 -2){
        console.log("quickplay");
        socket.emit("quickplay")
      }
    }
  }
  }
}
//document.body.style.cursor = "none";



//  create decks
//  display hand
//  add play monster
//  add end turn
//  add ap
//  add hover
//  figure out ui
//  attack doesnt work
//  allow viewing from both sides
//sort out code column
//  display images
//  add triggers
//add graphics
//integrate triggers


//30 card to chose from to make 20, start with 20 , players take turns to remove a card from their deck 1 from the extra 10 and add one from the extra ten.
//last 4 cards to be discarded are offered to respective opponents simultaneously to swap in