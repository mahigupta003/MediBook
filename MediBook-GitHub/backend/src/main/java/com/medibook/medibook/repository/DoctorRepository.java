package com.medibook.medibook.repository;

import com.medibook.medibook.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByEmail(String email);
}
