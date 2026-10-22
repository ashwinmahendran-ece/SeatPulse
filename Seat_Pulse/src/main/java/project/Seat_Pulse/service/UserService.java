package project.Seat_Pulse.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import project.Seat_Pulse.DTOs.UserRegistrationDto;
import project.Seat_Pulse.DTOs.UserResponseDto;
import project.Seat_Pulse.Entity.User;
import org.springframework.stereotype.Service;
import project.Seat_Pulse.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepo;

    private AuthenticationManager authenticationManager;

    private JwtService jwtService;

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    public UserService(UserRepository userRepo,AuthenticationManager authenticationManager,JwtService jwtService) {
        this.userRepo = userRepo;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public UserResponseDto registerUser(UserRegistrationDto userRegistrationDto){
        User user = new User();
        user.setUserName(userRegistrationDto.getUserName());
        user.setEmailId(userRegistrationDto.getEmailId());
        user.setMobileNo(userRegistrationDto.getMobileNumber());
        user.setPassword(bCryptPasswordEncoder.encode(userRegistrationDto.getPassword()));
        user.setRole("USER");
        User savedUser=userRepo.save(user);
        return new UserResponseDto(savedUser.getUserName(), savedUser.getEmailId(), savedUser.getMobileNo());

    }

    public User getUserByUserName(String username){
        return userRepo.findByUserName(username);
    }

    public String verify(User user){
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUserName(),user.getPassword()));

        if(authentication.isAuthenticated()){
            return jwtService.generateToken(user.getUserName());
        }
        return "Authentication failed";
    }
}
