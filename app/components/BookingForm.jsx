import { useState } from 'react'
import movies from '../constants/movies.js'
// these are the use state constants for all changeable fields of the form
export default function BookingForm({ onBook }) {
  const [movie, setMovie] = useState('')
  const [showtime, setShowtime] = useState('')
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')

// store teh current selected movie from the form list
  const selectedMovie = movies.find((m) => m.title === movie)
  // updates movie after new selection and clears the showtime field stored form previous selection
  function handleMovieChange(e) {
    setMovie(e.target.value)
    setShowtime('')
  }
  // perform all required checks for the data on the field and apply a regex check for a phone number
  function handleSubmit(e) {
    e.preventDefault()

    if (!movie) {
      setError('Please select a movie.')
      return
    }
    if (!showtime) {
      setError('Please select a showtime.')
      return
    }
    if (!/^[0-9]{10,15}$/.test(mobile)) {
      setError('Please enter a valid mobile number (10-15 digits).')
      return
    }

    setError('')
        // pass all data if the verification were successful
    onBook({ movie: selectedMovie, showtime, mobile })
  }
  // the whole component itself
  return (
    <div className="booking-form">
      <h2>Book a Cinema Ticket</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Movie</label>
          <select value={movie} onChange={handleMovieChange}>
            // iterate throughout each value of the movie
            <option value="">-- Select a movie --</option>
            {movies.map((m) => (
              <option key={m.title} value={m.title}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Showtime</label>
          <select

            value={showtime}
            onChange={(e) => setShowtime(e.target.value)}
              // this check  avoids using the showtime field if the movie is not selected
            disabled={!selectedMovie}
          >
            <option value="">-- Select a showtime --</option>
            {selectedMovie &&
              selectedMovie.showtimes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="e.g. 0871234567"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-btn">
          Book Tickets
        </button>
      </form>
    </div>
  )
}