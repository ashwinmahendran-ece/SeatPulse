package project.Seat_Pulse.DTOs;
import java.util.List;

public class EventCancellationDto {
    private Long eventId;
    private String eventName;
    private List<String> affectedEmails;

    public EventCancellationDto(Long eventId, String eventName, List<String> affectedEmails) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.affectedEmails = affectedEmails;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public List<String> getAffectedEmails() {
        return affectedEmails;
    }

    public void setAffectedEmails(List<String> affectedEmails) {
        this.affectedEmails = affectedEmails;
    }
}