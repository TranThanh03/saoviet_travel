package com.websitesaoviet.WebsiteSaoViet.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.AuthenticationRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.IntrospectRequest;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.AuthenticationResponse;
import com.websitesaoviet.WebsiteSaoViet.dto.response.common.IntrospectResponse;
import com.websitesaoviet.WebsiteSaoViet.entity.Admin;
import com.websitesaoviet.WebsiteSaoViet.entity.InvalidatedToken;
import com.websitesaoviet.WebsiteSaoViet.entity.Customer;
import com.websitesaoviet.WebsiteSaoViet.entity.RefreshToken;
import com.websitesaoviet.WebsiteSaoViet.enums.CustomerStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.repository.InvalidatedTokenRepository;
import com.websitesaoviet.WebsiteSaoViet.repository.RefreshTokenRepository;
import com.websitesaoviet.WebsiteSaoViet.util.DomainUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    AdminService adminService;
    CustomerService customerService;
    InvalidatedTokenRepository invalidatedTokenRepository;
    RefreshTokenRepository refreshTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${base.url}")
    protected String BASE_URL;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        Customer customer;

        if (request.getUsername() != null && !request.getUsername().isEmpty() &&
                request.getPassword() != null && !request.getPassword().isEmpty()
        ) {
            if (request.getUsername().matches("\\d+")) {
                customer = customerService.getCustomerByPhone(request.getUsername());
            } else {
                customer = customerService.getCustomerByEmail(request.getUsername());
            }

            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

            boolean authenticated = passwordEncoder.matches(request.getPassword(), customer.getPassword());

            if(!authenticated) {
                throw new AppException(ErrorCode.LOGIN_FAILED);
            } else if (customer.getStatus().equals(CustomerStatus.INACTIVATE.getValue())) {
                throw new AppException(ErrorCode.INACTIVATE);
            } else if (customer.getStatus().equals(CustomerStatus.BLOCKED.getValue())) {
                throw new AppException(ErrorCode.BLOCKED);
            }

            return AuthenticationResponse.builder()
                    .accessToken(generateAccessToken(request.getUsername(), customer))
                    .userId(customer.getId())
                    .build();
        } else {
            throw new AppException(ErrorCode.NOT_NULL_LOGIN);
        }
    }

    public AuthenticationResponse authenticateAdmin(AuthenticationRequest request) {
        Admin admin;

        if (request.getUsername() != null && !request.getUsername().isEmpty() &&
                request.getPassword() != null && !request.getPassword().isEmpty()
        ) {
            if (request.getUsername().matches("\\d+")) {
                admin = adminService.getAdminByPhone(request.getUsername());
            } else {
                admin = adminService.getAdminByEmail(request.getUsername());
            }

            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

            boolean authenticated = passwordEncoder.matches(request.getPassword(), admin.getPassword());

            if(!authenticated) {
                throw new AppException(ErrorCode.LOGIN_FAILED);
            }

            return AuthenticationResponse.builder()
                    .accessToken(generateAccessTokenAdmin(request.getUsername(), admin))
                    .userId(admin.getId())
                    .build();
        } else {
            throw new AppException(ErrorCode.NOT_NULL_LOGIN);
        }
    }

    private String generateAccessToken(String username, Customer customer) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer(DomainUtil.extractDomain(BASE_URL))
                .issueTime(new Date())
                .expirationTime(Date.from(
                        Instant.now().plusSeconds(300)
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("id", customer.getId())
                .claim("scope", buildScope(customer))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));

            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    private String generateAccessTokenAdmin(String username, Admin admin) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer(DomainUtil.extractDomain(BASE_URL))
                .issueTime(new Date())
                .expirationTime(Date.from(
                        Instant.now().plusSeconds(300)
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("id", admin.getId())
                .claim("scope", buildScopeAdmin(admin))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));

            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    public String generateRefreshToken(String userId) {
        String token = UUID.randomUUID().toString();
        String hashedToken = DigestUtils.sha256Hex(token);

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .hashedToken(hashedToken)
                .expiryTime(Date.from(Instant.now().plus(Duration.ofDays(10))))
                .build();

        refreshTokenRepository.save(refreshToken);

        return token;
    }

    public String refreshAccessToken(String refreshToken) {
        String hashedToken = DigestUtils.sha256Hex(refreshToken);
        var result = refreshTokenRepository.findByHashedToken(hashedToken);

        if (result == null || result.getExpiryTime().before(new Date())) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        var customer = customerService.getCustomerDetail(result.getUserId());

        return generateAccessToken(customer.getEmail(), customer);
    }

    public String refreshAccessTokenAdmin(String refreshToken) {
        String hashedToken = DigestUtils.sha256Hex(refreshToken);
        var result = refreshTokenRepository.findByHashedToken(hashedToken);

        if (result == null || result.getExpiryTime().before(new Date())) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        var admin = adminService.getAdminDetail(result.getUserId());

        return generateAccessTokenAdmin(admin.getEmail(), admin);
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        try {
            verifyToken(request.getAccessToken());

            return new IntrospectResponse(true);
        } catch (JOSEException | ParseException e) {
            return new IntrospectResponse(false);
        }
    }

    public void logout(String accessToken) throws ParseException, JOSEException {
        var signToken = verifyToken(accessToken);

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        String id = signedJWT.getJWTClaimsSet().getClaim("id").toString();
        Date expityTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified= signedJWT.verify(verifier);

        if (!(verified && expityTime.after(new Date()))) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (customerService.existsCustomerInvalid(id)) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (!customerService.existsCustomerById(id) && !adminService.existsAdminById(id)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    public void verifyTokenForDecoder(String token) throws JwtException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
            if (!signedJWT.verify(verifier)) {
                throw new JwtException("Token invalid!");
            }

            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiryTime == null || expiryTime.before(new Date())) {
                throw new JwtException("Token invalid!");
            }

            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            String userId = Objects.toString(signedJWT.getJWTClaimsSet().getClaim("id"), null);

            if (userId == null) {
                throw new JwtException("Unthenticated!");
            }

            if (jti != null && invalidatedTokenRepository.existsById(jti)) {
                throw new JwtException("Token invalid!");
            }

            if (customerService.existsCustomerInvalid(userId)) {
                throw new JwtException("Token invalid!");
            }

            if (!customerService.existsCustomerById(userId) && !adminService.existsAdminById(userId)) {
                throw new JwtException("Unthenticated!");
            }

        } catch (ParseException | JOSEException e) {
            throw new JwtException("Token invalid!", e);
        }
    }

    @Transactional
    public void deleteRefreshToken(String refreshToken) {
        String hashedToken = DigestUtils.sha256Hex(refreshToken);
        var result = refreshTokenRepository.findByHashedToken(hashedToken);

        if (result == null || result.getExpiryTime().before(new Date())) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        refreshTokenRepository.deleteById(result.getId());
    }

    @Transactional
    public void deleteRefreshTokenByUserId(String userId) {
        if (refreshTokenRepository.existsByUserId(userId)) {
            refreshTokenRepository.deleteAllByUserId(userId);
        }
    }

    public String getIdByToken(String accessToken) {
        try {
            var signToken = verifyToken(accessToken);

            return signToken.getJWTClaimsSet().getClaim("id").toString();
        } catch (ParseException | JOSEException e) {
            return null;
        }
    }

    private String buildScope(Customer customer) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(customer.getRoles())) {
            customer.getRoles().forEach(stringJoiner::add);
        }

        return stringJoiner.toString();
    }

    private String buildScopeAdmin(Admin admin) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(admin.getRoles())) {
            admin.getRoles().forEach(stringJoiner::add);
        }

        return stringJoiner.toString();
    }
}
