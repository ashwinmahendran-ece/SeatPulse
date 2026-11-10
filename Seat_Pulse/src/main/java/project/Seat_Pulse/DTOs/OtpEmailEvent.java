package project.Seat_Pulse.DTOs;

import java.io.Serializable;

public class OtpEmailEvent implements Serializable {
    private String email;
    private String otp;

    public OtpEmailEvent() {}

    public OtpEmailEvent(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getOtp() {
        return otp;
    }
    public void setOtp(String otp) {
        this.otp = otp;
    }
}