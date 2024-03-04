// uncomment the line below and put your socket events in here
let socket = io()
let username = prompt("what name would you like to go by?")
function buttonPressed(){
  console.log(document.querySelector("input").value)
  socket.emit("sendMessage", {username:username, message:document.querySelector("input").value})
}

document.body.addEventListener("keypress", function(e){
  if(e.key == "Enter"){
    buttonPressed()
  }
})


//example event listener
// socket.on('newMsgFromServer', function(data){
// 	  do something with data
// })

socket.on("sendMessage", function(data){
  document.body.insertAdjacentHTML("beforeend", "<p><strong>"+data.username+": </strong>"+data.message+"</p>")
})