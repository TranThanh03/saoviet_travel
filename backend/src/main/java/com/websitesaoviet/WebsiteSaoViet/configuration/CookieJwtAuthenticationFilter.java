package com.websitesaoviet.WebsiteSaoViet.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public class CookieJwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtDecoder jwtDecoder;
    private final Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter;

    public CookieJwtAuthenticationFilter(JwtDecoder jwtDecoder,
                                         Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter) {
        this.jwtDecoder = jwtDecoder;
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String method = request.getMethod();
        final String path = request.getRequestURI();
        final String token = extractTokenFromCookie(request);

        if (token == null || isPublicEndpoint(method, path)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Jwt jwt = jwtDecoder.decode(token);
                AbstractAuthenticationToken authentication = jwtAuthenticationConverter.convert(jwt);
                if (authentication != null) {
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JwtException ex) {
                logger.warn("Invalid JWT in cookie", ex);
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        Map<String, String> cookieMap = Arrays.stream(request.getCookies())
                .collect(Collectors.toMap(Cookie::getName, Cookie::getValue, (a, b) -> a));

        if (cookieMap.containsKey("token-admin")) {
            return cookieMap.get("token-admin");
        } else {
            return cookieMap.getOrDefault("token", null);
        }
    }

    private boolean isPublicEndpoint(String method, String path) {
        switch (method) {
            case "GET":
                return matches(path, SecurityConfig.GET_PUBLIC_ENDPOINTS);
            case "POST":
                return matches(path, SecurityConfig.POST_PUBLIC_ENDPOINTS);
            case "PATCH":
                return matches(path, SecurityConfig.PATCH_PUBLIC_ENDPOINTS);
            default:
                return false;
        }
    }

    private boolean matches(String path, String[] patterns) {
        if (path.startsWith("/api/v1")) {
            path = path.substring("/api/v1".length());
        }

        for (String pattern : patterns) {
            String regex = pattern
                    .replaceAll("\\{[^/]+}", "[^/]+")
                    .replace("**", ".*")
                    .replace("*", "[^/]+");

            if (path.matches(regex)) {
                return true;
            }
        }

        return false;
    }
}