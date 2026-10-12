package com.medibook.medibook.service;

import com.medibook.medibook.entity.Appointment;

public final class AppointmentLifecycleRules {
    private AppointmentLifecycleRules() {}

    public static void requireBookedForChange(Appointment appointment, String action) {
        if (appointment == null || !"BOOKED".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalArgumentException("Only booked appointments can be " + action);
        }
    }

    public static void requireStatusTransition(Appointment appointment, String newStatus) {
        requireBookedForChange(appointment, "updated");
        if (!"COMPLETED".equals(newStatus) && !"CANCELLED".equals(newStatus)) {
            throw new IllegalArgumentException(
                    "A booked appointment can only be marked COMPLETED or CANCELLED");
        }
    }
}
