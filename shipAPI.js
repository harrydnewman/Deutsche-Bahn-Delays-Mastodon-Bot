const fetch = require('node-fetch');
const m = require('masto');
require("dotenv").config();

// Initialize Mastodon API client
const masto = m.createRestAPIClient({
    url: "https://networked-media.itp.io/",
    accessToken: process.env.TOKEN,
})

// Example function to post status
async function makeStatus(text) {
    const status = await masto.v1.statuses.create({
        status: text,
        visibility: "private"
    });

    console.log(status.url);
}

// Example function to fetch data from an API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// Example usage of fetchData function
const apiUrl = "https://api-sandbox.apmterminals.com/all-vessel-schedules";
fetchData(apiUrl)
    .then(data => {
        if (data) {
            console.log("Data fetched successfully:", data);
        } else {
            console.log("No data fetched.");
        }
    });

// Example usage of makeStatus function
// makeStatus("Hello, world!");
