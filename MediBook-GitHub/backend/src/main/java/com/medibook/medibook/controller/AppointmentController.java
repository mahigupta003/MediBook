package com.medibook.medibook.controller;

import com.medibook.medibook.entity.Appointment;
import com.medibook.medibook.entity.Doctor;
import com.medibook.medibook.repository.AppointmentRepository;
import com.medibook.medibook.repository.DoctorRepository;
import com.medibook.medibook.service.AppointmentLifecycleRules;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
    }

    @PostMapping
    public Appointment bookAppointment(@Valid @RequestBody Appointment appointment) {

        if (appointment.getDoctor() == null ||
                appointment.getDoctor().getId() == null) {
            throw new IllegalArgumentException("Doctor ID is required");
        }

        Long doctorId = appointment.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Doctor not found"));

        appointment.setDoctor(doctor);

        if (appointment.getAppointmentDateTime() == null) {
            throw new IllegalArgumentException(
                    "Appointment date and time are required");
        }

        if (appointment.getAppointmentDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "Appointment date and time must be in the future");
        }

        if (appointment.getStatus() == null ||
                appointment.getStatus().isBlank()) {
            appointment.setStatus("BOOKED");
        }

        boolean alreadyBooked =
                appointmentRepository.existsByDoctorIdAndAppointmentDateTimeAndStatus(
                        doctor.getId(),
                        appointment.getAppointmentDateTime(),
                        "BOOKED"
                );

        if (alreadyBooked && "BOOKED".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalArgumentException(
                    "This doctor already has an appointment at this time");
        }

        return appointmentRepository.save(appointment);

    }
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Appointment not found"));
    }

    @GetMapping("/search")
    public List<Appointment> getAppointmentsByPatientEmail(
            @RequestParam String email) {

        return appointmentRepository.findByPatientEmail(email);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctor(
            @PathVariable Long doctorId) {

        return appointmentRepository.findAll()
                .stream()
                .filter(appointment ->
                        appointment.getDoctor() != null &&
                                appointment.getDoctor().getId().equals(doctorId))
                .toList();
    }

    @PutMapping("/{id}/cancel")
    public Appointment cancelAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Appointment not found"));

        AppointmentLifecycleRules.requireBookedForChange(appointment, "cancelled");

        appointment.setStatus("CANCELLED");

        return appointmentRepository.save(appointment);
    }

    @PutMapping("/{id}/status")
    public Appointment updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Appointment not found"));



        String normalizedStatus = status.trim().toUpperCase();

        if (!normalizedStatus.equals("BOOKED")
                && !normalizedStatus.equals("CANCELLED")
                && !normalizedStatus.equals("COMPLETED")) {
            throw new IllegalArgumentException(
                    "Invalid status. Allowed values: BOOKED, CANCELLED, COMPLETED"
            );
        }

        AppointmentLifecycleRules.requireStatusTransition(appointment, normalizedStatus);
        appointment.setStatus(normalizedStatus);

        return appointmentRepository.save(appointment);
    }

    @PutMapping("/{id}/reschedule")
    public Appointment rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam LocalDateTime newDateTime) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Appointment not found"));

        AppointmentLifecycleRules.requireBookedForChange(appointment, "rescheduled");

        if (newDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "New appointment date and time must be in the future");
        }

        boolean alreadyBooked =
                appointmentRepository.existsByDoctorIdAndAppointmentDateTimeAndStatusAndIdNot(
                        appointment.getDoctor().getId(),
                        newDateTime,
                        "BOOKED",
                        id);

        if (alreadyBooked) {
            throw new IllegalArgumentException(
                    "This doctor already has an appointment at this time");
        }

        appointment.setAppointmentDateTime(newDateTime);
        appointment.setStatus("BOOKED");

        return appointmentRepository.save(appointment);
    }
}