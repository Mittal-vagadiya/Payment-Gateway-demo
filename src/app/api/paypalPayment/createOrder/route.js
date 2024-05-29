import { NextResponse } from "next/server";

const { NEXT_PUBLIC_PAYPAL_PUBLISHER_KEY, NEXT_PUBLIC_PAYPAL_SECRET_KEY } = process.env;
const base = "https://api-m.sandbox.paypal.com";
const generateAccessToken = async () => {
    try {
        if (!NEXT_PUBLIC_PAYPAL_PUBLISHER_KEY || !NEXT_PUBLIC_PAYPAL_SECRET_KEY) {
            throw new Error("MISSING_API_CREDENTIALS");
        }
        const auth = Buffer.from(
            NEXT_PUBLIC_PAYPAL_PUBLISHER_KEY + ":" + NEXT_PUBLIC_PAYPAL_SECRET_KEY
        ).toString("base64");
        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
        return error;
    }
};

async function handleResponse(response) {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        // throw new Error(errorMessage);
        return errorMessage;
    }
}
const createOrder = async (amount) => {

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: amount,
                },
            },
        ],
    };


    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        method: "POST",
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

export const POST = async (request) => {
    try {
        const reqBody = await request.json();
        const { amount } = reqBody;
        const { jsonResponse, httpStatusCode } = await createOrder(amount);

        return NextResponse.json(
            {
                success: true,
                message: "Payment successful",
                clientSecret: jsonResponse
            },
            { status: httpStatusCode }
        );
    } catch (error) {
        console.log('error :>> ', error);
        let message = 'An error occurred while processing your payment.';

        if (error.type === 'StripeCardError') {
            message = error.message;
        }

        return NextResponse.json(
            {
                error: 'Error in Initiating Payment',
                success: false,
                message: message,
            },
            { status: 500 }
        );
    }
};
