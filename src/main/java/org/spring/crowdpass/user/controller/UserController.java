package org.spring.crowdpass.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.user.dto.AdminRegistrationRequest;
import org.spring.crowdpass.user.dto.UserResponse;
import org.spring.crowdpass.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @PostMapping(path = "/register", consumes = "application/json", produces = "application/json")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody AdminRegistrationRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
