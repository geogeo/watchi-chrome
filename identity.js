var access_token;
function onGetAuthToken(auth_token) {
  var userInfoDiv = document.getElementById('user_info');
  if (!auth_token) {
    var signinButton = document.createElement('button');
    signinButton.id = 'signin';
    signinButton.appendChild(document.createTextNode('Sign In'));
    signinButton.onclick = getUserInfoInteractive;
    userInfoDiv.appendChild(signinButton);
    return;
  }
  // Remove the sign in button if it exists.
  if (userInfoDiv.firstChild) {
    userInfoDiv.removeChild(userInfoDiv.firstChild);
  }
  console.log(auth_token)
  access_token=auth_token
  // Use the auth token to do an XHR to get the user information.
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+auth_token,true);
  xhr.onload = onUserInfoFetched;
  xhr.send();
}

function getUserInfo() {
  console.log("not interactive login")
  chrome.experimental.identity.getAuthToken({ 'interactive': false }, onGetAuthToken);
}

function getUserInfoInteractive() {
  console.log("interactive login")
  chrome.experimental.identity.getAuthToken({ 'interactive': true }, onGetAuthToken);
}
function onUserInfoFetched(){
  var user_info = JSON.parse(this.response)
  user_info.auth_token = access_token
  console.log("get user info"+user_info)
  chrome.storage.local.set({"userinfo":JSON.stringify(user_info)})
}

window.onload = getUserInfo;
