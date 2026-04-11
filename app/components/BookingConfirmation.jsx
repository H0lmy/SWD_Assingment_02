
export default function BookingConfirmation({ booking, onReset }) {
    // this component retrieves the data of the booking after it is successful
  return (
    <div className="booking-confirmation">
      <h2>Booking Confirmed!</h2>
      <p>
        Your booking for <strong>{booking.movie.title}</strong> on{' '}
        <strong>{booking.movie.date}</strong> at{' '}
        <strong>{booking.showtime}</strong> has been confirmed. A confirmation
        text has been sent to <strong>{booking.mobile}</strong>.
      </p>
      <button className="reset-btn" onClick={onReset}>Book Another Ticket</button>
    </div>
  )
}