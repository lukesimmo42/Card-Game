var highlight1
var perspec = 1
/*function preload() {
  spritesheet = loadImage("/static/chessSpriteBordered2.png");
} 

//Creates canvas with board div's height and width
function setup() {
  canvas = createCanvas();
  //canvas.parent("board"); //Places the canvas inside the "board" div
  strokeWeight(1);
  resize();
}*/

//Creates canvas with board div's height and width
function setup() {
  frameRate(60)
  canvas = createCanvas(0,0)
  strokeWeight(1)
  resize()
}

window.onresize = resize;
function resize() {
  width = window.innerWidth
  height = window.innerHeight
  resizeCanvas(width, height)
}

function draw() {
  clear()
  //hand
  var cardWidth = width / 15
  var cardHeight = height / 6
  var y
  if (perspec == 1) {
    y = height - (cardHeight* 7/6)
    for(var i=0;i<game.hand1.length;i++){
      if (selected !== game.hand1[i]){
        common.drawCard(game.hand1[i][0],(width-(cardWidth*game.hand1.length))/2 + (cardWidth*i),y,cardWidth,cardHeight,true,true,highlight1)
      }
    }
    y = (cardHeight* 1/6)
    for(var i=0;i<game.hand2.length;i++){
      if (selected !== game.hand2[i]){
        common.drawCard(game.hand2[i][0],(width-(cardWidth*game.hand2.length))/2 + (cardWidth*i),y,cardWidth,cardHeight,true,true,highlight1)
      }
    }
    //drawHand(hand,cardWidth,cardHeight,y)
    if (selected !== game.backLeft1) {
      common.drawCard(game.backLeft1[0],width/2-(cardWidth*10/6),height-(cardHeight*14/6),cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.backRight1) {
      common.drawCard(game.backRight1[0],width/2+(cardWidth*4/6),height-(cardHeight*14/6),cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.front1) {
      common.drawCard(game.front1[0],width/2-(cardWidth*1/2),height/2+(cardHeight*3/12),cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.backLeft2) {
      common.drawCard(game.backLeft2[0],width/2+(cardWidth*4/6),cardHeight*8/6,cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.backRight2) {
      common.drawCard(game.backRight2[0],width/2-(cardWidth*10/6),cardHeight*8/6,cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.front2) {
      common.drawCard(game.front2[0],width/2-(cardWidth*1/2),height/2-(cardHeight*15/12),cardWidth,cardHeight,true,true,highlight1)
    }
    
  } else if (perspec === 2){
    y = (cardHeight * 1/6)
    for(var i=0;i<game.hand1.length;i++){
      if (selected !== game.hand1[i]){
        common.drawCard(game.hand1[i][0],(width-(cardWidth*game.hand1.length))/2 + (cardWidth*i),y,cardWidth,cardHeight,true,true,highlight1)
      }
    }
    y = height - (cardHeight * 7/6)
    for(var i=0;i<game.hand2.length;i++){
      if (selected !== game.hand2[i]){
        common.drawCard(game.hand2[i][0],(width-(cardWidth*game.hand2.length))/2 + (cardWidth*i),y,cardWidth,cardHeight,true,true,highlight1)
      }
    }
    //drawHand(hand,cardWidth,cardHeight,y)
    if (selected !== game.backLeft2) {
      common.drawCard(game.backLeft2[0],width/2-(cardWidth*10/6),height-(cardHeight*14/6),cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.backRight2) {
      common.drawCard(game.backRight2[0],width/2+(cardWidth*4/6),height-(cardHeight*14/6),cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.front2) {
      common.drawCard(game.front2[0],width/2-(cardWidth*1/2),height/2+(cardHeight*3/12),cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.backLeft1) {
      common.drawCard(game.backLeft1[0],width/2+(cardWidth*4/6),cardHeight*8/6,cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.backRight1) {
      common.drawCard(game.backRight1[0],width/2-(cardWidth*10/6),cardHeight*8/6,cardWidth,cardHeight,true,true,highlight1)
    }
    if (selected !== game.front1) {
      common.drawCard(game.front1[0],width/2-(cardWidth*1/2),height/2-(cardHeight*15/12),cardWidth,cardHeight,true,true,highlight1)
    }
  }
  //highlight hovered over card
  highlight1 = checkHitBoxes()
  //draw endturn button
  if (selected == false && mouseX >= width * 13/15 && mouseX <= width * 13/15 + width / 15 - 2 && mouseY >=height/2 && mouseY <= height/2 + height/12 -2){
    stroke(255,255,0)
  } else {
    stroke(0,0,0)
  }
  fill(255,255,255)
  rect(width * 13/15,height/2,cardWidth,cardHeight/2)
  noStroke()
  fill(0,0,0)
  textAlign(CENTER,CENTER)
  text("end turn",width * 13/15,height/2,width / 15 - 2,height/12 -2)
  //draw quickplay button
  if (selected == false && mouseX >= width * 1/15 && mouseX <= width * 1/15 + width / 15 - 2 && mouseY >= height*1/15 && mouseY <= height*1/15 + height/12 -2){
    stroke(255,255,0)
  } else {
    stroke(0,0,0)
  }
  fill(255,255,255)
  rect(width * 1/15,height*1/15,cardWidth,cardHeight/2)
  noStroke()
  fill(0,0,0)
  textAlign(CENTER,CENTER)
  text("quickplay",width * 1/15,height*1/15,width / 15 - 2,height/12 -2)
  //draw health
  if (perspec == 1){
    var myHealth = game.health1
    var opponentHealth = game.health2
  } else if (perspec == 2) {
    myHealth = game.health2
    opponentHealth = game.health1
  }
  stroke(0,0,0)
  fill(255,255,255)
  rect(width * 11/15,height-(cardHeight*2),cardWidth,cardHeight/2)
  noStroke()
  fill(0,0,0)
  textAlign(CENTER,CENTER)
  text(myHealth,width * 11/15,height-(cardHeight*2),cardWidth,cardHeight/2)
  stroke(0,0,0)
  fill(255,255,255)
  rect(width * 11/15,cardHeight*3/2,cardWidth,cardHeight/2)
  noStroke()
  fill(0,0,0)
  textAlign(CENTER,CENTER)
  text(opponentHealth,width * 11/15,cardHeight*3/2,cardWidth,cardHeight/2)
  //draw selected card
  if (selected == false || selected == undefined) {
    document.body.style.cursor = ''
  } else {
    document.body.style.cursor = 'none'
    common.drawCard(selected[0],mouseX-(cardWidth/2),mouseY-(cardHeight/2),cardWidth,cardHeight,true,false,highlight1)
  }
  if (message) {
    displayMessage(message)
  }
 // }
}

//draws hand as if selected doesnt exist, unused as prefer a gap
/*function drawHand(hand,cardWidth,cardHeight,y) {
  for(var i=0;i<hand.length;i++){
    var x = (width-(cardWidth*hand.length))/2 + (cardWidth*i)
    drawCard(hand[i],x,y,cardWidth,cardHeight,true)
  }
}*/

//draw everything then detect hitbox, could be buggy
function checkHitBoxes(){
  var cardWidth = width / 15
  var cardHeight = height / 6
  var y
  if(perspec == 1){
    y = height - (cardHeight* 7/6)
    for(var i=0;i<game.hand1.length;i++){
      if (selected !== game.hand1[i]){
        if(check((width-(cardWidth*game.hand1.length))/2 + (cardWidth*i),y,cardWidth,cardHeight)){
          return("hand1"+i)
        }
      }
    }
    y = (cardHeight* 1/6)
    for(var i=0;i<game.hand2.length;i++){
      if (selected !== game.hand2[i]){
        if(check((width-(cardWidth*game.hand2.length))/2 + (cardWidth*i),y,cardWidth,cardHeight)){
          return("hand2"+i)
        }
      }
    }
    if (selected !== game.backLeft1) {
      if(check(width/2-(cardWidth*10/6),height-(cardHeight*14/6),cardWidth,cardHeight)){
        return("backLeft1")
      }
    }
    if (selected !== game.backRight1) {
      if(check(width/2+(cardWidth*4/6),height-(cardHeight*14/6),cardWidth,cardHeight)){
        return("backRight1")
      }
    }
    if (selected !== game.front1) {
      if(check(width/2-(cardWidth*1/2),height/2+(cardHeight*3/12),cardWidth,cardHeight)){
        return("front1")
      }
    }
    if (selected !== game.backLeft2) {
      if(check(width/2+(cardWidth*4/6),cardHeight*8/6,cardWidth,cardHeight)){
        return("backLeft2")
      }
    }
    if (selected !== game.backRight2) {
      if(check(width/2-(cardWidth*10/6),cardHeight*8/6,cardWidth,cardHeight)){
        return("backRight2") 
      }
    }
    if (selected !== game.front2) {
      if(check(width/2-(cardWidth*1/2),height/2-(cardHeight*15/12),cardWidth,cardHeight)){
        return("front2")
      }
    }
    
  } else if (perspec == 2){
    y = (cardHeight* 1/6)
    for(var i=0;i<game.hand1.length;i++){
      if (selected !== game.hand1[i]){
        if(check((width-(cardWidth*game.hand1.length))/2 + (cardWidth*i),y,cardWidth,cardHeight)){
          return("hand1"+i)
        }
      }
    }
    y = height - (cardHeight* 7/6)
    for(var i=0;i<game.hand2.length;i++){
      if (selected !== game.hand2[i]){
        if(check((width-(cardWidth*game.hand2.length))/2 + (cardWidth*i),y,cardWidth,cardHeight)){
          return("hand2"+i)
        }
      }
    }
    if (selected !== game.backLeft2) {
      if(check(width/2-(cardWidth*10/6),height-(cardHeight*14/6),cardWidth,cardHeight)){
        return("backLeft2")
      }
    }
    if (selected !== game.backRight2) {
      if(check(width/2+(cardWidth*4/6),height-(cardHeight*14/6),cardWidth,cardHeight)){
        return("backRight2")
      }
    }
    if (selected !== game.front2) {
      if(check(width/2-(cardWidth*1/2),height/2+(cardHeight*3/12),cardWidth,cardHeight)){
        return("front2")
      }
    }
    if (selected !== game.backLeft1) {
      if(check(width/2+(cardWidth*4/6),cardHeight*8/6,cardWidth,cardHeight)){
        return("backLeft1")
      }
    }
    if (selected !== game.backRight1) {
      if(check(width/2-(cardWidth*10/6),cardHeight*8/6,cardWidth,cardHeight)){
        return("backRight1") 
      }
    }
    if (selected !== game.front1) {
      if(check(width/2-(cardWidth*1/2),height/2-(cardHeight*15/12),cardWidth,cardHeight)){
        return("front1")
      }
    }
  }
  return("no collision")
}

function check(x,y,width,height){
  if(mouseX>=x && mouseX<=x+width && mouseY>=y && mouseY<=y+height){
    return true
  }
  return false
}

function displayMessage(message) {
  noStroke()
  textSize(32)
  text(message,width/8*1.5,height/8*2.5,width/8*5,height/8*3)
  textSize(12)
}
