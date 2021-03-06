// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This is a sample app to show how to use our push messaging service.
// This function gets called in the packaged app model on launch.
var WATCHI_SERVER = "http://127.0.0.1:5000"
userinfo='';
channelId='';
chrome.storage.local.set({'userinfo':userinfo})
chrome.storage.local.set({'channelId':channelId})

chrome.app.runtime.onLaunched.addListener(function() {
  // stuff to do when the app is launched
  console.log("Push Messaging Sample Client Launched!");

  // You likely wouldn't do this every time your app launches,
  // but we do it here so we can help debugging by showing the channelId
    // every time.
    if (!userinfo || !channelId){
      firstTimePushSetup();
    }
  

  // Do the normal setup steps every time the app starts, listen for events.
  setupPush();

  // Pretend we just got a message so you can see what a notification will
  // look like when it arrives.
  showPushMessage("no payload yet", 8);
});

// This function gets called in the packaged app model on install.
// Typically on install you will get the channelId, and send it to your
// server which will send Push Messages.
chrome.runtime.onInstalled.addListener(function() {
  firstTimePushSetup();
  console.log("Push Messaging Sample Client installed!");
});

// This function gets called in the packaged app model on shutdown.
// You can override it if you wish to do clean up at shutdown time.
chrome.runtime.onSuspend.addListener(function() {
  console.log("Push Messaging Sample Client shutting down");
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    if(key=='userinfo'){
      userinfo = storageChange.newValue;
    }else if(key=='channelId'){
      channelId = storageChange.newValue;
    }
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
    if(userinfo && channelId){
      console.log('both login and got channelId')
      registerChannelIdToWatchiServer(userinfo,channelId);
    }
  }
});

// This should only be called once on the instance of chrome where the app
// is first installed for this user.  It need not be called every time the
// Push Messaging Client App starts.
function firstTimePushSetup() {
  // Start fetching the channel ID (it will arrive in the callback).
  chrome.pushMessaging.getChannelId(true, channelIdCallback);
  // chrome.app.window.create('index.html', { "bounds": { "width": 1024, "height": 768 } });
  console.log("getChannelId returned.  Awaiting callback...");
  chrome.app.window.create('index.html', { "bounds": { "width": 1024, "height": 768 } });
  console.log("get user info return. awarting callback..")
}

// Register for push messages.
// This should be called every time the Push Messaging App starts up.
function setupPush() {

  // Begin listening for Push Messages.
  chrome.pushMessaging.onMessage.addListener(messageCallback);
  console.log('called addListener');

  // We can ensure that adding the listener took effect as intended.
  var listeners = chrome.pushMessaging.onMessage.hasListeners();
  console.log('hasListeners returned ' + listeners +
              ' after calling addListener');
}

// Unregister for Push Messages (only call if you have previously
// called setupPush).
function takedownPush() {
  chrome.pushMessaging.onMessage.removeListener(messageCallback);
  console.log('called removeListener');
}

// This callback recieves the Push Message from the push server.
function messageCallback(message) {
  console.log("push messaging callback seen");
  console.log("payload is "                 + message.payload);
  console.log("subChannel is "              + message.subchannelId);

  // This sample app will popup a notification when it gets a push message.
  // Your app should instead take whatever action it does when a push message
  // arrives.
  showPushMessage(message.payload, message.subchannelId.toString());
}

// When the channel ID callback is available, this callback recieves it.
// The push client app should communicate this to the push server app as
// the 'address' of this user and this app (on all instances of Chrome).
// function channelIdCallback(message) {
//   console.log("Background Channel ID callback seen, channel Id is " + message.channelId);

//   // TODO: This is where your application should send the channel id to
//   // your own push messaging server, which will use the channel id for
//   // routing through the push servers at Google to deliver the push message.

//   // Display the channel ID in a HTML window for debugging purposes.
//   chrome.app.window.create('PushSample.html');
// }
function channelIdCallback(details){
  var channelId = details.channelId;
  chrome.storage.local.set({"channelId":channelId});
  console.log("channelId callback and id is"+channelId);
}

function registerChannelIdToWatchiServer(userinfo,channelId){
  console.log("sending channel id to server");
  var registerRequest = new XMLHttpRequest();
  registerRequest.open('POST', WATCHI_SERVER+'/register_chrome', true);
  registerRequest.onreadystatechange = function(theEvent){
    if(registerRequest.readyState == 4){
      if(registerRequest.status == 200 ){
        console.log("register sucess!");
      }else{
        console.log("Error sending XHR status is"+registerRequest.statusText)
        // TODO: need resent buttun?
      }
    }
  }
  userinfo_js = JSON.parse(userinfo)
  registerRequest.send('email='+userinfo_js.email+"&token="+userinfo_js.auth_token+"&channelId="+channelId)}

// When a Push Message arrives, show it as a text notification (toast)
function showPushMessage(payload, subChannel) {
  var notification = window.webkitNotifications.createNotification(
      'icon.png', 'Push Message',
      "Push message for you! " +
      payload +" [" + subChannel + "]");
  notification.show();
}


