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
        console.log('data :>> ', data);
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
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
        throw new Error(errorMessage);
    }
}

const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return handleResponse(response);
};

export const POST = async (request, route) => {
    try {
        console.log('request :>> ', request);
        const { orderID } = route.params;
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

        return NextResponse.json(
            {
                success: true,
                message: "Payment successful",
                clientSecret: jsonResponse
            },
            { status: httpStatusCode }
        );
    } catch (error) {
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
