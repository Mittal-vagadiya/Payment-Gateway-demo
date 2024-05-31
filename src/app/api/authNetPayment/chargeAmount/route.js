import { NextResponse } from "next/server";
import { APIContracts, APIControllers, Constants as SDKConstants } from 'authorizenet';

function generateInvoice() {
    // Generate a random amount for transaction
    return 'INV-' + Date.now();
}


export const POST = async (req, res) => {
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.NEXT_PUBLIC_API_AUTHORISE_NET_LOGIN_ID);
    merchantAuthenticationType.setTransactionKey(process.env.NEXT_PUBLIC_API_AUTHORISE_NET_TRASACTION_KEY);


    try {
        const reqBody = await req.json();
        const { price, opaqueDataForm, encryptedCardData, customerInformation } = reqBody;
        const invoiceNumber = generateInvoice();

        var opaqueData = new APIContracts.OpaqueDataType();
        opaqueData.setDataDescriptor(opaqueDataForm.dataDescriptor);
        opaqueData.setDataValue(opaqueDataForm.dataValue);


        var paymentType = new APIContracts.PaymentType();
        paymentType.setOpaqueData(opaqueData);

        var orderDetails = new APIContracts.OrderType();
        orderDetails.setInvoiceNumber(invoiceNumber);
        orderDetails.setDescription('Product Description');

        var tax = new APIContracts.ExtendedAmountType();
        tax.setAmount('4.26');
        tax.setName('level2 tax name');
        tax.setDescription('level2 tax');

        var duty = new APIContracts.ExtendedAmountType();
        duty.setAmount('8.55');
        duty.setName('duty name');
        duty.setDescription('duty description');

        var shipping = new APIContracts.ExtendedAmountType();
        shipping.setAmount('8.55');
        shipping.setName('shipping name');
        shipping.setDescription('shipping description');


        var billTo = new APIContracts.CustomerAddressType();
        billTo.setFirstName(customerInformation.firstName);
        billTo.setLastName(customerInformation.lastName);
        billTo.setAddress('14 Main Street');
        billTo.setCity('Pecan Springs');
        billTo.setState('TX');
        billTo.setZip('44628');
        billTo.setCountry('USA');

        var shipTo = new APIContracts.CustomerAddressType();
        shipTo.setFirstName('China');
        shipTo.setLastName('Bayles');
        shipTo.setCompany('Thyme for Tea');
        shipTo.setAddress('12 Main Street');
        shipTo.setCity('Pecan Springs');
        shipTo.setState('TX');
        shipTo.setZip('44628');
        shipTo.setCountry('USA');

        var transactionRequestType = new APIContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(price);
        transactionRequestType.setOrder(orderDetails);
        transactionRequestType.setTax(tax);
        transactionRequestType.setDuty(duty);
        transactionRequestType.setShipping(shipping);
        transactionRequestType.setBillTo(billTo);
        transactionRequestType.setShipTo(shipTo);

        var createRequest = new APIContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        console.log(JSON.stringify(createRequest.getJSON(), null, 2));

        var ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

        const chargeAmountPromise = new Promise((resolve, reject) => {
            ctrl.execute(function () {
                let apiResponse = ctrl.getResponse();
                let response = new APIContracts.CreateTransactionResponse(apiResponse);


                //pretty print response
                console.log(JSON.stringify(response, null, 2));

                if (response != null) {
                    if (response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
                        if (response.getTransactionResponse().getMessages() != null) {
                            console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
                            console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
                            console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
                            console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
                        }
                        else {
                            console.log('Failed Transaction.');
                            if (response.getTransactionResponse().getErrors() != null) {
                                console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                                console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                            }
                        }
                    }
                    else {
                        console.log('Failed Transaction. ');
                        if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

                            console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                            console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                        }
                        else {
                            console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
                            console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
                        }
                    }
                }
                else {
                    console.log('Null Response.');
                }

            });
        });
        try {
            const response = await chargeAmountPromise;
            return NextResponse.json(
                {
                    success: true,
                    message: "Payment successful",
                    data: response
                },
                { status: 200 })
        } catch (error) {
            console.log('error :>> ', error);
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment failed",
                    error: error.errormessage
                },
                { status: error.statusCode || 500 })
        }
    } catch (error) {
        console.log('error------ :>> ', error);
        return NextResponse.json(
            {
                success: false,
                message: "An error occurred while processing your payment",
                error: error.message
            },
            { status: 500 })
    }
}
