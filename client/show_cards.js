var  socket  =  io.connect("")

var width
var height

var monsters = []
var endMonster = -1

socket.on('receive card', function(id, name, type, ap, dp, text, code, img){
  console.log("receive card")
  console.log(name)
  console.log(id)
  console.log(img)
  if(img){
    try {
      loadImage(img, function(loadedImage){console.log(loadedImage); monsters[id]=new common.monster(id,name,text,"database","database",ap,dp,"database",loadedImage)})
      console.log("blah")
    } catch(error) {
      console.log("sadasdadsf")
      monsters[id]=new common.monster(id,name,text,"database","database",ap,dp,"database")
    }
  } else {
    console.log("no img")
    monsters[id]=new common.monster(id,name,text,"database","database",ap,dp,"database")
  }
  if(id > endMonster){
      endMonster = id
  }
})
socket.on('message', function(text){
    alert(text)
});
socket.emit('all cards')


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

var highlight1


function draw() {
  clear()
  var count = 0
  var cardWidth = width / 15
  var cardHeight = height / 6
  for(var i=0;i<=endMonster;i++){
      if(monsters[i]){
          common.drawCard(monsters[i],((i%12*6/75)+1/75)*width,(Math.floor(count/5)*1/5+1/30)*height,cardWidth,cardHeight,true,highlight1)
      }
  }
}