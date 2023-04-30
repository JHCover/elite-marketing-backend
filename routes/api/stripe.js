import {Router} from 'express';
import config from '../../config';

const router = Router();

const stripe = require('stripe')('sk_test_51J2HviLQ2Fg1xPNtf0M2NgiMmQgzX0qfg95QNzhTPkG5sOKE45zvs8ODNisYiyHPMtzpuVaK3oggdh1bqwcOdh8a00tW1WDCgL');

const YOUR_DOMAIN = 'http://localhost:3000/account';
const {STRIPE_WEBHOOK_SECRET} = config;


router.post('/create-checkout-session', async (req, res) => {
    const priceId = req.body.priceId;
    const userId = req.body.userId;
    console.log(req.body)
    const stripeId = req.body.stripeId;
    let customer;

    // If the user has never gone to the checkout, create a customer for them on the backend and set the stripeId field
    // in the database to the customer object ID.
    if (stripeId !== null) {
        console.log(1)
        console.log(stripeId)
        customer = await stripe.customers.retrieve(stripeId);
        console.log(customer)
    } else {
        console.log(2)
        customer = await stripe.customers.create({
            metadata: {userId},
        });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
            // the actual Session ID is returned in the query parameter when your customer
            // is redirected to the success page.
            success_url: `${YOUR_DOMAIN}?success=true`,
            cancel_url: `${YOUR_DOMAIN}?canceled=true`,
            customer: customer.id,
        });

        res.json({id: session.id, customer: customer});

    } catch (e) {
        res.status(400);
        return res.send({
            error: {
                message: e.message,
            }
        });
    }
});

router.post("/webhook", async (req, res) => {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    const webhookSecret = STRIPE_WEBHOOK_SECRET

    if (webhookSecret) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers["stripe-signature"];

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                webhookSecret
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        // Extract the object from the event.
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    let customer;

    switch (eventType) {
        case 'checkout.session.completed':
            console.log('checkout.session.completed')
            console.log(data)
            customer = await stripe.customers.retrieve(data.object.customer)

            // Payment is successful and the subscription is created.
            // You should provision the subscription and save the customer ID to your database.
            break;
        case 'invoice.paid':
            console.log('invoice.paid')
            customer = await stripe.customers.retrieve(data.object.customer)
            console.log("customer")
            console.log(customer)


            // Continue to provision the subscription as payments continue to be made.
            // Store the status in your database and check when a user accesses your service.
            // This approach helps you avoid hitting rate limits.
            break;
        case 'invoice.payment_failed':
            console.log('invoice.payment_failed')
            // The payment failed or the customer does not have a valid payment method.
            // The subscription becomes past_due. Notify your customer and send them to the
            // customer portal to update their payment information.
            break;
        default:
        // Unhandled event type
    }

    res.sendStatus(200);
});

router.post('/customer-portal', async (req, res) => {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = process.env.DOMAIN;
    console.log(req)
    const customerId = req.body.stripeId;
    const portalsession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    res.send({
        url: portalsession.url,
    });
});


export default router;
