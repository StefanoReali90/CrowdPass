package org.spring.crowdpass;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CrowdPassApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrowdPassApplication.class, args);
    }

}
