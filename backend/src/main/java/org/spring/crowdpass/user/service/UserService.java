package org.spring.crowdpass.user.service;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.spring.crowdpass.user.dto.*;
import org.spring.crowdpass.user.entity.User;
import org.spring.crowdpass.user.enums.Role;
import org.spring.crowdpass.user.exception.*;
import org.spring.crowdpass.user.mapper.UserMapper;
import org.spring.crowdpass.user.repository.UserRepository;
import org.spring.crowdpass.user.security.JwtService;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    private final Environment environment;

    @Transactional
    public UserResponse createUser(AdminRegistrationRequest request) {

        if (request.email() != null && userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        if(request.registrationCode() == null || !request.registrationCode().equals(environment.getProperty("REGISTRATION_KEY"))) {
            throw new InvalidSecretKeyException("Invalid registration code");
        }
        User user = new User();
        user.setName(request.name());
        user.setSurname(request.surname());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.ADMIN);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);


    }

    @Transactional
    public UserResponse createStaffUser(StaffRegistrationRequest request) {
        if (request.email() != null && userRepository.existsByEmail(request
                .email())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        User user = new User();
        user.setName(request.name());
        user.setSurname(request.surname());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.STAFF);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(userMapper::toResponse).toList();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!request.newPassword().equals(request.confirmationPassword())) {
            throw new InvalidPasswordException("New password and confirmation password do not match");
        }
        if (request.newPassword().length() < 8) {
            throw new InvalidPasswordException("New password must be at least 8 characters long");
        }
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void recoverPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            UUID resetToken = UUID.randomUUID();
            user.setResetPasswordToken(resetToken.toString());
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.token()).orElseThrow(() -> new TokenExpiredException("Invalid reset token"));

        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Reset token has expired");
        }
        if (request.newPassword().length() < 8) {
            throw new InvalidPasswordException("New password must be at least 8 characters long");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new InvalidPasswordException("New password can't be the same as the old password");
        }
        if (!request.newPassword().equals(request.confirmationPassword())) {
            throw new InvalidPasswordException("New password and confirmation password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));
        userRepository.delete(user);
    }

    public LoginResponse login(@Valid LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new UserNotFoundException("User not found"));
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        String token = jwtService.generateToken(user);
        return new LoginResponse(token);
    }
}
