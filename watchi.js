var WATCHI_SERVER = "http://127.0.0.1:5000"

chrome.pushMessaging.onMessage.addListener(onReceiveMessage);
var login_input = document.getElementById("login-email")
var login_div = document.getElementById("login")
localStorage = chrome.storage.local;
if (!localStorage.getItem("channelId"))
  login_div.style.display = "block";

function onClickRegister(){
  localStorage.setItem("useremail",login_input.value)
  fetchChannelId();
}

function fetchChannelId(){
  chrome.pushMessageing.getChannelId(false, channelIdCallback);
  console.log("fetching channel id ...");
}

function channelIdCallback(details){
  var channelId = details.channelId;
  console.log("channelId callback and id is"+channelId);
  registerChannelIdToWatchiServer(channelId);
  localStorage.setItem("channelId",channelId);
}

function registerChannelIdToWatchiServer(channelId){
  console.log("sending channel id to server");
  var registerRequest = new XMLHttpRequest();
  registerRequest.open('POST', WATCHI_SERVER+'/register_chrome', true);
  registerRequest.onreadystatechange = function(theEvent){
    if(registerRequest.readyState == 4){
      if(registerRequest.status == 200 ){
        console.log("register sucess!");
      }else{
        console.log("Error sending XHR status is"+registerRequest.statusText)
        // TODO need resent buttun?
      }
    }
  }

  registerRequest.send('email='+localStorage.getItem("useremail")+"&channelId="+channelId)
}

function onReceiveMessage(details){
  console.log("push message arrived");
  showPushMessage(details.payload, details.subChannel);
}

function showPushMessage(payload, subChannel){
  var notification = window.webkitNotifications.createNotfication(
    'icon.png','Watchi','push message for you'+payload + "[" + subChannel+"]"
  )
}
