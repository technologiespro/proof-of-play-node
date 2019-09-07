const WebSocket = require('ws');
const jsonReader = require('jsonfile');
const emitter = require('./modules/emitter')
const CONFIG = jsonReader.readFileSync('./config.json')

let clients = [] // list of currently connected clients (users)
let eventsInit = false // events init state

function wsStart() {
    console.log('ws start')

    function noop() {
        // console.log('noop')
    }

    const wss = new WebSocket.Server({
        port: CONFIG.port.ws,
        perMessageDeflate: {
            zlibDeflateOptions: {
                // See zlib defaults.
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            // Other options settable:
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            // Below options specified as default values.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages
            // should not be compressed.
        }
    });

    wss.on('connection', (ws) => {
        console.log('ws connect')

        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        //connection is up, let's add a simple simple event
        ws.on('message', (message) => {

            //log the received message and send it back to the client
            // console.log('received: %s', message);

            let msg = JSON.parse(message)

        });

        //send immediatly a feedback to the incoming connection
        ws.send(JSON.stringify({
            "welcome": "SMARTHOLDEM"
        }));


        if (!eventsInit) {

            emitter.eventBus.on('block:new', function (data) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data))
                    }
                });
            })

            eventsInit = true

        }
    })


    /*
    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping(noop);
        });
    }, 30000);
    */

    // interval

    // user disconnected
    wss.on('close', function (connection) {

    });
}

exports.start = wsStart()