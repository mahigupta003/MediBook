package com.medibook.medibook;

import com.medibook.medibook.entity.Appointment;
import com.medibook.medibook.service.AppointmentLifecycleRules;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class MedibookApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void bookedAppointmentCanBeRescheduledOrCancelled() {
        Appointment appointment = appointmentWithStatus("BOOKED");
        assertDoesNotThrow(() ->
                AppointmentLifecycleRules.requireBookedForChange(appointment, "rescheduled"));
        assertDoesNotThrow(() ->
                AppointmentLifecycleRules.requireBookedForChange(appointment, "cancelled"));
    }

    @Test
    void cancelledOrCompletedAppointmentCannotBeChanged() {
        assertThrows(IllegalArgumentException.class, () ->
                AppointmentLifecycleRules.requireBookedForChange(
                        appointmentWithStatus("CANCELLED"), "rescheduled"));
        assertThrows(IllegalArgumentException.class, () ->
                AppointmentLifecycleRules.requireBookedForChange(
                        appointmentWithStatus("COMPLETED"), "cancelled"));
    }

    @Test
    void onlyBookedAppointmentsCanTransitionToCompletedOrCancelled() {
        Appointment booked = appointmentWithStatus("BOOKED");
        assertDoesNotThrow(() ->
                AppointmentLifecycleRules.requireStatusTransition(booked, "COMPLETED"));
        assertDoesNotThrow(() ->
                AppointmentLifecycleRules.requireStatusTransition(booked, "CANCELLED"));
        assertThrows(IllegalArgumentException.class, () ->
                AppointmentLifecycleRules.requireStatusTransition(booked, "BOOKED"));
        assertThrows(IllegalArgumentException.class, () ->
                AppointmentLifecycleRules.requireStatusTransition(
                        appointmentWithStatus("CANCELLED"), "BOOKED"));
    }

    private Appointment appointmentWithStatus(String status) {
        Appointment appointment = new Appointment();
        appointment.setStatus(status);
        return appointment;
    }
}
