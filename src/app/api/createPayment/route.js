import { NextResponse } from "next/server";
const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export const POST = async (request) => {
    try {
        // await connectToDB();
        const reqBody = await request.json();
        let { amount } = reqBody;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });


        return NextResponse.json(
            {
                success: true,
                message: "Payment successful",
                clientSecret: paymentIntent.client_secret
            },
            { status: 200 }
        );
    } catch (error) {
        console.log('error :>> ', error);
        let message = 'An error occurred while processing your payment.';

        if (error.type === 'StripeCardError') {
            message = err.message;
        }

        return NextResponse.json(
            {
                error: error.message,
                success: false,
                message: "Payment failed",
            },
            { status: 500 }
        );
    }
};
