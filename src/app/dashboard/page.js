'use client'

import { useEffect, useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";
import { Elements } from '@stripe/react-stripe-js';
import { toast } from "react-toastify";
import CheckoutForm from "./CheckoutForm/checkoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY);

export function page() {

    const [clientSecret, setClientSecret] = useState();
    const [amount, setAmount] = useState();
    const [selectedType, setSelectedType] = useState();


    const options = {
        clientSecret: clientSecret,
        appearance: {
            theme: 'stripe'
        }
    }

    const handleStripePayment = async () => {
        setSelectedType("stripe")
        const data = {
            amount: parseFloat(amount) * 100, // Convert amount to cents
        };

        axios.post('http://localhost:3000/api/createPayment', data)
            .then(res => {
                toast.success("Stripe payment successful");
                console.log('Stripe payment successful:', res.data);
                setClientSecret(res.data.clientSecret);
            })
            .catch(error => {
                toast.error('Error making Stripe payment');
                console.error('Error making Stripe payment:', error);
            });
    };

    // Function to handle PayPal payment
    const handlePayPalPayment = () => {
        // Implement PayPal payment logic here
        toast.error("PayPal payment functionality not implemented yet");
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
    }

    const paymentIntent = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    useEffect(() => {
        if (paymentIntent) {
            setClientSecret(paymentIntent);
        }
    }, [paymentIntent]);
    return (
        <>
            <div class="min-h-screen flex items-center justify-center">
                <div class="max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
                    {clientSecret && selectedType === "stripe" && (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    )}
                    {!clientSecret &&
                        <>
                            <h1 class="text-2xl font-semibold text-center text-gray-500 mt-8 mb-6">Initiate Payment</h1>
                            <form>
                                <div class="mb-6">
                                    <label for="email" className="block mb-2 text-sm text-gray-600">Amount</label>
                                    <input type="number" name="amount" value={amount} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                                </div>
                                <p className="text-sm text-gray-600 mt-8">Choose a Operator</p>
                                <div className="flex gap-3">
                                    <div className="hidden">
                                    </div>
                                    <button type="button" onClick={handleStripePayment} className="w-32 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4">Stripe</button>
                                    <button type="button" onClick={handlePayPalPayment} className="w-32 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4">PayPal</button>
                                    <button type="button" onClick={handleAuthorizeNetPayment} className="w-32 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4">Authorize.NET</button>
                                    <button type="button" onClick={handleRazorPayPayment} className="w-32 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg mx-auto block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mt-4 mb-4">RazorPay</button>
                                </div>
                            </form>
                        </>
                    }
                </div>
            </div>
        </>
    );
};


export default page;