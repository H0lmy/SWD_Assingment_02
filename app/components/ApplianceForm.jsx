import {useState} from 'react'
import Link from 'next/link'

export default function ApplianceForm({userID}) {
    const [applianceFields, setApplianceFields] = useState({
        applianceType: '',
        brand: '',
        modelNumber: '',
        serialNumber: '',
        purchaseDate: '',
        warrantyExpDate: '',
        cost: ''
    })

    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(null)

    function handleChange(e) {
        setApplianceFields({...applianceFields, [e.target.name]: e.target.value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setErrors({})
        setSuccess(null)

        try {
            const res = await fetch('/api/appliances', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userID, appliance: applianceFields})
            })

            const data = await res.json()

            if (!res.ok) {
                setErrors(data.errors || {general: data.error})
                return
            }

            setSuccess('Appliance registered successfully!')
        } catch {
            setErrors({general: 'Could not connect to the server.'})
        }
    }

    return (
        <div className="appliance-form">
            <form onSubmit={handleSubmit}>
                <h3>Appliance Details</h3>

                {success && (
                    <div className="success-message">
                        <p>{success}</p>
                        <Link href="/"><button type="button" className="submit-btn">Back to Homepage</button></Link>
                    </div>
                )}

                <div className="form-group">
                    <label>Appliance Type</label>
                    <input name="applianceType" value={applianceFields.applianceType} onChange={handleChange} placeholder="e.g. Washing Machine" />
                    {errors.appliance?.applianceType && <span className="error">{errors.appliance.applianceType}</span>}
                </div>

                <div className="form-group">
                    <label>Brand</label>
                    <input name="brand" value={applianceFields.brand} onChange={handleChange} placeholder="e.g. Samsung" />
                    {errors.appliance?.brand && <span className="error">{errors.appliance.brand}</span>}
                </div>

                <div className="form-group">
                    <label>Model Number</label>
                    <input name="modelNumber" value={applianceFields.modelNumber} onChange={handleChange} placeholder="000-000-0000" />
                    {errors.appliance?.modelNumber && <span className="error">{errors.appliance.modelNumber}</span>}
                </div>

                <div className="form-group">
                    <label>Serial Number</label>
                    <input name="serialNumber" value={applianceFields.serialNumber} onChange={handleChange} placeholder="0000-0000-0000" />
                    {errors.appliance?.serialNumber && <span className="error">{errors.appliance.serialNumber}</span>}
                </div>

                <div className="form-group">
                    <label>Purchase Date (DD/MM/YYYY)</label>
                    <input name="purchaseDate" value={applianceFields.purchaseDate} onChange={handleChange} placeholder="DD/MM/YYYY" />
                    {errors.appliance?.purchaseDate && <span className="error">{errors.appliance.purchaseDate}</span>}
                </div>

                <div className="form-group">
                    <label>Warranty Expiration Date (DD/MM/YYYY)</label>
                    <input name="warrantyExpDate" value={applianceFields.warrantyExpDate} onChange={handleChange} placeholder="DD/MM/YYYY" />
                    {errors.appliance?.warrantyExpDate && <span className="error">{errors.appliance.warrantyExpDate}</span>}
                </div>

                <div className="form-group">
                    <label>Cost</label>
                    <input name="cost" value={applianceFields.cost} onChange={handleChange} placeholder="e.g. 499.99" />
                    {errors.appliance?.cost && <span className="error">{errors.appliance.cost}</span>}
                </div>

                {errors.general && <p className="error">{errors.general}</p>}

                <button type="submit" className="submit-btn">Register Appliance</button>
            </form>
        </div>
    )
}
