package project.Seat_Pulse.DTOs;

public class UserResponseDto {

    private String userName;

    private String mobileNumber;

    private String emailId;

    public UserResponseDto(String userName, String emailId, String mobileNumber) {
        this.userName = userName;
        this.mobileNumber = mobileNumber;
        this.emailId = emailId;
    }

    public UserResponseDto(){

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
}
