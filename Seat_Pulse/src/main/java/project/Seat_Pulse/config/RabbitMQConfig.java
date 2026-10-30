package project.Seat_Pulse.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String BOOKING_QUEUE = "booking_queue";
    public static final String BOOKING_EXCHANGE = "booking_exchange";
    public static final String BOOKING_ROUTING_KEY = "booking_routing_key";

    public static final String NOTIFICATION_QUEUE = "notification_queue";
    public static final String NOTIFICATION_EXCHANGE = "notification_exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "notification_routing_key";

    public static final String LOCK_WAIT_QUEUE = "lock_wait_queue_300s";
    public static final String LOCK_WAIT_EXCHANGE = "lock_wait_exchange";
    public static final String LOCK_WAIT_ROUTING_KEY = "lock_wait_routing_key_5m";

    public static final String LOCK_PROCESS_QUEUE = "lock_process_queue";
    public static final String LOCK_PROCESS_EXCHANGE = "lock_process_exchange";
    public static final String LOCK_PROCESS_ROUTING_KEY = "lock_process_routing_key";

    public static final String CANCEL_FANOUT_EXCHANGE = "event_cancel_fanout";
    public static final String CANCEL_DB_QUEUE = "cancel_db_queue";
    public static final String CANCEL_EMAIL_QUEUE = "cancel_email_queue";

    public static final String BULK_NOTIFICATION_QUEUE = "bulk_notification_queue";
    public static final String BULK_NOTIFICATION_ROUTING_KEY = "bulk_notification_routing_key";

    @Bean
    public FanoutExchange cancelFanoutExchange() {
        return new FanoutExchange(CANCEL_FANOUT_EXCHANGE);
    }

    @Bean
    public Queue cancelDbQueue() {
        return new Queue(CANCEL_DB_QUEUE, true);
    }

    @Bean
    public Queue cancelEmailQueue() {
        return new Queue(CANCEL_EMAIL_QUEUE, true);
    }

    @Bean
    public Binding cancelDbBinding() {
        return BindingBuilder.bind(cancelDbQueue()).to(cancelFanoutExchange());
    }

    @Bean
    public Binding cancelEmailBinding() {
        return BindingBuilder.bind(cancelEmailQueue()).to(cancelFanoutExchange());
    }

    @Bean
    public Queue bulkNotificationQueue() {
        return new Queue(BULK_NOTIFICATION_QUEUE);
    }

    @Bean
    public Binding bulkNotificationBinding() {
        return BindingBuilder
                .bind(bulkNotificationQueue())
                .to(notificationExchange())
                .with(BULK_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Queue lockWaitQueue() {
        return QueueBuilder.durable(LOCK_WAIT_QUEUE)
                .withArgument("x-message-ttl", 300000)
                .withArgument("x-dead-letter-exchange", LOCK_PROCESS_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", LOCK_PROCESS_ROUTING_KEY)
                .build();
    }

    @Bean
    public DirectExchange lockWaitExchange() {
        return new DirectExchange(LOCK_WAIT_EXCHANGE);
    }

    @Bean
    public Binding lockWaitBinding() {
        return BindingBuilder.bind(lockWaitQueue()).to(lockWaitExchange()).with(LOCK_WAIT_ROUTING_KEY);
    }

    @Bean
    public Queue lockProcessQueue() {
        return new Queue(LOCK_PROCESS_QUEUE, true);
    }

    @Bean
    public DirectExchange lockProcessExchange() {
        return new DirectExchange(LOCK_PROCESS_EXCHANGE);
    }

    @Bean
    public Binding lockProcessBinding() {
        return BindingBuilder.bind(lockProcessQueue()).to(lockProcessExchange()).with(LOCK_PROCESS_ROUTING_KEY);
    }

    @Bean
    public Queue notificationQueue(){
        return new Queue(NOTIFICATION_QUEUE,true);
    }

    @Bean
    public DirectExchange notificationExchange(){
        return new DirectExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Queue bookingQueue() {
        return new Queue(BOOKING_QUEUE, true);
    }

    @Bean
    public DirectExchange bookingExchange() {
        return new DirectExchange(BOOKING_EXCHANGE);
    }

    @Bean
    public Binding bookingBinding(Queue bookingQueue, DirectExchange bookingExchange) {
        return BindingBuilder.bind(bookingQueue).to(bookingExchange).with(BOOKING_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}