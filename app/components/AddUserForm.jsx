import {useState} from "react";

export default function AddUserForm({onSubmit, serverErrors}) {
    const [userFields, setUserFields] = useState({
        firstName: '',
        lastName: '',
        address: '',
        email: '',
        mobile: '',
        eircode: ''
    });

    const [errors, setErrors] = useState({});

    function handleChange(e) {
        setUserFields({...userFields, [e.target.name]: e.target.value})
    }

    function handleSubmit(e) {
        e.preventDefault()
        setErrors({})
        onSubmit(userFields)
    }

    // surface validation errors returned by the API
    const shownErrors = serverErrors ?? errors

    return (
        <div className="appliance-form">
            <form onSubmit={handleSubmit}>
                <h3>User Details</h3>

                <div className="form-group">
                    <label>First Name</label>
                    <input name="firstName" value={userFields.firstName} onChange={handleChange} placeholder="First Name" />
                    {shownErrors.firstName && <span className="error">{shownErrors.firstName}</span>}
                </div>

                <div className="form-group">
                    <label>Last Name</label>
                    <input name="lastName" value={userFields.lastName} onChange={handleChange} placeholder="Last Name" />
                    {shownErrors.lastName && <span className="error">{shownErrors.lastName}</span>}
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input name="address" value={userFields.address} onChange={handleChange} placeholder="123 Main Street, Dublin" />
                    {shownErrors.address && <span className="error">{shownErrors.address}</span>}
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input name="email" value={userFields.email} onChange={handleChange} placeholder="email@example.com" />
                    {shownErrors.email && <span className="error">{shownErrors.email}</span>}
                </div>

                <div className="form-group">
                    <label>Mobile</label>
                    <input name="mobile" value={userFields.mobile} onChange={handleChange} placeholder="+353851234567" />
                    {shownErrors.mobile && <span className="error">{shownErrors.mobile}</span>}
                </div>

                <div className="form-group">
                    <label>Eircode</label>
                    <input name="eircode" value={userFields.eircode} onChange={handleChange} placeholder="D01 X2Y3" />
                    {shownErrors.eircode && <span className="error">{shownErrors.eircode}</span>}
                </div>

                {shownErrors.general && <p className="error">{shownErrors.general}</p>}

                <button type="submit" className="submit-btn">Next</button>
            </form>
        </div>
    )
}