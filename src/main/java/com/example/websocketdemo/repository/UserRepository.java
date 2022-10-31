package com.example.websocketdemo.repository;

import com.example.websocketdemo.model.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public interface UserRepository extends JpaRepository<UserInfo,Long> {

    UserInfo findByUserName(String username);
    List<UserInfo> findByIsOnlineTrue();
    List<UserInfo> findByIsOnlineFalse();
    void deleteByUserName(String userName);
}
