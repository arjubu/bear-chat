'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var userListArea = document.querySelector('#userList');
var connectingElement = document.querySelector('.connecting');


var stompClient = null;
var username = null;
const xhttp = new XMLHttpRequest();

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var e = document.getElementById("status");
    var status = e.options[e.selectedIndex].value;
    console.log(status);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';

        getUserByStatus();
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';

        getUserByStatus();
    } else {
       if(status == "true"){
           messageElement.classList.add('chat-message');

           var avatarElement = document.createElement('i');
           var avatarText = document.createTextNode(message.sender[0]);
           avatarElement.appendChild(avatarText);
           avatarElement.style['background-color'] = getAvatarColor(message.sender);

           messageElement.appendChild(avatarElement);

           var usernameElement = document.createElement('span');
           var usernameText = document.createTextNode(message.sender);
           usernameElement.appendChild(usernameText);
           messageElement.appendChild(usernameElement);

       }

    }

    if(status == "true"){
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

}
 function  changeStatus(){
     var e = document.getElementById("status");
     var status = e.options[e.selectedIndex].value;
     var chatMessage = {
         userName: username,
         usrStatus: status
     };

     xhttp.open("POST", "http://localhost:8090/change-online-status", true);
     xhttp.setRequestHeader("Content-Type", "application/json");
     xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
             var response = this.responseText;
         }
     };

     xhttp.send(JSON.stringify(chatMessage));
 }

 function getUserByStatus(){

     var e = document.getElementById("listStatus");
     var status = e.options[e.selectedIndex].value;

     var chatMessage = {
         userName: username,
         usrStatus: status
     };

     xhttp.open("POST", "http://localhost:8090/get-all-users", true);
     xhttp.setRequestHeader("Content-Type", "application/json");
     xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
             var response = JSON.parse(this.responseText);
             document.getElementById("userList").innerHTML = "";
             if(response.length>0){
                 for(var user of response){
                     var userElement = document.createElement('li');
                     userElement.classList.add('chat-message');
                     var avatarElement = document.createElement('i');
                     var avatarText = document.createTextNode(user.userName);
                     avatarElement.appendChild(avatarText);
                     avatarElement.style['background-color'] = getAvatarColor(user.userName);
                     userElement.appendChild(avatarElement);

                     userListArea.appendChild(userElement);
                 }
             }


             console.log(response);
         }
     };
     console.log(chatMessage);
     xhttp.send(JSON.stringify(chatMessage));
 }

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
