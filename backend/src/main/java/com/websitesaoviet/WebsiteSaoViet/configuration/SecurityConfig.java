package com.websitesaoviet.WebsiteSaoViet.configuration;

import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    public static final String[] GET_PUBLIC_ENDPOINTS = {
            "/tours/area-count", "/tours/popular", "/tours/three-popular", "/tours/*", "/tours/similar", "/tours/hot",
            "/reviews/*",
            "/news/*", "/news/outstanding", "/news/top-new", "/news/*/list-outstanding", "/news/*/list-top-new",
            "/chatbot/*", "/chatbot/generat-code",
            "/schedules/tour/*",
            "/payments/vnpay/callback"
    };

    public static final String[] POST_PUBLIC_ENDPOINTS = {
            "/auth/login", "/auth/register", "/auth/token/refresh",
            "/auth/forgot-password", "/auth/forgot-password/resend", "/auth/forgot-password/verify",
            "/admin/auth/login", "/admin/auth/token/refresh",
            "/admin/auth/forgot-password", "/admin/auth/forgot-password/resend", "/admin/auth/forgot-password/verify",
            "/customers",
            "/tours/filter", "/tours/filter-area",
            "/tours/search", "/tours/search-destination",
            "/chatbot/*",
            "/payments/momo/callback"
    };

    public static final String[] PATCH_PUBLIC_ENDPOINTS = {
            "/customers/*/activate",
            "/auth/forgot-password/reset",
            "/admin/auth/forgot-password/reset"
    };

    @NonFinal
    @Value("${app.fe-base-url}")
    protected String FE_BASE_URL;

    @Bean
    public CustomJwtDecoder customJwtDecoder() {
        return new CustomJwtDecoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .securityContext(security -> security.requireExplicitSave(false))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, GET_PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.POST, POST_PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.PATCH, PATCH_PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(customJwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                );

        http.addFilterBefore(
                new SilentBearerExceptionFilter(),
                BearerTokenAuthenticationFilter.class
        );

        return http.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    @Bean
    @Order(0)
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.setAllowedOrigins(List.of(FE_BASE_URL));
        corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        corsConfiguration.setAllowedHeaders(List.of("*"));
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return source;
    }
}
