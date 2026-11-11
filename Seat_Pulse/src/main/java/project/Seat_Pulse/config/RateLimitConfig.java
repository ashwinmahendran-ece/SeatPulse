package project.Seat_Pulse.config;

import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import java.time.Duration;

@Configuration
public class RateLimitConfig {

    @Value("${spring.data.redis.url}")
    private String redisUrl;

    @Bean
    public ProxyManager<byte[]> proxyManager(RedisConnectionFactory redisConnectionFactory) {
        LettuceConnectionFactory lettuceFactory = (LettuceConnectionFactory) redisConnectionFactory;
        RedisClient redisClient = RedisClient.create(redisUrl);

        return LettuceBasedProxyManager.builderFor(redisClient)

                .withExpirationStrategy(
                        io.github.bucket4j.distributed.ExpirationAfterWriteStrategy
                                .basedOnTimeForRefillingBucketUpToMax(Duration.ofMinutes(10))
                )
                .build();
    }
}