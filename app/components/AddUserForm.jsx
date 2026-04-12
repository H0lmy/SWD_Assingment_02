import {useState} from "react";

export default function AddUserForm({onSubmit}) {
    const [userFields, setUserFields] = useState({
        firstName: '',
        lastName: '',
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
        // pass user data up to the parent
        onSubmit(userFields)
    }

    return (
        <form onSubmit={handleSubmit}>
            <h3>User Details</h3>

            <div className="form-group">
                <label>First Name</label>
                <input name="firstName" value={userFields.firstName} onChange={handleChange} placeholder="First Name" />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>

            <div className="form-group">
                <label>Last Name</label>
                <input name="lastName" value={userFields.lastName} onChange={handleChange} placeholder="Last Name" />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>

            <div className="form-group">
                <label>Email</label>
                <input name="email" value={userFields.email} onChange={handleChange} placeholder="email@example.com" />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
                <label>Mobile</label>
                <input name="mobile" value={userFields.mobile} onChange={handleChange} placeholder="+353851234567" />
                {errors.mobile && <span className="error">{errors.mobile}</span>}
            </div>

            <div className="form-group">
                <label>Eircode</label>
                <input name="eircode" value={userFields.eircode} onChange={handleChange} placeholder="D01 X2Y3" />
                {errors.eircode && <span className="error">{errors.eircode}</span>}
            </div>

            {errors.general && <p className="error">{errors.general}</p>}

            <button type="submit">Next</button>
        </form>
    )
}