"use strict";
const common = require('./client/common')
  , http = require("http")
  , path = require("path")
  , express = require("express")
  , app = express()
  , server = http.createServer(app)
  , io = require("socket.io").listen(server)
  , mysql = require("mysql")
  , fs = require("fs")
  , util = require('util')
  , URL = require('url').URL;

app.use("/static", express.static("client"));
app.use("/", express.static("./web"));

io.set("log level", 1);

var connection = mysql.createConnection({
  host     : "localhost",
  user     : "root",
  password : "multimaxvegetarianvegan",
  database : "card_game",
});

/*connection.connect(function(err) {
  if (err) throw err;
  console.log('You are now connected...')
});*/

// listen for new web clients:
server.listen(8080);
console.log("listening on port 8080");

var cardsLocked = false; //Prevents cards from being added to database while another card is being added. See addCard()

var playerQueued = false;
var matches = [];

io.on("connection", function(socket){
  socket.playing = false;
  console.log("user connected");
  socket.on("hi",function(){
    console.log("hi")
  });

  
  function addCard(id, name, type, ap, dp, text, code, image){
    cardsLocked = true;
    var fileName = id+name;
    console.log("file is: client/images/"+fileName);
    //console.log(image);
    fs.writeFile("client/images/"+fileName, image, function() {
        cardsLocked = false
    });
    var sql = "INSERT INTO monsters VALUES (" + id + ",'" + name + "'" + ",'" + type + "'" + "," + ap + "," + dp + ",'" + text + "'" + ",'" + code + "'" + ",'" + fileName + "'" + ")";
    console.log(sql);
    connection.query(sql);
  }

  socket.on("request card",function(id,callback){
    console.log("card " + id + " requested");
    connection.query("SELECT * FROM monsters WHERE id = " + id + ";", function(err, rows, fields) {
      if (!err) {
        callback(rows[0].id, rows[0].name, rows[0].type, rows[0].ap, rows[0].dp, rows[0].text, rows[0].image, rows[0].code)
      }else{
        console.log("Error while performing Query.");
      }
    })
  });
  /*socket.on("request card",function(id,callback){
    console.log("card " + id + " requested")
    callback(id,String.fromCharCode(97 + id),"deck",id,id+1,id)
  })*/
  socket.on("insert card",function(id, name, type, ap, dp, text, code, image){
    if (cardsLocked) {
      socket.emit("message","server busy");
    } else if(id === "no id"){
      connection.connect(function() {
        connection.query("SELECT COUNT(*) AS cardCount FROM monsters;", function (error, rows, fields) {
          if (error) throw error;
          else {
            id = rows[0].cardCount;
            addCard(id, name, type, ap, dp, text, code, image);
            socket.emit("message","card added")
          }
        });
      });
    } else {
      addCard(id, name, type, ap, dp, text, code, image);
      socket.emit("message","card added")
    }
  });
  socket.on("all cards",function(){
    console.log("");
    console.log("all cards");
    connection.query("SELECT * FROM monsters;", function(err, rows, fields) {
      if (!err) {
        console.log(rows.length + "rows");
        rows.forEach(function(row,i){
          var image;
          fs.readFile("client/images/"+row.id+row.name, 'utf8', function(err, contents) {
            console.log("client/images/"+row.id+row.name);
            if(contents){
              console.log(contents.substring(0,30));
            } else {
              console.log("no image")
            }
            image = contents;
            console.log(row.name, " sent");
            socket.emit("receive card",row.id, row.name, row.type, row.ap, row.dp, row.text, row.code, image)
          });
        })
      }else{
        console.log("Error while performing Query.");
      }
    })
  });
  socket.on("quickplay",function(){
    if (socket.playing === false) {
      if (playerQueued !== socket) {
          if (playerQueued) {
            matches.push(newGame(playerQueued,socket)); //create new game instance
            matches[matches.length-1].startTime = new Date().getTime()
            matches[matches.length-1].setupMatch();
            io.sockets.socket(playerQueued.id).playing = true;
            socket.playing = true;
            playerQueued = undefined;
          } else {
              playerQueued = socket;
              console.log("added guy to queue");
              socket.emit("message","Waiting for an opponent.");
          }
      } else { 
        socket.emit("message","You're already queueing!");
      }
    } else {
      socket.emit("message","You're already in a game!");
    }
  });
  socket.on("disconnect", function(){
    console.log("disconnect");
    quit(socket);
  });
  socket.on("quit", function(){
    console.log("quit");
    quit(socket);
  });

  socket.on("request matches", function(){

  });
});

//remove user from games/queue
function quit(user) {
  if (playerQueued === user) {
    playerQueued = undefined;
  } else if (user.playing === true) {
    //find the game the user is playing and end it
    for (var i = 0; i < matches.length; i++) {
      if (matches[i].player1 === user) {
        matches[i].player2.emit("message","Your opponent left.");
        matches[i].endGame();
      } else if (matches[i].player2 === user) {
        matches[i].player1.emit("message","Your opponent left.");
        matches[i].endGame();
      }
    }
  }
}


function nextInstruction(){
  console.log("next instruction");
  if (executionQueue.length>0){
    (executionQueue.shift())()
  } else {
    console.log("queue empty");
    executing = false
  }
}

function pushToExecutionQueue(){
  let x = common.wrapFunction(using, this, [from, to]);
  executionQueue.push(x);
  if (executing === false){
    nextInstruction()
  }
}

function newGame(player1,player2){
  let game = {};

  game.player1 = player1;
  game.player2 = player2;
  game.health1 = 30;
  game.health2 = 30;
  game.decklist1 = [];
  game.decklist2 = [];
  game.deck1 = [];
  game.deck2 = [];
  game.hand1 = [];
  game.hand2 = [];
  game.front1 = [];
  game.front1[0] = new common.empty();
  game.front2 = [];
  game.front2[0] = new common.empty();
  game.backLeft1 = [];
  game.backLeft1[0] = new common.empty();
  game.backRight1 = [];
  game.backRight1[0] = new common.empty();
  game.backLeft2 = [];
  game.backLeft2[0] = new common.empty();
  game.backRight2 = [];
  game.backRight2[0] = new common.empty();
  
  game.graveyard = [];
  game.lostspells = [];
  game.monsters = [];
  game.triggers = common.triggers();
  
  game.cardIds = [];
  
  game.currentPlayer = 1;
  game.turnNum = 0;
  game.monstersPlayed = 0;
  
  game.monsterDamage = true;
  game.attackerTakesDamage = true;

  game.setupMatch = function(){
    console.log("setupMatch");
    //remember to declare these listeners
    game.player1.on("use", function(from, to){
      console.log("use: " + from + to);
      if(game.currentPlayer === 1){
        using(from,to,game)
      }
    });
    game.player2.on("use", function(from, to){
      console.log("use: " + from + to);
      if(game.currentPlayer === 2){
        using(from,to,game)
      }
    });
    game.player1.on("whatdis", function(id,callback){
      console.log("whatdis " + id);
      if(game.cardIds[id].condition === "board" || (game.cardIds[id].condition === "hand" && game.cardIds[id].owner === 1)) {
        console.log("yes");
        callback(game.cardIds[id].id)
      }
    });
    game.player2.on("whatdis", function(id,callback){
      console.log("whatdis " + id);
      if(game.cardIds[id].condition === "board" || (game.cardIds[id].condition === "hand" && game.cardIds[id].owner === 2)) {
        console.log("yes");
        callback(game.cardIds[id].id)
      }
    });
    game.player1.on("end turn",function(){
      console.log("current player is: " + game.currentPlayer);
      if (game.currentPlayer === 1){
        game.turn(2)
      }
    });
    game.player2.on("end turn",function(){
      console.log("current player is: " + game.currentPlayer);
      if (game.currentPlayer === 2){
        game.turn(1)
      }
    });
    game.loadMatch()
  };
  
  game.loadMatch = function(){
    console.log("loadMatch");
    /*for(var i=0; i<20; i++) {
      game.decklist1[i]=new common.monster(i,String.fromCharCode(97 + i),i,"deck",1,i,i+1,this)
    }
    for(var i=0; i<20; i++) {
      game.decklist2[i]=new common.monster(i,String.fromCharCode(97 + i),i,"deck",2,i,i+1,this)
    }*/
    var self = this;
    var cardsToLoad = 0;
    cardsToLoad ++;
    connection.query("SELECT * FROM monsters WHERE id = 1;", function(err, rows, fields) {
      if (!err) {
        console.log("added wizard");
        for (var i = 0; i < 20; i++) {
          self.decklist1[i] = new common.monster(rows[0].id, rows[0].name, rows[0].text, "deck", 1, rows[0].ap, rows[0].dp, self, rows[0].image);
          common.monsterCode(self.decklist1[i], rows[0].code)
        }
        for (var i = 0; i < 20; i++) {
          self.decklist2[i] = new common.monster(rows[0].id, rows[0].name, rows[0].text, "deck", 2, rows[0].ap, rows[0].dp, self, rows[0].image);
          common.monsterCode(self.decklist2[i], rows[0].code)
        }
        cardsToLoad--;
        if (cardsToLoad === 0) {
          self.startMatch()
        }
      } else {
        console.log("Error while performing Query.");
      }
    })
  };
  
  game.startMatch = function(){
    console.log("startMatch");
    var temp1 = common.rearrange(game.decklist1);
    var temp2 = common.rearrange(game.decklist2);
    for(i=0; i<20; i++) {
      game.deck1.push([temp1[i],i]);
      game.cardIds[i]=game.deck1[i][0];
      game.deck2.push([temp2[i],i+20]);
      game.cardIds[i+20]=game.deck2[i][0];
    }
    game.pickUp(2);
    for (var i=0; i<4; i++) {
      game.pickUp(1);
      game.pickUp(2)
    }
    game.turn(1);
    game.player1.emit("quickplay start",1,20,20);
    game.player2.emit("quickplay start",2,20,20)
  };
  
  game.turn = function(newPlayer){
    console.log("turn" + newPlayer);
    player1.emit("turn",newPlayer);
    player2.emit("turn",newPlayer);
    //check last turn end effects
    game.turnNum++;
    game.currentPlayer = newPlayer;
    game.resetStuff();
    //check turn start effects
    game.pickUp(game.currentPlayer)
  };

  game.resetStuff = function(){
    game.monstersPlayed = 0
  };
  
  game.pickUp = function(player){
    console.log("player " + player + " draw");
    if (player === 1) {
      if (game.deck1.length<1) {
        console.log("deck empty")
      } else {
        var card = game.deck1[0];
        card[0].condition = "hand";
        game.hand1[game.hand1.length]=card;
        game.deck1.splice(0,1)
        game.player1KnownCards[i] = true
       // return true
      }
    } else if (player === 2){
      if (game.deck2.length < 1) {
        console.log("deck empty")
      } else {
        var card = game.deck2[0];
        card[0].condition = "hand";
        game.hand2[game.hand2.length]=card;
        game.deck2.splice(0,1)
        game.player2KnownCards[i] = true
        //return true
      }
    }
    //return false
  };
  
  game.checkWin = function() {
    if (game.health1 <= 0 || game.health2 <= 0) {
      //endGame("draw", "health")
    } else if (game.health1 <= 0) {
      //endGame("player1win", "health")
    } else if (game.health2 <= 0) {
      //endGame("player2win", "health")
    }
  };
  
  game.endGame = function() {
    //clearInterval(game.timer);//stops countdown
    io.sockets.socket(player1.id).playing = false;//the property of the actual socket, not the copy stored in the board
    io.sockets.socket(player2.id).playing = false;
    game.player1.emit("game end");
    game.player2.emit("game end");
    game.player1.removeAllListeners("move");
    game.player2.removeAllListeners("move");
    game.player1.removeAllListeners("whatdis");
    game.player2.removeAllListeners("whatdis");
    game.player1.removeAllListeners("end turn");
    game.player2.removeAllListeners("end turn");
    matches.splice(matches.indexOf(this));//remove game from array of matches
    console.log("game ended");
  };

  return(game)
}

//get user to choose a target
function locationSelection(){
  
}

function using(from,to,game){
  console.log(from + to);
  var selected = common.testInput(from,game);
  var targets = [];
  to.forEach(function(element,i){
    targets[i] = common.testInput(element,game)
  });
  if(selected === false || targets.some === false){
    console.log("one of the cards doesnt exist");
    return(false)
  }
  console.log("trying to use");
  console.log(selected[0].name);
  console.log("on");
  console.log(targets[0][0].name);
  if (typeof selected[0].use !== "undefined") {
    if(selected[0].use(selected,targets)){
      console.log("use successful");
      game.player1.emit("use",from,to);
      game.player2.emit("use",from,to)
    }
  } else {
    console.log("selected card doesn't have a use function")
  }
}
