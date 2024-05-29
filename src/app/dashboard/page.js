'use client'

import { useEffect, useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";
import { Elements } from '@stripe/react-stripe-js';
import { toast } from "react-toastify";
import CheckoutForm from "./CheckoutForm/checkoutForm";
import { useRouter } from "next/navigation";
import { FUNDING, PayPalButtons } from "@paypal/react-paypal-js";
import Script from "next/script";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY);

export function page() {

    const [clientSecret, setClientSecret] = useState();
    const [amount, setAmount] = useState();
    const [isStripe, setIsStripe] = useState(false)

    const router = useRouter()


    const options = {
        clientSecret: clientSecret,
        appearance: {
            theme: 'stripe'
        }
    }

    const handleStripePayment = async () => {
        setIsStripe(true)
        const data = {
            amount: parseFloat(amount) * 100, // Convert amount to cents
        };

        axios.post('http://localhost:3000/api/stripePayment', data)
            .then(res => {
                setClientSecret(res.data.clientSecret);
            })
            .catch((error) => {
                console.log('error :>> ', error);
                toast.error('Error making Stripe payment');
                setClientSecret('')
                console.error('Error making Stripe payment:', error);
            });
    };

    // Function to handle Authorize.NET payment
    const handleAuthorizeNetPayment = () => {
        // Implement Authorize.NET payment logic here
        toast.error("Authorize.NET payment functionality not implemented yet");
    };

    // Function to handle RazorPay payment
    const handleRazorPayPayment = () => {
        // Implement RazorPay payment logic here
        toast.error("RazorPay payment functionality not implemented yet");
    };

    const handleChange = (e) => {
        setAmount(e.target.value);
        localStorage.setItem("Amount", e.target.value)
    }

    const paymentIntent = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    useEffect(() => {
        if (paymentIntent) {
            setClientSecret('');
            setIsStripe(false)
            router.push("/dashboard")
            toast.success("Payment is successfull")
        }
    }, [paymentIntent]);

    const createOrder = async () => {
        const amount = localStorage.getItem("Amount")
        console.log('amount :>> ', amount);

        try {
            if (!amount) {
                console.error('Amount is undefined');
                toast.error('Amount is undefined');
                return;
            }
            let data = { amount: parseFloat(amount) }
            const response = await fetch("http://localhost:3000/api/paypalPayment/createOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const orderData = await response.json();

            if (orderData.clientSecret.id) {
                return orderData.clientSecret.id;
            } else {
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                toast.error(errorMessage)
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not initiate PayPal Checkout')
        }
    }
    const onApprove = async (data, actions) => {
        try {
            const response = await fetch(`http://localhost:3000/api/paypalPayment/captureOrder/${data.orderID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const orderData = await response.json();
            // const errorDetail = orderData?.details?.[0];
            if (orderData.success) {
                toast.success("Payment is successfull")
                setAmount("")

            } else {
                toast.error("Something Went Wrong")
                setAmount("")
            }
            // if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
            //     return actions.restart();
            // } else if (errorDetail) {
            //     throw new Error(
            //         `${errorDetail.description} (${orderData.debug_id})`
            //     );
            // } else {
            //     console.log(
            //         "Capture result",
            //         orderData,
            //         JSON.stringify(orderData, null, 2)
            //     );
            // }
        }
        catch (error) {
            console.error(error);
            setAmount("")
            toast.error('Could not initiate PayPal Checkout')
        }
    }


    const razorPayCreateOrder = async () => {

        try {
            const response = await fetch('http://localhost:3000/api/razorPayPayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount) * 100,
                })
            });


            const data = await response.data;
            debugger
            return data.id;
        } catch (error) {
            console.error('There was a problem with your fetch operation:', error);
        }
    };

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <div class="min-h-screen flex items-center justify-center">
                <div class="max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">

                    {clientSecret && (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    )}
                    {
                        isStripe ?
                            "" : <div>
                                <h1 class="text-2xl font-semibold text-center text-gray-500 mt-8 mb-6">Initiate Payment</h1>
                                <div class="mb-6">
                                    <label for="email" className="block mb-2 text-sm text-gray-600">Amount</label>
                                    <input type="number" name="amount" value={amount} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <p className="text-sm text-gray-600 mt-8">Choose a Operator</p>
                                <div className="">
                                    <div className="hidden">
                                    </div>
                                    <button type="button" onClick={handleStripePayment} className="w-full bg-gradient-to-r from-[#0570de] to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4">Stripe</button>
                                    <PayPalButtons createOrder={createOrder}
                                        fundingSource={FUNDING.PAYPAL}
                                        className="rounded-lg"
                                        onApprove={(data, actions) => onApprove(data, actions)}
                                    />
                                    <button type="button" onClick={handleAuthorizeNetPayment} className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4">Authorize.NET</button>
                                    <button type="button" onClick={razorPayCreateOrder} className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4">RazorPay</button>
                                </div>
                            </div>

                    }
                </div>
            </div>
        </>
    );
};


export default page;