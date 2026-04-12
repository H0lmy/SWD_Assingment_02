import {useEffect, useState} from "react";

export default function AddUserForm(){
    const[userFields, setUserFields] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        eircode: ''
    });

    const [applianceField, setApplianceField] = useState({
        applianceType: '',
        brand: '',
        modelNumber: '',
        serialNumber: '',
        purchaseDate: '',
        warrantyExpDate: '',
        cost: ''


    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(null);


}