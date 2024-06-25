const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const clientId = '1233815762938888272'; // Replace with your Discord application client ID
const clientSecret = 'idAsZDogMhfo5dpV6EuVJkyjerge0PLA'; // Replace with your Discord application client secret
const redirectUri = 'https://get-pissed.lol/'; // Replace with your redirect URI

app.get('/oauth2/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios.post('https://discord.com/api/oauth2/token', null, {
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = response.data.access_token;

        // Use the access token to get user information
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(userResponse.data);
    } catch (error) {
        console.error('Error exchanging code for access token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
