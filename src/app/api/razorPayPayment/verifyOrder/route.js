

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from 'crypto';

const { NEXT_PUBLIC_RAZORPAY_PUBLISHER_KEY, NEXT_PUBLIC_RAZORPAY_SECRET_KEY } = process.env;

let instance = new Razorpay({
    key_id: NEXT_PUBLIC_RAZORPAY_PUBLISHER_KEY,
    key_secret: NEXT_PUBLIC_RAZORPAY_SECRET_KEY,
});

export const POST = async (request) => {
    const reqBody = await request.json();
    const {
        razorpayOrderId,
        razorpaySignature,
        razorpayPaymentId
    } = reqBody;
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    try {
        const expectedSignature = crypto
            .createHmac("sha256", NEXT_PUBLIC_RAZORPAY_SECRET_KEY)
            .update(body.toString())
            .digest("hex");
        const isAuthentic = expectedSignature === razorpaySignature;
        if (!isAuthentic) {
            return NextResponse.json({ message: "invalid payment signature", success: false }, { status: 400 });
        }
        return NextResponse.json({ message: "Payment successful", success: true }, { status: 200 });

    } catch (err) {
        return NextResponse.json(
            {
                error: err,
                message: 'Error in Initiating Payment',
                success: false,
            },
            { status: 500 }
        );
    }
};
