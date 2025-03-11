const { uptime } = require("process");

require("dotenv").config();

const m = require('masto');

const stations = {
    'Frankfurt': '8000105',
    'Munich': '8000261',
    'Cologne': '8000207',
    'Hamburg': '8002549',
    'Berlin': '8011113',
    'Stuttgart': '8000096',
    'Hanover': '8000152',
};

const stationNames = [
    'Frankfurt',
    'Munich',
    'Cologne',
    'Hamburg',
    'Berlin',
    'Stuttgart',
    'Hanover'
];

const stationIds = [
    8000261,
    8000105,
    8000207,
    8002549,
    8011113,
    8000096,
    8000152
];


let departureArray = [];
let departureCount = 0;
let delayCount = 0;


const masto = m.createRestAPIClient({
    url: "https://networked-media.itp.io/",
    accessToken: process.env.TOKEN,
})

async function makeStatus(text) {
    console.log(`Status text: ${text}`)
    // const status = await masto.v1.statuses.create({
    //     status: text,
    //     visibility: "public" //if you wanted to make this private you could change this to private for testing
    // });

    // console.log(status.url);
}

// makeStatus();

setInterval(() => {

    async function fetchDepartures(x, y, duration) {
        if (stationIds[x] !== stationIds[y]) {
            let url = "https://v6.db.transport.rest/stops/" + stationIds[x] + "/departures?direction=" + stationIds[y] + "&duration="+ duration;

           return await fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.departures && Array.isArray(data.departures)) {
                        departureCount += 1;
                        data.departures.forEach(departure => {
                            if (departure.delay > 300) {
                                delayCount += 1;
                                 let departureInfo = [];
                                departureInfo.push(stationNames[x]);
                                departureInfo.push(stationNames[y]);
                                departureInfo.push(departure.direction);
                                departureInfo.push(departure.line.name);
                                departureInfo.push(new Date(departure.when).toTimeString());
                                departureInfo.push(new Date(departure.plannedWhen).toTimeString());
                                departureInfo.push(departure.delay / 60);
                                departureArray.push(departureInfo);
                            }
                        });
                    } else {
                        console.log('No departures data found.');
                       
                    }
                })
            .catch(error => console.error('Error fetching departures:', error));
        }
    }

    let duration = 120; //Number of minutes it is indexing for
    async function handleStationPairs() {
        for (let x = 0; x < stationIds.length; x++) {
            for (let y = 0; y < stationIds.length; y++) {
                await fetchDepartures(x, y, duration);
            }
        }
    }

    // Call the function and then print the most delayed train
    handleStationPairs().then(() => {
        if (departureArray.length > 0) {
            departureArray.sort((a, b) => b[6] - a[6]);
            let message = (
                'Most delayed Deutsche Bahn train:\n' +
                'Station: ' + departureArray[0][1] + '\n' +
                'Direction: ' + departureArray[0][2] + '\n' +
                'Line: ' + departureArray[0][3] + '\n' +
                'Delay: ' + departureArray[0][6] + ' minutes\n' +
                '----------------------------------------\n' +
                // 'Departure Count: ' + departureCount + '\n' +
                // 'Delay Count: ' + delayCount + '\n' +
                'Percentage of Indexed Trains Experiencing Delays: ~' + Math.floor((delayCount / departureCount) * 100) + '%'
            );
            console.log(`message: ${message}`);
            makeStatus(message);


        } else {
            console.error('No delayed trains found.');
        }
    }).catch(error => console.error('Error handling station pairs:', error));

},1800000 )
// }, 1000)

// 1800000

