const express = require('express');
const cors = require('cors');
require("dotenv").config();


// Bkash SDK.
const sdk = require('api')('@bkash/v1.2.0-beta#1mld74kq6voepb');


// Ports
const port = process.env.PORT || 5000;
const app = express();


// Middleware.
app.use(cors({
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json({ limit: '50mb' }));


// Get Data Form .env File.
const CALLBACK_URL = process.env.BKASH_CALLBACK_URL;
const USERNAME = process.env.BKASH_USERNAME;
const PASSWORD = process.env.BKASH_PASSWORD;
const APP_KEY = process.env.BKASH_APP_KEY;
const APP_SECRET = process.env.BKASH_APP_SECRET;



// Server Code.
async function run() {
    try {
        // await client.connect();

        // Get Bkash Grand Token.
        app.get("/cart/checkout/payment/bkashToken", async (req, res) => {
            sdk.getTokenUsingPOST({
                app_key: APP_KEY,
                app_secret: APP_SECRET
            }, {
                username: USERNAME,
                password: PASSWORD
            })
                .then(data => {
                    // console.log(data);
                    res.json(data);
                })
                .catch(err => {
                    res.json(err);
                });
        });


        // Create Bkash Payment.
        app.get("/cart/checkout/payment/createBkashPayment", async (req, res) => {
            const query = req.query.Id_Token;
            const id_token = JSON.parse(query);
            // console.log('Grand Token from fontend', (id_token));
            sdk.auth({
                'Content-Type': "application/json",
                'Accept': "application/json",
                'Authorization': id_token,
                'X-App-Key': APP_KEY
            });
            sdk.postTokenizedCheckoutCreate({
                mode: '0011',
                payerReference: '1',
                callbackURL: '/',
                agreementID: 'test',
                amount: '100',
                currency: 'BDT',
                intent: 'sale',
                merchantInvoiceNumber: '2005'
            }, {
                'x-app-key': APP_KEY
            })
                .then(data => {
                    console.log(data);
                    res.json(data);
                })
                .catch(err => {
                    console.error(err);
                    res.json(err);
                });
        });


        // Execute Bkash Payment.
        app.get("/executeBkashPayment", async (req, res) => {
            const token = req.cookies.token;
            const payment = req.cookies.payment;

            const executePaymentResponse = await fetch(
                `https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/payment/execute/${payment.paymentID}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        authorization: token.id_token,
                        "x-app-key": process.env.KEY,
                    },
                }
            );
            // const executePaymentResult = await executePaymentResponse.json();

            // res.send(executePaymentResult);
        });
    }
    finally {
        // await client.close();
    }
};
run().catch(console.dir);



// Default Get.
app.get('/', (req, res) => {
    res.send('Running MF_House_Server');
});


// Listening Port.
app.listen(port, () => {
    console.log('server running on port:', port);
});