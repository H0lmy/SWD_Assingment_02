'use client'

import {useState} from 'react'
import UpdateUserData from '../../components/UpdateUserData'

export default function UpdateUserPage() {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState(null)

    function handleEmailSubmit(e) {
        e.preventDefault()
        const trimmed = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setEmailError('Please enter a valid email.')
            return
        }
        setEmailError(null)
        setEmail(trimmed)
        setStep(2)
    }

    return (
        <div className="appliance-form">
            {step === 1 ? (
                <form onSubmit={handleEmailSubmit}>
                    <h3>Update User</h3>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                        />
                        {emailError && <span className="error">{emailError}</span>}
                    </div>
                    <button type="submit" className="submit-btn">Next</button>
                </form>
            ) : (
                <UpdateUserData initialUser={{email}}/>
            )}
        </div>
    )
}