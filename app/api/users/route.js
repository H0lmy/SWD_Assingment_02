import pool from '../../library/db.js'

export async function POST(request) {
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body'}, {status: 400})
    }

    const cleaned = sanitizeUserPayload(rawPayload)
    const errors = validateUser(cleaned)
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }

    const {user} = cleaned
    const connection = await pool.getConnection()
    try {

        const [existing] = await connection.query(
            'SELECT userID FROM Appliance.users WHERE email = ?',
            [user.email]
        )
        if (existing.length > 0) {
            return Response.json({userID: existing[0].userID}, {status: 200})
        }

        const [result] = await connection.query(
            `INSERT INTO Appliance.users(firstName, lastName, address, mobile, email, eircode)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user.firstName, user.lastName, user.address, user.mobile, user.email, user.eircode]
        )
        return Response.json({userID: result.insertId}, {status: 201})
    } catch (err) {
        return Response.json({error: err.message}, {status: 500})
    } finally {
        connection.release()
    }
}

export async function PUT(request) {
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body'}, {status: 400})
    }

    const cleaned = sanitizeUserPayload(rawPayload)
    const errors = validateUser(cleaned)
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }

    const {user} = cleaned
    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()

        const [existing] = await connection.query(
            'SELECT userID FROM Appliance.users WHERE email = ?',
            [user.email]
        )
        if (existing.length === 0) {
            return Response.json({error: 'No matching user found.'}, {status: 404})
        }

        await connection.query(
            `UPDATE Appliance.users
             SET firstName = ?,
                 lastName  = ?,
                 address   = ?,
                 mobile    = ?,
                 eircode   = ?
             WHERE userID = ?`,
            [user.firstName, user.lastName, user.address,
                user.mobile, user.eircode, existing[0].userID]
        )

        await connection.commit()
        return Response.json({message: 'User has been updated.'}, {status: 200})
    } catch (err) {
        await connection.rollback()
        return Response.json({error: err.message}, {status: 500})
    } finally {
        connection.release()
    }
}

function sanitizeUserPayload(payload) {
    const {user = {}} = payload ?? {}
    return {
        user: {
            firstName: (user.firstName ?? '').trim(),
            lastName: (user.lastName ?? '').trim(),
            address: (user.address ?? '').trim(),
            mobile: (user.mobile ?? '').replace(/[^\d+]/g, ''),
            email: (user.email ?? '').trim().toLowerCase(),
            eircode: (user.eircode ?? '').replace(/\s+/g, '').toUpperCase(),
        },
    }
}

function validateUser(payload) {
    const errors = {user: {}}
    const {user} = payload

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

    if (Object.keys(errors.user).length === 0) delete errors.user
    return errors
}