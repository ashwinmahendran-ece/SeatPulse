package project.Seat_Pulse.DTOs;

public class UserRegistrationDto {

    private String userName;

    private String mobileNumber;

    private String emailId;

    private String password;

    public UserRegistrationDto(String userName, String emailId, String mobileNumber, String password) {
        this.userName = userName;
        this.mobileNumber = mobileNumber;
        this.emailId = emailId;
        this.password = password;
    }

    public UserRegistrationDto(){

    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getEmailId() {
        return emailId;
    }

    public void setEmailId(String emailId) {
        this.emailId = emailId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
