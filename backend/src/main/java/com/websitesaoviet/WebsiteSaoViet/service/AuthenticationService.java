package com.websitesaoviet.WebsiteSaoViet.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.websitesaoviet.WebsiteSaoViet.dto.request.common.AuthenticationRequest;
import com.websitesaoviet.WebsiteSaoViet.entity.Admin;
import com.websitesaoviet.WebsiteSaoViet.entity.InvalidatedToken;
import com.websitesaoviet.WebsiteSaoViet.entity.Customer;
import com.websitesaoviet.WebsiteSaoViet.enums.CustomerStatus;
import com.websitesaoviet.WebsiteSaoViet.exception.AppException;
import com.websitesaoviet.WebsiteSaoViet.exception.ErrorCode;
import com.websitesaoviet.WebsiteSaoViet.repository.InvalidatedTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    AdminService adminService;
    CustomerService customerService;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    public String authenticate(AuthenticationRequest request) {
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

            return generateToken(request.getUsername(), customer);
        } else {
            throw new AppException(ErrorCode.NOT_NULL_LOGIN);
        }
    }

    public String authenticateAdmin(AuthenticationRequest request) {
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

            return generateTokenAdmin(request.getUsername(), admin);
        } else {
            throw new AppException(ErrorCode.NOT_NULL_LOGIN);
        }
    }

    private String generateToken(String username, Customer customer) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer("saoviet.com")
                .issueTime(new Date())
                .expirationTime(Date.from(
                        Instant.now().plusSeconds(3600)
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

    private String generateTokenAdmin(String username, Admin admin) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer("saoviet.com")
                .issueTime(new Date())
                .expirationTime(Date.from(
                        Instant.now().plusSeconds(3600)
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

    public Boolean introspect(String token) {
        try {
            verifyToken(token);
            return true;
        } catch (JOSEException | ParseException e) {
            return false;
        }
    }

    public void logout(String token)
            throws ParseException, JOSEException {
        var signToken = verifyToken(token);

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    private SignedJWT verifyToken(String token)
            throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        String id = signedJWT.getJWTClaimsSet().getClaim("id").toString();
        Date expityTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified= signedJWT.verify(verifier);

        if (!(verified && expityTime.after(new Date()))) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        } else if (customerService.existsCustomerInvalid(id)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        } else if (!customerService.existsCustomerById(id) && !adminService.existsAdminById(id)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    public String getIdByToken(String token) {
        try {
            var signToken = verifyToken(token);

            return signToken.getJWTClaimsSet().getClaim("id").toString();
        } catch (ParseException | JOSEException e) {
            return null;
        }
    }

    public String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.TOKEN_NOT_EXITED);
        }
        return authorizationHeader.substring(7);
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