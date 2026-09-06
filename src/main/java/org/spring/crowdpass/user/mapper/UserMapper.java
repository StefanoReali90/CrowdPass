package org.spring.crowdpass.user.mapper;

import org.spring.crowdpass.user.dto.UserResponse;
import org.spring.crowdpass.user.entity.User;
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
