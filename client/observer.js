let socket  =  io.connect("http://localhost:8080");
let width;
let height;
let matches = [];

socket.emit("request matches");

socket.on("matches", function(matches){
  console.log(matches);
});
