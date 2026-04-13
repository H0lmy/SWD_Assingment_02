import pool from '../../library/db.js'
// post method for user data
export async function POST(request) {
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body'}, {status: 400})
    }
    // sanitised and validated input
    const cleaned = sanitizeUserPayload(rawPayload)
    const errors = validateUser(cleaned)
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }

    const {user} = cleaned
    const connection = await pool.getConnection()
    try {
        // check if user wiht same email is in teh db
        const [existing] = await connection.query(
            'SELECT userID FROM Appliance.users WHERE email = ?',
            [user.email]
        )
        if (existing.length > 0) {
            return Response.json({userID: existing[0].userID}, {status: 200})
        }
        // post query
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
// get request by email
export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const email = (searchParams.get('email') ?? '').trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json({error: 'Please enter a valid email.'}, {status: 400})
    }

    const connection = await pool.getConnection()
    try {
        //query itself
        const [rows] = await connection.query(
            `SELECT firstName, lastName, address, mobile, email, eircode
             FROM Appliance.users
             WHERE email = ?`,
            [email]
        )
        // no user if found- retrieve 404
        if (rows.length === 0) {
            return Response.json({error: 'No matching user found.'}, {status: 404})
        }
        // return user data
        return Response.json(rows[0], {status: 200})
    } catch (err) {
        return Response.json({error: err.message}, {status: 500})
    } finally {
        //close connection
        connection.release()
    }
}
// put method ehich is used to update the user data
export async function PUT(request) {
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body'}, {status: 400})
    }
    // sanitised and validated input
    const cleaned = sanitizeUserPayload(rawPayload)
    const errors = validateUser(cleaned)
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }

    const {user} = cleaned
    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()
        // check for existence of the user of particular email in the db
        const [existing] = await connection.query(
            'SELECT userID FROM Appliance.users WHERE email = ?',
            [user.email]
        )
        if (existing.length === 0) {
            return Response.json({error: 'No matching user found.'}, {status: 404})
        }
        // query itself
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
// sanitisation of each parameter of the user object
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
// validation for each para,eter of user data
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