package org.spring.crowdpass.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.user.dto.*;
import org.spring.crowdpass.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping(path = "/search", produces = "application/json")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);

    }

    @GetMapping(path = "/{id}", produces = "application/json")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping(path="", produces = "application/json")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(path = "/recover-password", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Void> recoverPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.recoverPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping(path = "/{id}/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest, @PathVariable Long id) {
        userService.changePassword(changePasswordRequest, id);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping(path = "/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        userService.resetPassword(resetPasswordRequest);
        return ResponseEntity.noContent().build();
    }
}
