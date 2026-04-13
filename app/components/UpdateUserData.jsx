'use client'

import {useState} from 'react'

export default function UpdateUserData({initialUser, onUpdated}) {
    const [userData, setUserData] = useState({
        firstName: initialUser?.firstName ?? '',
        lastName: initialUser?.lastName ?? '',
        address: initialUser?.address ?? '',
        mobile: initialUser?.mobile ?? '',
        email: initialUser?.email ?? '',
        eircode: initialUser?.eircode ?? '',
    })
    const [fieldErrors, setFieldErrors] = useState({})
    const [generalError, setGeneralError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e) {
        setUserData({...userData, [e.target.name]: e.target.value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFieldErrors({})
        setGeneralError(null)
        setSuccess(null)
        setSubmitting(true)

        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user: userData}),
            })
            const data = await res.json()

            if (!res.ok) {
                if (data.errors?.user) setFieldErrors(data.errors.user)
                else setGeneralError(data.error ?? 'Update failed.')
                return
            }

            setSuccess('User data successfully updated')
            onUpdated?.(userData)
        } catch {
            setGeneralError('Could not connect to server')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h3>Edit User Details</h3>

            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
                <label>First Name</label>
                <input name="firstName" value={userData.firstName} onChange={handleChange} placeholder="First Name"/>
                {fieldErrors.firstName && <span className="error">{fieldErrors.firstName}</span>}
            </div>

            <div className="form-group">
                <label>Last Name</label>
                <input name="lastName" value={userData.lastName} onChange={handleChange} placeholder="Last Name"/>
                {fieldErrors.lastName && <span className="error">{fieldErrors.lastName}</span>}
            </div>

            <div className="form-group">
                <label>Address</label>
                <input name="address" value={userData.address} onChange={handleChange} placeholder="123 Main Street, Dublin"/>
                {fieldErrors.address && <span className="error">{fieldErrors.address}</span>}
            </div>

            <div className="form-group">
                <label>Mobile</label>
                <input name="mobile" value={userData.mobile} onChange={handleChange} placeholder="+353851234567"/>
                {fieldErrors.mobile && <span className="error">{fieldErrors.mobile}</span>}
            </div>

            <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={userData.email} onChange={handleChange} placeholder="email@example.com"/>
                {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
                <label>Eircode</label>
                <input name="eircode" value={userData.eircode} onChange={handleChange} placeholder="D01 X2Y3"/>
                {fieldErrors.eircode && <span className="error">{fieldErrors.eircode}</span>}
            </div>

            {generalError && <p className="error" role="alert">{generalError}</p>}

            <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
            </button>
        </form>
    )
}