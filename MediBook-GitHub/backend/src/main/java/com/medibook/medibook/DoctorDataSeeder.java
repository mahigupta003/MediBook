package com.medibook.medibook;

import com.medibook.medibook.entity.Doctor;
import com.medibook.medibook.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DoctorDataSeeder {
    @Bean
    CommandLineRunner seedSampleDoctors(DoctorRepository doctorRepository) {
        return args -> {
            List<Doctor> sampleDoctors = List.of(
                    doctor("Dr. Amit Kumar", "Cardiologist", "amit@example.com", 500),
                    doctor("Dr. Priya Sharma", "Dermatologist", "priya@example.com", 600),
                    doctor("Dr. Neha Patel", "Pediatrician", "neha@example.com", 550)
            );

            for (Doctor sampleDoctor : sampleDoctors) {
                if (!doctorRepository.existsByEmail(sampleDoctor.getEmail())) {
                    doctorRepository.save(sampleDoctor);
                }
            }
        };
    }

    private static Doctor doctor(
            String name, String specialization, String email, double consultationFee) {
        Doctor doctor = new Doctor();
        doctor.setName(name);
        doctor.setSpecialization(specialization);
        doctor.setEmail(email);
        doctor.setConsultationFee(consultationFee);
        return doctor;
    }
}
