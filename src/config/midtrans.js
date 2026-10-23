const midtransClient = require('midtrans-client');
require('dotenv').config();

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: serverKey,
    clientKey: clientKey
});

const coreApi = new midtransClient.CoreApi({
    isProduction: isProduction,
    serverKey: serverKey,
    clientKey: clientKey
});

// Provide both default and named exports for backward compatibility
snap.snap = snap;
snap.coreApi = coreApi;

module.exports = snap;