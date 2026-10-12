package com.medibook.medibook.repository;

import com.medibook.medibook.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByDoctorIdAndAppointmentDateTimeAndStatus(
            Long doctorId,
            LocalDateTime appointmentDateTime,
            String status
    );

    boolean existsByDoctorIdAndAppointmentDateTimeAndStatusAndIdNot(
            Long doctorId,
            LocalDateTime appointmentDateTime,
            String status,
            Long id
    );

    List<Appointment>findByPatientEmail(String patientEmail);
}