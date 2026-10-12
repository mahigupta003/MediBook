import { useEffect, useState } from 'react'
import './App.css'

function formatAppointmentDateTime(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.replace('T', ' ')
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
}

function App() {
  const [selectedDoctor, setSelectedDoctor]= useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [appointments, setAppointments] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [lastBookedAppointment, setLastBookedAppointment] = useState(null)
  const [rescheduleDates, setRescheduleDates] = useState({})
  const [reschedulingId, setReschedulingId] = useState(null)
  const [rescheduleErrors, setRescheduleErrors] = useState({})

  useEffect(() => {
    fetch('http://localhost:8080/api/doctors')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load doctors')
        }
        return response.json()
      })
      .then((data) => {
        setDoctors(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Doctors could not be loaded. Please check that the backend is running.')
        setLoading(false)
      })
  }, [])

  

const handleBooking = async (event) => {
  event.preventDefault()
  setBookingSuccess(false)

  const form = event.currentTarget

  const appointment = {
    patientName: form.patientName.value,
    patientEmail: form.patientEmail.value,
    appointmentDateTime: form.appointmentDateTime.value,
    status: 'BOOKED',
    doctor: { id: selectedDoctor.id }
  }

  setBookingLoading(true)

  try {
    const response = await fetch('http://localhost:8080/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    })

    if (!response.ok) {
      alert(await response.text())
      return
    }

   const savedAppointment = await response.json()

   setLastBookedAppointment(savedAppointment)
   setBookingSuccess(true)

form.reset()
setSelectedDoctor(null)


  } catch {
    alert('Could not connect to the backend. Please try again.')
  } finally {
    setBookingLoading(false)
  }
}


const handleSearchAppointments = async (event) => {
  event.preventDefault()

  setSearchLoading(true)
  setSearchError('')
  setAppointments([])

  try {
    const response = await fetch(
      `http://localhost:8080/api/appointments/search?email=${encodeURIComponent(searchEmail)}`
    )

    if (!response.ok) {
      throw new Error('Unable to search appointments. Please try again.')
    }

    const data = await response.json()
    setAppointments(data)

    if (data.length === 0) {
      setSearchError('No appointments found for this email.')
    }
  } catch (error) {
    setSearchError(error.message || 'Could not connect to the backend.')
  } finally {
    setSearchLoading(false)
  }
}

 const handleCancelAppointment = async (appointmentId) => {
  const confirmed = window.confirm(
    'Are you sure you want to cancel this appointment?'
  )

  if (!confirmed) return

  try {
    const response = await fetch(
      `http://localhost:8080/api/appointments/${appointmentId}/cancel`,
      { method: 'PUT' }
    )

    if (!response.ok) {
      alert(await response.text())
      return
    }

    alert('Appointment cancelled successfully!')

    const searchResponse = await fetch(
      `http://localhost:8080/api/appointments/search?email=${encodeURIComponent(searchEmail)}`
    )

    if (searchResponse.ok) {
      setAppointments(await searchResponse.json())
    }
  } catch {
    alert('Could not connect to the backend.')
  }
}

const handleRescheduleAppointment = async (appointmentId) => {
  const newDateTime = rescheduleDates[appointmentId]
  if (!newDateTime) {
    setRescheduleErrors((current) => ({ ...current, [appointmentId]: 'Choose a new date and time first.' }))
    return
  }

  setReschedulingId(appointmentId)
  setRescheduleErrors((current) => ({ ...current, [appointmentId]: '' }))
  try {
    const query = new URLSearchParams({ newDateTime })
    const response = await fetch(
      `http://localhost:8080/api/appointments/${appointmentId}/reschedule?${query}`,
      { method: 'PUT' }
    )

    if (!response.ok) {
      const details = await response.text()
      throw new Error(details || `Rescheduling failed (${response.status}). Please try again.`)
    }

    const searchResponse = await fetch(
      `http://localhost:8080/api/appointments/search?email=${encodeURIComponent(searchEmail)}`
    )
    if (!searchResponse.ok) {
      throw new Error('Appointment was rescheduled, but the list could not be refreshed. Search again to see the updated time.')
    }
    setAppointments(await searchResponse.json())
    setRescheduleDates((current) => ({ ...current, [appointmentId]: '' }))
  } catch (error) {
    setRescheduleErrors((current) => ({
      ...current,
      [appointmentId]: error.message || 'Could not connect to the backend. Please try again.'
    }))
  } finally {
    setReschedulingId(null)
  }
}

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">✚ MediBook</div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#doctors">Find Doctors</a>
          <a href="#appointments">Appointments</a>
        </div>
        <button className="login-btn" onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}>
          Find a Doctor
        </button>
      </nav>

      <main id="home">
        <section className="hero">
          <div className="hero-text">
            <span className="tag">YOUR HEALTH, OUR PRIORITY</span>
            <h1>Healthcare made <span>simple.</span></h1>
            <p>
              Find the right doctor, book your appointment, and
              manage your healthcare journey—all in one place.
            </p>
            <a className="primary-btn" href="#doctors">
              Find a Doctor →
            </a>
            <div className="trust">✓ Easy Booking &nbsp; ✓ Trusted Doctors</div>
          </div>

          <div className="hero-card">
            <div className="medical-icon">✚</div>
            <h2>Your health matters.</h2>
            <p>Quality care starts with the right appointment.</p>
            <div className="mini-card">
              <span className="doctor-icon">👩‍⚕️</span>
              <div>
                <strong>Find your specialist</strong>
                <p>Care that fits your needs</p>
              </div>
            </div>
          </div>
        </section>

        <section className="features" id="doctors">
          <div className="section-heading">
            <span className="tag">OUR MEDICAL TEAM</span>
            <h2>Meet Our Doctors</h2>
            <p>Choose a specialist for your healthcare needs.</p>
          </div>

          {loading && <p>Loading doctors...</p>}

          {error && <p role="alert">{error}</p>}

          {!loading && !error && doctors.length === 0 && (
            <p>No doctors are available right now.</p>
          )}

          {!loading && !error && doctors.length > 0 && (
            <div className="feature-grid">
              {doctors.map((doctor) => (
                <article className="feature-card" key={doctor.id}>
                  <div className="feature-icon">👨‍⚕️</div>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization}</p>
                  <p>
                    Consultation fee: ₹{doctor.consultationFee}
                  </p>
                  <button
                    className="primary-btn"
                    onClick={() =>{
                      setSelectedDoctor(doctor)
                    }}
                    >
                      Book Appointment

                      </button>  
                </article>
              ))}
            </div>
          )}
        </section>


{bookingSuccess && lastBookedAppointment && (
  <div className="booking-success" role="status">
    <span className="success-icon">✓</span>
    <h3>Appointment booked successfully!</h3>
    <p>Your appointment has been saved.</p>

    <div className="confirmation-details">
      <p>
        <strong>Appointment ID:</strong>{' '}
        #{lastBookedAppointment.id}
      </p>

      <p>
        <strong>Doctor:</strong>{' '}
        {lastBookedAppointment.doctor?.name ||
          'Doctor details unavailable'}
      </p>

      <p>
        <strong>Date &amp; Time:</strong>{' '}
        {formatAppointmentDateTime(lastBookedAppointment.appointmentDateTime)}
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {lastBookedAppointment.status}
      </p>
    </div>
  </div>
)}

 

        {selectedDoctor && (
          <section className="features" id="booking">
            <div className="section-heading">
              <span className="tag">BOOK YOUR VISIT</span>
              <h2>Appointment with {selectedDoctor.name}</h2>
              <p>
                Specialization: {selectedDoctor.specialization} |
                Fee: ₹{selectedDoctor.consultationFee}
              </p>
            </div>
         {bookingSuccess && (
          <div className="booking-success" role="status">
          <span className="success-icon">✓</span>
           <h3>Appointment booked successfully!</h3>
           <p>Your appointment has been saved.</p>
           </div>
          )}
            <form className="booking-form" onSubmit={handleBooking}>
              <label>
                Patient Name
                <input
                  type="text"
                  name="patientName"
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="patientEmail"
                  placeholder="Enter your email"
                  required
                />
              </label>

              <label>
                Appointment Date and Time
                <input
                  type="datetime-local"
                  name="appointmentDateTime"
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  required
                />
              </label>

              

                
           <button
             className="primary-btn"
             type="submit"
             disabled={bookingLoading}
            >
            {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
            </button>


              <button
                className="cancel-btn"
                type="button"
                onClick={() => setSelectedDoctor(null)}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        <section className="features" id="appointments">
  <div className="section-heading">
    <span className="tag">YOUR VISITS</span>
    <h2>Manage Appointments</h2>
    <p>Enter your email to view your booked appointments.</p>
  </div>

  <form className="booking-form" onSubmit={handleSearchAppointments}>
    <label>
      Email Address
      <input
        type="email"
        value={searchEmail}
        onChange={(event) => setSearchEmail(event.target.value)}
        placeholder="Enter your booking email"
        required
      />
    </label>

    <button className="primary-btn" type="submit" disabled={searchLoading}>
      {searchLoading ? 'Searching...' : 'Find My Appointments'}
    </button>
  </form>

  {searchError && <p role="alert">{searchError}</p>}

  {appointments.length > 0 && (
    <div className="feature-grid">
      {appointments.map((appointment) => (
        <article className="feature-card" key={appointment.id}>
          <h3>Appointment #{appointment.id}</h3>
          <p>Patient: {appointment.patientName}</p>
          <p>Doctor: {appointment.doctor?.name || 'Not assigned'}</p>
          <p>
            Specialization: {appointment.doctor?.specialization || 'N/A'}
          </p>
          <p>
            <strong>Date &amp; Time:</strong>{' '}
             {formatAppointmentDateTime(appointment.appointmentDateTime)}
          </p>


<p className="appointment-status">
  Status:
  <span className={`status-badge ${appointment.status?.toLowerCase()}`}>
    {appointment.status}
  </span>
</p>


           {appointment.status === 'BOOKED' && (
  <div className="appointment-actions">
    <label className="reschedule-label">
      New date and time
      <input
        type="datetime-local"
        min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
        value={rescheduleDates[appointment.id] || ''}
        onChange={(event) => {
          setRescheduleDates((current) => ({ ...current, [appointment.id]: event.target.value }))
          setRescheduleErrors((current) => ({ ...current, [appointment.id]: '' }))
        }}
        disabled={reschedulingId === appointment.id}
      />
    </label>
    {rescheduleErrors[appointment.id] && (
      <p className="reschedule-error" role="alert">{rescheduleErrors[appointment.id]}</p>
    )}
    <button
      className="primary-btn"
      type="button"
      onClick={() => handleRescheduleAppointment(appointment.id)}
      disabled={reschedulingId === appointment.id}
    >
      {reschedulingId === appointment.id ? 'Rescheduling...' : 'Reschedule Appointment'}
    </button>
    <button
      className="cancel-btn"
      type="button"
      onClick={() => handleCancelAppointment(appointment.id)}
      disabled={reschedulingId === appointment.id}
    >
      Cancel Appointment
    </button>
  </div>
)}



        </article>
      ))}
    </div>
  )}
 </section>

      </main>

      <footer>© 2026 MediBook · Your health, our priority.</footer>
    </div>
  )
}

export default App
