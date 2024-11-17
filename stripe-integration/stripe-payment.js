document.addEventListener('DOMContentLoaded', function () {
    const stripe = Stripe('pk_test_51Q7i5JIzczgg3ibGb6QdyYhCA64fMBya6fI1b1Lx4b3sjRGNZ16WiRalqFv6tlscBHFNzJZsFb8M7vq9rCtvYBG500TBh9RGvS');
    const paymentForm = document.getElementById('payment-form');
    const amountButtons = document.querySelectorAll('.amount-button');
    const customAmountInput = document.getElementById('custom-amount-input');
    const customAmountField = document.getElementById('custom-amount');
    const otherAmountButton = document.querySelector('button[data-amount="custom"]');

    const emailInput = document.getElementById('email-input');  // Hidden input for email
    const loadingMessage = document.getElementById('loading-message');
    //const submitButton = document.getElementById('submit');
    const paymentMessage = document.getElementById('payment-message');

    const chargeDetails = document.getElementById('charge-details');
    const chargeAmount = document.getElementById('charge-amount');
    const chargeDate = document.getElementById('charge-date');

    let linkAuthenticationElement;  // Declare linkauth globally
    let paymentElement;  // Declare payment element globally
    let elements; // Declare element globally
    let current_email = '';
    paymentForm.style.display = 'none';  // Initially hide the form

    let selectedAmount = 5;
    let coverFees = false;
    
    /////////
    amountButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Highlight selected button
            amountButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');

            // Handle "Other" selection
            if (button.getAttribute('data-amount') === 'custom') {
                customAmountInput.style.display = 'block';
                customAmountField.required = true;
            } else {
                customAmountInput.style.display = 'none';
                customAmountField.required = false;
                selectedAmount = parseFloat(button.getAttribute('data-amount'));
                //paymentForm.style.display = 'none';  // Initially hide the form
                updateChargeDetails();
                updatePaymentIntent();
            }
        });
    });

    // Event listener for custom amount input (when the user leaves the input box)
    customAmountField.addEventListener('blur', () => {
        selectedAmount = parseFloat(customAmountField.value) || 5;
        
        // Update the 'Other' button text with the custom amount
        otherAmountButton.textContent = `$${selectedAmount.toFixed(2)} (Other)`;
        
        // Make sure the custom amount is valid
        if (selectedAmount >= 5) {
            updateChargeDetails();
            updatePaymentIntent(); // Update PaymentIntent with new custom amount
        }
    });

    // customAmountField.addEventListener('input', () => {
    //     selectedAmount = parseFloat(customAmountField.value) || 5;
    //     if (selectedAmount >= 5) {
    //         updateChargeDetails();
    //         updatePaymentIntent(); // Update PaymentIntent with new custom amount
    //     }
    // });

    // Handle processing fee selection
    const coverFeesRadio = document.querySelectorAll('input[name="cover_fees"]');
    coverFeesRadio.forEach((radio) => {
        radio.addEventListener('change', () => {
            coverFees = document.querySelector('input[name="cover_fees"]:checked').value === 'yes';
            //paymentForm.style.display = 'none';  // Initially hide the form
            updateChargeDetails();
            updatePaymentIntent();
        });
    });
    ////////////////

    const appearance = {
        theme: 'flat',
        variables: { colorPrimaryText: '#262626' }
      };
    const options = { /* options */ };

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);  // Basic email validation
    }

    function updateChargeDetails() {
        const chargeAmountElement = document.getElementById('chargeamount');
        const chargeFeeElement = document.getElementById('chargefee');
        const chargeDateElement = document.getElementById('chargedate');

        // Calculate the amount with fees if necessary
        let finalAmount = selectedAmount;
        if (coverFees) {
            finalAmount += finalAmount * 0.03;  // 3% fee
        }

        // Set the content for the charge details
        chargeAmountElement.textContent = `Amount: $${finalAmount.toFixed(2)}`;
        chargeFeeElement.textContent = coverFees ? 'Fee: 3%' : 'Fee: $0';
        chargeDateElement.textContent = `Charge Date: ${new Date().toLocaleDateString()}`;
    }

    async function updatePaymentIntent() {
        //const response = await fetch(stripeParams.ajaxurl + '?action=create_payment_intent');
        console.log("Selected amount:", selectedAmount);  // Check if the value is correct
        if (isNaN(selectedAmount) || selectedAmount < 5) {
            console.error('Invalid amount:', selectedAmount);
            return;
        }

        const response = await fetch(stripeParams.ajaxurl + '?action=create_payment_intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: selectedAmount,
                cover_fees: coverFees,
            })
        });

        const result = await response.json();
        const loader = 'auto';                    

        try {
            if (result.success) {
                const clientSecret = result.data.clientSecret;

                // Recreate the payment element with the new client secret
                elements = stripe.elements({clientSecret, loader, appearance});
                linkAuthenticationElement = elements.create("linkAuthentication");
                paymentElement = elements.create('payment', options, { clientSecret,
                    defaultValues: {
                        billingDetails: {
                        name: 'John Doe',
                        phone: '888-888-8888',
                        address: {
                            postal_code: '10001',
                            country: 'US',
                        },
                        },
                    },
                });
                paymentElement.mount('#payment-element');
                linkAuthenticationElement.mount("#link-authentication-element");

                // Define the readiness promises
                const linkReady = new Promise((resolve) => {
                    linkAuthenticationElement.on('ready', () => {
                        console.log('Link Authentication Element is ready');
                        resolve();
                    });
                });

                const paymentReady = new Promise((resolve) => {
                    paymentElement.on('ready', () => {
                        console.log('Payment Element is ready');
                        resolve();
                    });
                });
                await Promise.all([linkReady, paymentReady]);

                // Both elements are ready now
                console.log('Both elements are ready');
                loadingMessage.style.display = 'none';
                paymentForm.style.display = 'block';  // Show the form
                paymentForm.classList.remove('hidden');

            } else {
                document.getElementById('payment-message').textContent = result.data.error;
            }
        } catch (error) {
            document.getElementById('payment-message').textContent = `Error: ${error.message}`;
        }
    }

    async function initializeStripe()
    {
        // let response;
        // if (selectedAmount == 0)
        // {
        //     response = await fetch(stripeParams.ajaxurl + '?action=get_secret');
        // }
        // else
        // {
        //     response = await fetch(stripeParams.ajaxurl + '?action=create_payment_intent', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             amount: selectedAmount,
        //             cover_fees: coverFees,
        //         })
        //     });
        // }
        // const response = await fetch(stripeParams.ajaxurl + '?action=create_payment_intent');


        // const response = await fetch(stripeParams.ajaxurl + '?action=create_payment_intent', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         amount: selectedAmount,
        //         cover_fees: coverFees,
        //     })
        // });
        // const result = await response.json();
        // //console.log("AJAX Response:", result); // Debug the full response
        // console.log('Received response from server:', result);  // Log the response

        // if (result.success) {

        //     const clientSecret = result.data.clientSecret;
        //     const loader = 'auto';                    

        //     elements = stripe.elements({clientSecret, loader, appearance});
        //     linkAuthenticationElement = elements.create("linkAuthentication");
        //     paymentElement = elements.create('payment', options, { clientSecret,
        //         defaultValues: {
        //             billingDetails: {
        //             name: 'John Doe',
        //             phone: '888-888-8888',
        //             address: {
        //                 postal_code: '10001',
        //                 country: 'US',
        //             },
        //             },
        //         },
        //     });
        //     paymentElement.mount('#payment-element');
        //     linkAuthenticationElement.mount("#link-authentication-element");

        //     // Define the readiness promises
        //     const linkReady = new Promise((resolve) => {
        //         linkAuthenticationElement.on('ready', () => {
        //             console.log('Link Authentication Element is ready');
        //             resolve();
        //         });
        //     });

        //     const paymentReady = new Promise((resolve) => {
        //         paymentElement.on('ready', () => {
        //             console.log('Payment Element is ready');
        //             resolve();
        //         });
        //     });
        //     await Promise.all([linkReady, paymentReady]);

        //     // Both elements are ready now
        //     console.log('Both elements are ready');
        //     loadingMessage.style.display = 'none';
        //     paymentForm.style.display = 'block';  // Show the form
        //     paymentForm.classList.remove('hidden');
        //}
        updatePaymentIntent();
    }
        initializeStripe();


        
    // Listen for form submission
    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        
        //submitButton.disabled = true;
        paymentMessage.textContent = '';
        //loadingMessage.style.display = 'block';
        //paymentForm.style.display = 'block';  // Show the form

        try {

            linkAuthenticationElement.on('change', (event) => {
                const email = event.value.email;
                console.log("Captured email:", email);  // Log the email to verify it's captured

                if (!email || !validateEmail(email)) {
                    paymentMessage.textContent = "Please enter a valid email address.";
                    // submitButton.disabled = false;
                    loadingMessage.style.display = 'none';
                    return;
                }

                current_email = email;
                if (emailInput) {
                    emailInput.value = email;  // Store the email in the hidden input field
                }                    
            });

            console.log('Email being passed to Stripe:', current_email);

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: 'https://www.foesoftheclearwater.com',
                    receipt_email: current_email,
                    // return_url: 'https://www.foesoftheclearwater.com/payment-success',

                },
            });

            if (error) {
                console.error('Payment failed:', error.message);
                document.getElementById('payment-message').textContent = error.message;
            } else {
                document.getElementById('payment-message').textContent = 'Payment successful!';
            }
        } catch (error) {
            console.error('Error during payment:', error);
        } 
    });
});
