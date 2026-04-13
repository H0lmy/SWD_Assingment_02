'use client'

import {useState} from 'react'

export default function UpdateAppliance({initialAppliance, onUpdated}) {
    const [fields, setFields] = useState({
        applianceType: initialAppliance?.applianceType ?? '',
        brand: initialAppliance?.brand ?? '',
        modelNumber: initialAppliance?.modelNumber ?? '',
        serialNumber: initialAppliance?.serialNumber ?? '',
        purchaseDate: initialAppliance?.purchaseDate ?? '',
        warrantyExpDate: initialAppliance?.warrantyExpDate ?? '',
        cost: initialAppliance?.cost ?? '',
    })

    const [fieldErrors, setFieldErrors] = useState({})
    const [generalError, setGeneralError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e) {
        setFields({...fields, [e.target.name]: e.target.value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFieldErrors({})
        setGeneralError(null)
        setSuccess(null)
        setSubmitting(true)

        try {
            const res = await fetch('/api/appliances', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({appliance: fields}),
            })
            const data = await res.json()

            if (!res.ok) {
                if (data.errors?.appliance) setFieldErrors(data.errors.appliance)
                else setGeneralError(data.error ?? 'Update failed.')
                return
            }

            setSuccess('Appliance has been updated successfully.')
            onUpdated?.(fields)
        } catch {
            setGeneralError('Could not connect to the server.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h3>Edit Appliance</h3>

            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
                <label>Appliance Type</label>
                <input name="applianceType" value={fields.applianceType} onChange={handleChange} placeholder="e.g. Washing Machine"/>
                {fieldErrors.applianceType && <span className="error">{fieldErrors.applianceType}</span>}
            </div>

            <div className="form-group">
                <label>Brand</label>
                <input name="brand" value={fields.brand} onChange={handleChange} placeholder="e.g. Samsung"/>
                {fieldErrors.brand && <span className="error">{fieldErrors.brand}</span>}
            </div>

            <div className="form-group">
                <label>Model Number</label>
                <input name="modelNumber" value={fields.modelNumber} onChange={handleChange} placeholder="000-000-0000"/>
                {fieldErrors.modelNumber && <span className="error">{fieldErrors.modelNumber}</span>}
            </div>

            <div className="form-group">
                <label>Serial Number</label>
                <input name="serialNumber" value={fields.serialNumber} onChange={handleChange} placeholder="0000-0000-0000"/>
                {fieldErrors.serialNumber && <span className="error">{fieldErrors.serialNumber}</span>}
            </div>

            <div className="form-group">
                <label>Purchase Date (DD/MM/YYYY)</label>
                <input name="purchaseDate" value={fields.purchaseDate} onChange={handleChange} placeholder="DD/MM/YYYY"/>
                {fieldErrors.purchaseDate && <span className="error">{fieldErrors.purchaseDate}</span>}
            </div>

            <div className="form-group">
                <label>Warranty Expiration Date (DD/MM/YYYY)</label>
                <input name="warrantyExpDate" value={fields.warrantyExpDate} onChange={handleChange} placeholder="DD/MM/YYYY"/>
                {fieldErrors.warrantyExpDate && <span className="error">{fieldErrors.warrantyExpDate}</span>}
            </div>

            <div className="form-group">
                <label>Cost</label>
                <input name="cost" value={fields.cost} onChange={handleChange} placeholder="e.g. 499.99"/>
                {fieldErrors.cost && <span className="error">{fieldErrors.cost}</span>}
            </div>

            {generalError && <p className="error" role="alert">{generalError}</p>}

            <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
            </button>
        </form>
    )
}