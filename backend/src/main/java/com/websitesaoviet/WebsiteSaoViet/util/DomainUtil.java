package com.websitesaoviet.WebsiteSaoViet.util;

import java.net.URI;
import java.net.URISyntaxException;

public class DomainUtil {
    public static String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            if (host != null) {
                return host.startsWith("www.") ? host.substring(4) : host;
            }
        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid URL: " + url, e);
        }

        return url;
    }
}