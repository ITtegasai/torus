export const Registration = async (props) => {
    try {
        const request = await fetch(import.meta.env.VITE_AUTH_ROUTE_URI + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "*/*"
            },
            body: JSON.stringify({
                key: import.meta.env.KEY,
                username: props.username,
                password: props.password,
                email: props.email
            })
        })

        return await request.json()
    } catch (error) {
        console.log("Error during Registration: ", error)
        return null
    }
}

export const CreateToken = async (props) => {
    try {
        const request = await fetch(import.meta.env.VITE_AUTH_ROUTE_URI + '/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "*/*"
            },
            body: JSON.stringify({
                key: import.meta.env.KEY,
                username: props.username,
                password: props.password,
                email: props.email
            })
        })

        return await request.json()
    } catch (error) {
        console.log("Error during Registration: ", error)
        return null
    }
}

export const GetToken = async (props) => {
    try {
        const request = await fetch(import.meta.env.VITE_AUTH_ROUTE_URI + '/gettoken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "*/*"
            },
            body: JSON.stringify({
                key: import.meta.env.KEY,
                access_token: props.access_token
            })
        })

        return await request.json()
    } catch (error) {
        console.log("Error during Registration: ", error)
        return null
    }
}