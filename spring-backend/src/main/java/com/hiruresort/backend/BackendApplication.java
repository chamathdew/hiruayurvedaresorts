package com.hiruresort.backend;

import com.hiruresort.backend.models.User;
import com.hiruresort.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UserRepository userRepository) {
		return args -> {
			if (userRepository.findByUsername("admin").isEmpty()) {
				BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
				User admin = new User();
				admin.setUsername("admin");
				admin.setPassword(encoder.encode("admin123"));
				admin.setRole("Admin");
				admin.setHotelBranch("All");
				userRepository.save(admin);
				System.out.println("Default admin user created: admin/admin123");
			}
		};
	}
}
