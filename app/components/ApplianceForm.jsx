import { useState, useEffect } from 'react'

export default function ApplianceForm() {
  const [fields, setFields] = useState({
    eircode: '',
    applianceType: '',
    brand: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyDate: '',
  })

  const [errors, setErrors] = useState({})
  const [confirmation, setConfirmation] = useState(null)
  // appliance types fetched from the server
  const [applianceTypes, setApplianceTypes] = useState([])
  // inventory list fetched after successful registration
  const [inventory, setInventory] = useState([])
  // loading state for the form
  let isLoading = false

  // fetch the appliance types from the backend on page load
  useEffect(() => {
    fetch('/api/appliances')
      .then((res) => res.json())
      .then((data) => setApplianceTypes(data.applianceTypes))
  }, [])

  // fetch the current inventory from the backend
  function loadInventory() {
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => setInventory(data.inventory))
  }

  // handle a change in any form field
  function handleChange(e) {
    setFields({ ...fields, [e.target.name]: e.target.value })
  }

  // handle form submission - post to register endpoint
  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setConfirmation(null)
    isLoading = true

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })

      const data = await res.json()

      if (!res.ok) {
        // sticky behaviour: clear fields which are not validated on the server
        setErrors(data.errors)
        setFields(data.fields)
        isLoading = false
        return
      }

      // on success show confirmation and display updated inventory
      setConfirmation(data.entry)
      loadInventory()
      isLoading = false
    } catch {
      setErrors({ general: 'Could not connect to the server.' })
      isLoading = false
    }
  }

  return (
    <div className="appliance-form">
      <h2>House Appliance Inventory</h2>

      {confirmation && (
        <div className="success-message">
          <strong>{confirmation.brand} {confirmation.applianceType}</strong> at{' '}
          <strong>{confirmation.eircode}</strong> has been added to the inventory.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Eircode</label>
          <input
            name="eircode"
            value={fields.eircode}
            onChange={handleChange}
            placeholder="e.g. D01 X2Y3"
            maxLength={8}
            required
          />
          {errors.eircode && <span className="error">{errors.eircode}</span>}
        </div>

        <div className="form-group">
          <label>Appliance Type</label>
          <select name="applianceType" value={fields.applianceType} onChange={handleChange} required>
            <option value="">-- Select type --</option>
            {applianceTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.applianceType && <span className="error">{errors.applianceType}</span>}
        </div>

        <div className="form-group">
          <label>Brand</label>
          <input
            name="brand"
            value={fields.brand}
            onChange={handleChange}
            placeholder="e.g. Samsung"
            maxLength={50}
            required
          />
          {errors.brand && <span className="error">{errors.brand}</span>}
        </div>

        <div className="form-group">
          <label>Model Number</label>
          <input
            name="modelNumber"
            value={fields.modelNumber}
            onChange={handleChange}
            placeholder="000-000-0000"
            pattern="\d{3}-\d{3}-\d{4}"
            maxLength={12}
            required
          />
          {errors.modelNumber && <span className="error">{errors.modelNumber}</span>}
        </div>

        <div className="form-group">
          <label>Serial Number</label>
          <input
            name="serialNumber"
            value={fields.serialNumber}
            onChange={handleChange}
            placeholder="0000-0000-0000"
            pattern="\d{4}-\d{4}-\d{4}"
            maxLength={14}
            required
          />
          {errors.serialNumber && <span className="error">{errors.serialNumber}</span>}
        </div>

        <div className="form-group">
          <label>Purchase Date (DD/MM/YYYY)</label>
          <input
            name="purchaseDate"
            value={fields.purchaseDate}
            onChange={handleChange}
            placeholder="DD/MM/YYYY"
            pattern="\d{2}/\d{2}/\d{4}"
            maxLength={10}
            required
          />
          {errors.purchaseDate && <span className="error">{errors.purchaseDate}</span>}
        </div>

        <div className="form-group">
          <label>Warranty Expiration Date (DD/MM/YYYY)</label>
          <input
            name="warrantyDate"
            value={fields.warrantyDate}
            onChange={handleChange}
            placeholder="DD/MM/YYYY"
            pattern="\d{2}/\d{2}/\d{4}"
            maxLength={10}
            required
          />
          {errors.warrantyDate && <span className="error">{errors.warrantyDate}</span>}
        </div>

        {errors.general && <p className="error">{errors.general}</p>}

        <button type="submit" className="submit-btn">Add to Inventory</button>
      </form>

      {inventory.length > 0 && (
        <div className="inventory-list">
          <h3>Current Inventory</h3>
          {inventory.map((item, i) => (
            <div key={i} className="inventory-item">
              <strong>{item.brand} {item.applianceType}</strong> — {item.eircode}
              <br />
              Model: {item.modelNumber} | Serial: {item.serialNumber}
              <br />
              Purchased: {item.purchaseDate} | Warranty: {item.warrantyDate}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
