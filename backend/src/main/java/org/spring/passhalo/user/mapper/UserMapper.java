package org.spring.passhalo.user.mapper;

import org.spring.passhalo.user.dto.UserResponse;
import org.spring.passhalo.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.getRole().name()
        );
    }

}
