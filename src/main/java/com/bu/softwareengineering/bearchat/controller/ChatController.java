package com.bu.softwareengineering.bearchat.controller;

import com.bu.softwareengineering.bearchat.model.UserInfo;
import com.bu.softwareengineering.bearchat.model.ChatMessage;
import com.bu.softwareengineering.bearchat.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;


@Controller
public class ChatController {

    @Autowired
    private SimpUserRegistry simpUserRegistry;

    @Autowired
    private UserRepository userRepository;

    ObjectMapper objectMapper = new ObjectMapper();

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        UserInfo userInfo = new UserInfo();
        userInfo.setUserName(chatMessage.getSender());
        userRepository.save(userInfo);
        return chatMessage;
    }

    @PostMapping("/change-online-status")
    public ResponseEntity<?> changeUserStatus(@RequestBody Map<String,String> requestBody){
        UserInfo userInfo = userRepository.findByUserName(requestBody.get("userName"));
        userInfo.setOnline(Boolean.valueOf( requestBody.get("usrStatus")));
        userRepository.save(userInfo);
        return new ResponseEntity<>(userInfo,HttpStatus.OK);
    }

    @PostMapping("/get-all-users")
    public ResponseEntity<?> getAllChatRoomUsers(@RequestBody Map<String,String> requestBody) throws JsonProcessingException {
        String status = requestBody.get("usrStatus");
        List<UserInfo> userInfos;
        if(status.equals("online")){
            userInfos = userRepository.findByIsOnlineTrue();
        }else if(status.equals("offline")) {
            userInfos = userRepository.findByIsOnlineFalse();
        }else{
            userInfos = userRepository.findAll();
        }

        return new ResponseEntity<>(objectMapper.writeValueAsString(userInfos) , HttpStatus.OK);
    }

}
