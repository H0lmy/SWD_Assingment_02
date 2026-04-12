import pool from "../../library/db.js";


export async function POST(request) {
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body.'}, {status: 400})
    }

    // take the raw data sanitise it and than validate
    const cleaned = sanitizePayload(rawPayload)
    const errors = validate(cleaned)
    // return all errors if they exist
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }

    const {user, appliance} = cleaned
    // open connection
    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()

        // check if user already exists by email
        const [existingUser] = await connection.query(
            'SELECT userID FROM Appliance.users WHERE email = ?',
            [user.email]
        )

        let userID
        if (existingUser.length > 0) {
            // user already in db — use their existing ID
            userID = existingUser[0].userID
        } else {
            // new user — insert and get the new ID
            const [userResult] = await connection.query(
                'INSERT INTO Appliance.users(firstName,lastName,address,mobile,email,eircode) VALUES (?,?,?,?,?,?)',
                [user.firstName, user.lastName, user.address, user.mobile, user.email, user.eircode]
            )
            userID = userResult.insertId
        }

        // insert the appliance linked to the user
        await connection.query(`INSERT INTO Appliance.appliance
                                (userID, applianceType, brand, modelNumber, serialNumber, purchaseDate, warrantyExpDate,
                                 cost)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userID, appliance.applianceType, appliance.brand, appliance.modelNumber,
                appliance.serialNumber, appliance.purchaseDate, appliance.warrantyExpDate, appliance.cost])
        // save execution of both queries
        await connection.commit();
        // object is returned if the execution was successful
        return Response.json({userID}, {status: 201})


    } catch (err) {
        // delete all the data sent to the system if error has occurred
        await connection.rollback()
        // duplicate serial number triggers a UNIQUE sql error
        if (err.code === 'ER_DUP_ENTRY') {
            return Response.json(
                {errors: {appliance: {serialNumber: 'An appliance with this serial number already exists.'}}},
                {status: 409}
            )
        }
        return Response.json({error: err.message}, {status: 500})
    } finally {
        // close the connection
        connection.release()
    }


}


export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const serialNumber = (searchParams.get('serialNumber') ?? '').trim()
    const applianceType = (searchParams.get('applianceType') ?? '')
    const brand = (searchParams.get('brand') ?? '')
    const modelNumber = (searchParams.get('modelNumber') ?? '')

    // validate the format before
    if (serialNumber && !/^\d{4}-\d{4}-\d{4}$/.test(serialNumber)) {
        return Response.json(
            {error: 'Invalid serial number. Expected format: 0000-0000-0000.'},
            {status: 400}
        )
    }

    if (!serialNumber && !applianceType && !modelNumber && !brand) {
        return Response.json({error: 'Provide at least one parameter.'}, {status: 400})
    }

    // open connection
    const connection = await pool.getConnection();

    const conditions = [];
    const params = [];
    if (serialNumber) {
        conditions.push('serialNumber = ?');
        params.push(serialNumber);
    }
    if (applianceType) {
        conditions.push('applianceType = ?');
        params.push(applianceType);
    }
    if (brand) {
        conditions.push('brand = ?');
        params.push(brand);
    }
    if (modelNumber) {
        conditions.push('modelNumber = ?');
        params.push(modelNumber);
    }
    const whereClause = conditions.join(' AND ');
    try {
        const [rows] = await connection.query(
            `SELECT *
             FROM Appliance.appliance
             WHERE ${whereClause}`,
            params
        )

        // if not match - return 404
        if (rows.length === 0) {
            return Response.json(
                {error: 'No matching appliance found.'},
                {status: 404}
            )
        }
        // return the data if its retrieved from db
        return Response.json(rows, {status: 200})
    } catch (err) {
        return Response.json({error: err.message}, {status: 500})
    } finally {
        // release the connection back to the pool
        connection.release()
    }
}

export async function PUT(request) {
    // retrieve the raw data from frontend
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body.'}, {status: 400})
    }
    // sanitise and validate data
    const cleaned = sanitizePayload(rawPayload)
    const errors = validate(cleaned)
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }

    const connection = await pool.getConnection()
    try {
        // open connection
        await connection.beginTransaction()
        // get appliance id and userid related to an appliance of certain user
        const [existing] = await connection.query(
            `SELECT applianceID, userID
             FROM Appliance.appliance
             WHERE serialNumber = ?`, [cleaned.appliance.serialNumber]
        )

        if (existing.length === 0) {
            return Response.json({error: 'No matching appliance found.'}, {status: 404})
        }
        // update appliance data, save the unique modifiers unchangable
        await connection.query(
            `UPDATE Appliance.appliance
             SET applianceType   = ?,
                 brand           = ?,
                 modelNumber     = ?,
                 purchaseDate    = ?,
                 warrantyExpDate = ?,
                 cost            = ?
             WHERE applianceID = ?`,
            [cleaned.appliance.applianceType, cleaned.appliance.brand,
                cleaned.appliance.modelNumber, cleaned.appliance.purchaseDate,
                cleaned.appliance.warrantyExpDate, cleaned.appliance.cost,
                existing[0].applianceID]
        )
        // update users data except unique modifiers
        await connection.query(
            `UPDATE Appliance.users
             SET firstName = ?,
                 lastName  = ?,
                 address   = ?,
                 mobile    = ?,
                 eircode   = ?
             WHERE userID = ?`,
            [cleaned.user.firstName, cleaned.user.lastName, cleaned.user.address,
                cleaned.user.mobile, cleaned.user.eircode,
                existing[0].userID]
        )
        // execute both queries
        await connection.commit()
        return Response.json({message: 'Appliance has been updated.'}, {status: 200})
    } catch (error) {
        await connection.rollback()
        return Response.json({error: error.message}, {status: 500})
    } finally {
        connection.release()
    }
}

export async function DELETE(request) {
    const {searchParams} = new URL(request.url)
    const serialNumber = (searchParams.get('serialNumber') ?? '').trim()

    // validate serial number format
    if (!/^\d{4}-\d{4}-\d{4}$/.test(serialNumber)) {
        return Response.json(
            {error: 'Invalid serial number. Expected format: 0000-0000-0000.'},
            {status: 400}
        )
    }

    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()

        // check the appliance exists before deleting
        const [existing] = await connection.query(
            `SELECT applianceType, brand, serialNumber
             FROM Appliance.appliance
             WHERE serialNumber = ?`, [serialNumber]
        )

        if (existing.length === 0) {
            return Response.json({error: 'No matching appliance found.'}, {status: 404})
        }

        await connection.query(
            `DELETE
             FROM Appliance.appliance
             WHERE serialNumber = ?`, [serialNumber]
        )

        await connection.commit()
        return Response.json({message: 'Appliance has been deleted.', deleted: existing[0]}, {status: 200})
    } catch (error) {
        await connection.rollback()
        return Response.json({error: error.message}, {status: 500})
    } finally {
        connection.release()
    }
}

function validate(payload) {
    const errors = {user: {}, appliance: {}}
    const {user, appliance} = payload

    if (!user.firstName) {
        errors.user.firstName = 'First name is required.'
    } else if (!/^[A-Za-zÀ-ÿ' -]{1,50}$/.test(user.firstName)) {
        errors.user.firstName = 'Letters and name characters only.'
    }

    if (!user.lastName) {
        errors.user.lastName = 'Last name is required.'
    } else if (!/^[A-Za-zÀ-ÿ' -]{1,50}$/.test(user.lastName)) {
        errors.user.lastName = 'Letters and name characters only.'
    }

    if (!user.address) {
        errors.user.address = 'Address is required.'
    } else if (user.address.length > 255) {
        errors.user.address = 'Address cannot exceed 255 characters.'
    }

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.user.email = 'Please enter a valid email.'
    } else if (user.email.length > 255) {
        errors.user.email = 'Email cannot exceed 255 characters.'
    }

    if (!user.mobile || !/^\+?\d{10,15}$/.test(user.mobile)) {
        errors.user.mobile = 'Please enter a valid mobile number.'
    }

    if (!/^[A-Z]\d{2}[A-Z0-9]{4}$/.test(user.eircode)) {
        errors.user.eircode = 'Invalid eircode. Expected format: A00 XXXX'
    }

    if (!appliance.applianceType) {
        errors.appliance.applianceType = 'Appliance type is required.'
    } else if (appliance.applianceType.length > 100) {
        errors.appliance.applianceType = 'Appliance type cannot exceed 100 characters.'
    }

    if (!appliance.brand) {
        errors.appliance.brand = 'Brand is required.'
    } else if (appliance.brand.length > 255) {
        errors.appliance.brand = 'Brand cannot exceed 255 characters.'
    }

    if (!/^\d{3}-\d{3}-\d{4}$/.test(appliance.modelNumber)) {
        errors.appliance.modelNumber = 'Format: 000-000-0000'
    }

    if (!/^\d{4}-\d{4}-\d{4}$/.test(appliance.serialNumber)) {
        errors.appliance.serialNumber = 'Format: 0000-0000-0000'
    }

    if (!appliance.purchaseDate) {
        errors.appliance.purchaseDate = 'Invalid date. Format: DD/MM/YYYY'
    }

    if (!appliance.warrantyExpDate) {
        errors.appliance.warrantyExpDate = 'Invalid date. Format: DD/MM/YYYY'
    }

    if (
        appliance.purchaseDate &&
        appliance.warrantyExpDate &&
        appliance.warrantyExpDate < appliance.purchaseDate
    ) {
        errors.appliance.warrantyExpDate = 'Warranty cannot be earlier than purchase date.'
    }
    if (appliance.cost === null) {
        errors.appliance.cost = 'Cost must be a positive number with at most 2 decimal places.'
    } else if (appliance.cost <= 0) {
        errors.appliance.cost = 'Cost must be greater than 0.'
    } else if (appliance.cost > 9999.99) {
        errors.appliance.cost = 'Cost cannot exceed 9999.99.'
    }

    // strip empty error buckets so the response is clean
    if (Object.keys(errors.user).length === 0) delete errors.user
    if (Object.keys(errors.appliance).length === 0) delete errors.appliance

    return errors
}


function sanitizePayload(payload) {
    const {user = {}, appliance = {}} = payload

    return {
        // sanitising the user fields before validation
        user: {
            firstName: (user.firstName ?? '').trim(),
            lastName: (user.lastName ?? '').trim(),
            address: (user.address ?? '').trim(),
            mobile: (user.mobile ?? '').replace(/[^\d+]/g, ''),
            email: (user.email ?? '').trim().toLowerCase(),
            eircode: (user.eircode ?? '').replace(/\s+/g, '').toUpperCase(),
        },
        // sanitising the appliance fields before validation
        appliance: {
            applianceType: (appliance.applianceType ?? '').trim(),
            brand: (appliance.brand ?? '').trim(),
            modelNumber: (appliance.modelNumber ?? '').trim(),
            serialNumber: (appliance.serialNumber ?? '').trim(),
            purchaseDate: toMysqlDate(appliance.purchaseDate),
            warrantyExpDate: toMysqlDate(appliance.warrantyExpDate),
            cost: toNumber(appliance.cost),
        },
    }
}

function toMysqlDate(str) {
    if (!str) return null
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str.trim())
    if (!match) return null
    const [, day, month, year] = match
    const d = new Date(`${year}-${month}-${day}`)
    if (
        d.getFullYear() !== Number(year) ||
        d.getMonth() + 1 !== Number(month) ||
        d.getDate() !== Number(day)
    ) {
        return null
    }
    return d;
}

// conversion to javascript number function
function toNumber(val) {
    if (val === null || val === undefined || val === '') return null
    const str = String(val).trim()
    if (!/^\d+(\.\d{1,2})?$/.test(str)) return null
    const n = Number(str)
    return Number.isFinite(n) ? n : null
}