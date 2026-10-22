package project.Seat_Pulse.Service;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import project.Seat_Pulse.Entity.User;
import project.Seat_Pulse.service.UserPrincipal;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserPrincipalTest {

    @Test
    void testGetAuthorities_AppendsRolePrefixAndUpperCases() {
        User user = new User();
        user.setRole("admin");

        UserPrincipal userPrincipal = new UserPrincipal(user);

        Collection<? extends GrantedAuthority> authorities = userPrincipal.getAuthorities();

        assertEquals(1, authorities.size());

        assertTrue(authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void testGetUsernameAndPassword_DelegatesToUserEntity() {

        User user = new User();
        user.setUserName("Ashwin");
        user.setPassword("secure123");

        UserPrincipal userPrincipal = new UserPrincipal(user);

        assertEquals("Ashwin", userPrincipal.getUsername());
        assertEquals("secure123", userPrincipal.getPassword());
    }
}