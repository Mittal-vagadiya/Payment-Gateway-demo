import { NextResponse } from "next/server";
import stripe from 'stripe';

const stripeInstance = stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export const POST = async (request) => {

    try {
        // await connectToDB();
        const reqBody = await request.json();
        let { amount } = reqBody;

        if (!amount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please Fill Amount",
                },
                { status: 500 })
        }
        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: amount, // amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        if (paymentIntent) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Payment successful",
                    clientSecret: paymentIntent.client_secret
                },
                { status: 200 }
            );

        } else {
            return NextResponse.json(
                {
                    success: true,
                    message: "Something Went Wrong"
                },
                { status: 400 }
            );
        }

    } catch (error) {
        let message = 'An error occurred while processing your payment.';

        if (error.type === 'StripeCardError') {
            message = error.message;
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
