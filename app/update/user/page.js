'use client'

import {useState} from 'react'
import UpdateUserData from '../../components/UpdateUserData'

export default function UpdateUserPage() {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState(null)
    const [lookupError, setLookupError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)

    async function handleEmailSubmit(e) {
        e.preventDefault()
        const trimmed = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setEmailError('Please enter a valid email.')
            return
        }
        setEmailError(null)
        setLookupError(null)
        setLoading(true)

        try {
            const res = await fetch(`/api/users?email=${encodeURIComponent(trimmed)}`)
            const data = await res.json()
            if (!res.ok) {
                setLookupError(data.error ?? 'Lookup failed.')
                return
            }
            setEmail(trimmed)
            setUser(data)
            setStep(2)
        } catch {
            setLookupError('Could not connect to the server.')
        } finally {
            setLoading(false)
        }
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
                        {lookupError && <span className="error">{lookupError}</span>}
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Checking…' : 'Next'}
                    </button>
                </form>
            ) : (
                <UpdateUserData initialUser={user}/>
            )}
        </div>
    )
}