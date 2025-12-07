package com.websitesaoviet.WebsiteSaoViet.service;

import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Iterator;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RedisService {
    StringRedisTemplate redisTemplate;

    private Iterable<String> scanKeys(String pattern) {
        return () -> new Iterator<String>() {

            final Cursor<byte[]> cursor = redisTemplate.executeWithStickyConnection(
                    redisConnection -> redisConnection.scan(
                            ScanOptions.scanOptions().match(pattern).count(1000).build()
                    )
            );

            String nextKey = null;

            @Override
            public boolean hasNext() {
                try {
                    if (cursor.hasNext()) {
                        nextKey = new String(cursor.next());
                        return true;
                    }
                    cursor.close();
                    return false;
                } catch (Exception e) {
                    try { cursor.close(); } catch (Exception ignored) {}
                    return false;
                }
            }

            @Override
            public String next() {
                return nextKey;
            }
        };
    }

    private boolean isKeyExpired(String key) {
        Long ttl = redisTemplate.getExpire(key);
        if (ttl == null || ttl <= 0) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }

    public int getAvailablePeople(String scheduleId, int totalPeople) {
        try {
            String pattern = "schedule:" + scheduleId + ":booking:lock:*";
            int totalLocked = 0;

            for (String key : scanKeys(pattern)) {
                if (isKeyExpired(key)) continue;

                String val = redisTemplate.opsForValue().get(key);
                if (val == null) {
                    redisTemplate.delete(key);
                    continue;
                }

                try {
                    totalLocked += Integer.parseInt(val);
                } catch (NumberFormatException ex) {
                    redisTemplate.delete(key);
                }
            }

            return Math.max(totalPeople - totalLocked, 0);
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void setLockPeople(String scheduleId, String bookingCode, int people) {
        try {
            String key = "schedule:" + scheduleId + ":booking:lock:" + bookingCode;
            redisTemplate.opsForValue().set(key, String.valueOf(people), Duration.ofMinutes(15));
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void removeLockPeople(String scheduleId, String bookingCode) {
        try {
            String key = "schedule:" + scheduleId + ":booking:lock:" + bookingCode;
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public int getAvailablePromotion(String promotionId, int totalPromotion) {
        try {
            String pattern = "promotion:" + promotionId + ":lock:*";
            int totalLocked = 0;

            for (String key : scanKeys(pattern)) {
                if (!isKeyExpired(key)) totalLocked++;
            }

            return Math.max(totalPromotion - totalLocked, 0);
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void setLockPromotion(String promotionId, String customerId) {
        try {
            String key = "promotion:" + promotionId + ":lock:" + customerId;
            redisTemplate.opsForValue().setIfAbsent(key, "1", Duration.ofMinutes(15));
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void removeLockPromotion(String promotionId, String customerId) {
        try {
            String key = "promotion:" + promotionId + ":lock:" + customerId;
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public boolean isPromotionLocked(String promotionId, String customerId) {
        try {
            String key = "promotion:" + promotionId + ":lock:" + customerId;

            if (!redisTemplate.hasKey(key)) {
                return false;
            }

            if (isKeyExpired(key)) {
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void setForgotPasswordOtp(String customerId, int otp) {
        try {
            String key = "customer:" + customerId + ":forgot-password:otp";
            redisTemplate.opsForValue().set(key, String.valueOf(otp), Duration.ofMinutes(5));
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public Integer getForgotPasswordOtp(String customerId) {
        try {
            String key = "customer:" + customerId + ":forgot-password:otp";
            String value = redisTemplate.opsForValue().get(key);

            if (value == null) {
                redisTemplate.delete(key);
                return null;
            }

            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                redisTemplate.delete(key);
                return null;
            }
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public Long getForgotPasswordOtpTtl(String customerId) {
        try {
            String key = "customer:" + customerId + ":forgot-password:otp";
            return redisTemplate.getExpire(key);
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void removeForgotPasswordOtp(String customerId) {
        try {
            String key = "customer:" + customerId + ":forgot-password:otp";
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void setResetPasswordToken(String customerId, String token) {
        try {
            String key = "customer:" + customerId + ":reset-password:token";
            redisTemplate.opsForValue().set(key, String.valueOf(token), Duration.ofMinutes(10));
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public String getResetPasswordToken(String customerId) {
        try {
            String key = "customer:" + customerId + ":reset-password:token";
            String value = redisTemplate.opsForValue().get(key);

            if (value == null) {
                redisTemplate.delete(key);
                return null;
            }

            return value;
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }

    public void removeResetPasswordToken(String customerId) {
        try {
            String key = "customer:" + customerId + ":reset-password:token";
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error("Redis error: ", e);
            throw new AppException(ErrorCode.REDIS_ERROR);
        }
    }
}
