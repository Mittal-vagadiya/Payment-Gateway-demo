

import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const { NEXT_PUBLIC_RAZORPAY_PUBLISHER_KEY, NEXT_PUBLIC_RAZORPAY_SECRET_KEY } = process.env;

let instance = new Razorpay({
    key_id: NEXT_PUBLIC_RAZORPAY_PUBLISHER_KEY,
    key_secret: NEXT_PUBLIC_RAZORPAY_SECRET_KEY,
});

const razorApi = 'https://api.razorpay.com/v1'

export const POST = async (request) => {
    // https://api.razorpay.com/v1/orders
    const reqBody = await request.json();
    const { amount } = reqBody;

    const options = {
        amount: amount,
        currency: 'INR',
        receipt: "any unique id for every order",
        payment_capture: 1
    };

    try {
        // Create order and send details to frontend
        const response = await instance.orders.create(options)

        console.log('response :>> ', response);

        return NextResponse.json(
            {
                success: true,
                message: "Payment successful",
                data: response
            },
            { status: 200 })


    } catch (err) {
        // Handle order creation failure
        console.log('err :>> ', err);
        return NextResponse.json(
            {
                error: 'Error in Initiating Payment',
                success: false,
                // message: err.error.description,
            },
            { status: 500 }
        );
    }
};
