const { EventHubProducerClient } = require("@azure/event-hubs");
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPES = process.env.SCOPES;
const PROJECT_ID = process.env.PROJECT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const PORT = process.env.PORT;

app.get('/getaccesstoken', (req, res) => {

    // Step 1 -- Obtain access code from Google by redirecting to the authorization URL
    const authorizationUrl = `https://nestservices.google.com/partnerconnections/${PROJECT_ID}/auth?redirect_uri=${REDIRECT_URI}&access_type=offline&prompt=consent&client_id=${CLIENT_ID}&response_type=code&scope=${SCOPES}`;
    res.redirect(authorizationUrl);
});

app.get('/oauth2callback', async (req, res) => {
    const authorizationCode = req.query.code;

    // Step 2 -- Exchange authorization code for access and refresh tokens
    const fetchAccessToken = async () => {
        const url = 'https://oauth2.googleapis.com/token';

        const params = new URLSearchParams({
            code: authorizationCode,        // Use the authorization code from Google
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        try {
            const response = await axios.post(url, new URLSearchParams(params), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.status!=200) throw new Error(`${response.status} error, Request failed!`);
            
            access_token = response.data.access_token;
            refresh_token = response.data.refresh_token;
            keys = {
                "refresh_token":refresh_token,
                "access_token":access_token
            }
            sendKeys(keys);
            res.send("keys sent");

        } catch (error) {
            console.error('Error fetching access token:', error);
            res.send(`Error when fetching access token. Check console for details.`);
        }
    };

    await fetchAccessToken();
});

// LOGIC TO SEND EVENTS TO DOORBELL EVENT TO HUB
function sendKeys(keys){
    console.log(keys);
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});