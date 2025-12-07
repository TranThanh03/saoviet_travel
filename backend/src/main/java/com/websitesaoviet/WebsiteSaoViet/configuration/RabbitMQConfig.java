package com.websitesaoviet.WebsiteSaoViet.configuration;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String MAIL_EXCHANGE = "mail.exchange";

    public static final String MAIL_QUEUE = "mail.queue";
    public static final String MAIL_RETRY_QUEUE = "mail.retry.queue";
    public static final String MAIL_DEAD_QUEUE = "mail.dead.queue";

    public static final String MAIL_ROUTING_KEY = "mail.send";
    public static final String MAIL_RETRY_ROUTING_KEY = "mail.retry";
    public static final String MAIL_DEAD_ROUTING_KEY = "mail.dead";

    @Bean
    public DirectExchange mailExchange() {
        return new DirectExchange(MAIL_EXCHANGE);
    }

    @Bean
    public Queue mailQueue() {
        return QueueBuilder.durable(MAIL_QUEUE)
                .withArgument("x-dead-letter-exchange", MAIL_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", MAIL_RETRY_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue mailRetryQueue() {
        return QueueBuilder.durable(MAIL_RETRY_QUEUE)
                .withArgument("x-message-ttl", 3000)
                .withArgument("x-dead-letter-exchange", MAIL_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", MAIL_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue mailDeadQueue() {
        return QueueBuilder.durable(MAIL_DEAD_QUEUE).build();
    }

    @Bean
    public Binding mailBinding() {
        return BindingBuilder.bind(mailQueue())
                .to(mailExchange())
                .with(MAIL_ROUTING_KEY);
    }

    @Bean
    public Binding mailRetryBinding() {
        return BindingBuilder.bind(mailRetryQueue())
                .to(mailExchange())
                .with(MAIL_RETRY_ROUTING_KEY);
    }

    @Bean
    public Binding mailDeadBinding() {
        return BindingBuilder.bind(mailDeadQueue())
                .to(mailExchange())
                .with(MAIL_DEAD_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }
}
