package project.Seat_Pulse.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.repository.UserRepository;
import project.Seat_Pulse.Entity.User;


@Service
public class MyUserDetailsService implements UserDetailsService{

    private UserRepository userRepository;

    public MyUserDetailsService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username);
        if(user == null){
            throw new RuntimeException("User not found");
        }
        return new UserPrincipal(user);
    }
}
