document.addEventListener('DOMContentLoaded', function () {
    const stripe = Stripe('pk_live_51Q7i5JIzczgg3ibGHMru3Zzz1UOnfHInisA6S2881J6n581s64pLB0su47kq6DdhbD9OjJqdCjZbaWOxVGYzD8ki00hlZmXfBT');
    const paymentForm = document.getElementById('payment-form');
    const rightColumn = document.getElementById('right-column');

    const amountButtons = document.querySelectorAll('.amount-button'); // id found in the .php file
    const customAmountInput = document.getElementById('custom-amount-input');
    const customAmountField = document.getElementById('custom-amount');
    const otherAmountButton = document.querySelector('button[data-amount="custom"]');

    const emailInput = document.getElementById('email-input');  // Hidden input for email
    const loadingMessage = document.getElementById('loading-message');
    const paymentMessage = document.getElementById('payment-message');


    let linkAuthenticationElement; 
    let paymentElement;  
    let addressElement;
    let elements; 
    let current_email = '';
    let firstName = '';
    let lastName = '';
    let clientSecret = '';

    let current_address = {};

    paymentForm.style.display = 'none';  // Show the form
    rightColumn.style.display = 'none';  // Show the form


    let selectedAmount = 5;
    let coverFees = false;
    let recurring_input = false;

    ///////// Event listeners for amount selection /////////
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
        
        if (selectedAmount >= 5) {
            updateChargeDetails();
            updatePaymentIntent(); 
        }
    });

    // Handle cover fees selection
    const coverFeesRadio = document.querySelectorAll('input[name="cover_fees"]');
    coverFeesRadio.forEach((radio) => {
        radio.addEventListener('change', () => {
            coverFees = document.querySelector('input[name="cover_fees"]:checked').value === 'yes';
            updateChargeDetails();
            updatePaymentIntent();
        });
    });
    // Recurring payment selection
    const recurringRadio = document.querySelectorAll('input[name="recurring"]');
    recurringRadio.forEach((radio) => {
        radio.addEventListener('change', () => {
            recurring_input = document.querySelector('input[name="recurring"]:checked').value === 'yes';
            updateChargeDetails();
            updatePaymentIntent();
        });
    });
    ////////////////
    ////////////////
    ////////////////

    let appearance = {
    theme: 'flat',
    variables: {
        fontFamily: 'Sohne, system-ui, sans-serif',
        fontWeightNormal: '500',
        borderRadius: '8px',
        colorPrimary: '#005870',
        accessibleColorOnColorPrimary: '#005870',
    },
    rules: {
        '.Input': {
        border: '1px solid var(--colorPrimary)'
        }
    }
    };

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);  // Basic email validation
    }

    function updateChargeDetails() {
        const chargeAmountElement = document.getElementById('chargeamount');
        const chargeFeeElement = document.getElementById('chargefee');
        const chargeDateElement = document.getElementById('chargedate');
        const chargeRecurringElement = document.getElementById('chargerecurring');


        // Calculate the amount with fees if necessary
        let finalAmount = selectedAmount;
        if (coverFees) {
            finalAmount += finalAmount * 0.03;  // 3% fee
        }

        // Set the content for the charge details
        chargeAmountElement.textContent = `Amount: $${finalAmount.toFixed(2)}`;
        chargeFeeElement.textContent = coverFees ? 'Fee: 3%' : 'Fee: $0';
        chargeDateElement.textContent = `Charge Date: ${new Date().toLocaleDateString()}`;
        chargeRecurringElement.textContent = recurring_input ? 'Recurring: Yes, monthly' : 'Recurring: No';
    }

    async function updatePaymentIntent() {
        if (recurring_input)
            {
                options = 
                {
                    mode: 'subscription',
                    amount: selectedAmount,
                    currency: 'usd',
                    appearance: {
                        theme: 'flat',
                        variables: {
                            fontFamily: 'Sohne, system-ui, sans-serif',
                            fontWeightNormal: '500',
                            borderRadius: '8px',
                            colorPrimary: '#005870',
                            accessibleColorOnColorPrimary: '#005870',
                        },
                        rules: {
                            '.Input': {
                            border: '1px solid var(--colorPrimary)'
                            }
                        }
                    },
                };
            }
            else
            {
                options = 
                {
                    appearance: {
                        theme: 'flat',
                        variables: {
                            fontFamily: 'Sohne, system-ui, sans-serif',
                            fontWeightNormal: '500',
                            borderRadius: '8px',
                            colorPrimary: '#005870',
                            accessibleColorOnColorPrimary: '#005870',
                        },
                        rules: {
                            '.Input': {
                            // backgroundColor: '#e7e7ec',
                            border: '1px solid var(--colorPrimary)'
                            }
                        }
                    },
                }
            }
        if (isNaN(selectedAmount) || selectedAmount < 5) {
            console.error('Invalid amount:', selectedAmount);
            return;
        }
        let response;
          
        if (recurring_input)
        {
            response = await fetch(stripeParams.ajaxurl + '?action=create_subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedAmount,
                    cover_fees: coverFees,
                    email: emailInput.value,
                    recurring: recurring_input,
                    address: current_address,
                    name: `${firstName} ${lastName}`,
                    first_name: firstName,
                    last_name: lastName,
                })
            });
        }
        else
        {
            response = await fetch(stripeParams.ajaxurl + '?action=create_payment_intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedAmount,
                    cover_fees: coverFees,
                    email: emailInput.value,
                    recurring: recurring_input,
                    address: current_address,
                    name: `${firstName} ${lastName}`,
                    first_name: firstName,
                    last_name: lastName,
                })
            });
        }


        const result = await response.json();
        const loader = 'auto';                    

        try {
            if (result.success) {
                clientSecret = result.data.clientSecret;

                elements = stripe.elements({clientSecret, loader, options, appearance});
                linkAuthenticationElement = elements.create("linkAuthentication");
                addressElement = elements.create('address',
                    { 
                        mode: 'billing', // Can be 'billing' or 'shipping'
                        defaultValues: {
                            name: '',
                            address: {
                                country: 'US', // Default country
                            },
                        },
                    }
                );
                paymentElement = elements.create('payment', options, clientSecret, { 
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

                // Create and Mount 
                addressElement.mount('#address-element');
                paymentElement.mount('#payment-element');
                linkAuthenticationElement.mount("#link-authentication-element");

                // Define the readiness promises
                const addressReady = new Promise((resolve) => {
                    addressElement.on('ready', () => {
                        //console.log('Link Authentication Element is ready');
                        resolve();
                    });
                });

                const linkReady = new Promise((resolve) => {
                    linkAuthenticationElement.on('ready', () => {
                        //console.log('Link Authentication Element is ready');
                        resolve();
                    });
                });

                const paymentReady = new Promise((resolve) => {
                    paymentElement.on('ready', () => {
                        //console.log('Payment Element is ready');
                        resolve();
                    });
                });
                await Promise.all([addressReady, linkReady, paymentReady]);

                // Both elements are ready now
                //console.log('Both elements are ready');
                loadingMessage.style.display = 'none';
                paymentForm.style.display = 'block';  // Show the form
                paymentForm.classList.remove('hidden');
                rightColumn.style.display = 'block';  // Show the form
                rightColumn.classList.remove('hidden');

            } else {
                document.getElementById('payment-message').textContent = result.data.error;
            }
        } catch (error) {
            document.getElementById('payment-message').textContent = `Error: ${error.message}`;
        }
    }

    async function initializeStripe()
    {
        updatePaymentIntent();
    }
        initializeStripe();

        
    // Listen for form submission
    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        elements.submit();

        
        paymentMessage.textContent = '';

        try {
            // LISTENERS
            linkAuthenticationElement.on('change', (event) => {
                const email = event.value.email;
                console.log("Captured email:", email);  // Log the email to verify it's captured

                if (!email || !validateEmail(email)) {
                    paymentMessage.textContent = "Please enter a valid email address.";
                    //submitButton.disabled = false;
                    loadingMessage.style.display = 'none';
                    return;
                }

                current_email = email;
                if (emailInput) {
                    emailInput.value = email;  // Store the email in the hidden input field
                }                    
            });
            addressElement.on('change', (event) => {
                const { value: addressDetails } = addressElement.getValue();
                //const addressDetails = event.value;  // Get the address details object

                const fullName = addressDetails.name;  // Full name from AddressElement

                // Split the full name into first and last names
                const nameParts = fullName.split(" ");
                firstName = nameParts[0];  // First part as first name
                lastName = nameParts.slice(1).join(" ");  // Join the rest as last name (handles multiple last names)

                if (!addressDetails.complete) {
                    paymentMessage.textContent = 'Please complete the address form.';
                    return;
                }

                // Store the validated address
                current_address = addressDetails;
            });

            let error;
            let res;
            let clientSecret = '';
            if (recurring_input)
            {
                res = await fetch(stripeParams.ajaxurl + '?action=create_subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: selectedAmount,
                        cover_fees: coverFees,
                        email: emailInput.value,
                        recurring: recurring_input,
                        address: current_address,
                        name: `${firstName} ${lastName}`,
                    })
                });
                const result = await res.json();
                clientSecret = result.data.clientSecret;
                
            }

            if (recurring_input)
            {
                error = await stripe.confirmPayment({
                    clientSecret,
                    elements,
                    payment_method: {
                        billing_details: {  // Use billing_details (with an underscore)
                            name: current_address.name,
                            first_name: firstName,
                            last_name: lastName,
                            email: `${current_email}`,
                            address: current_address.address,
                        },
                    },
                    confirmParams: {
                        return_url: 'https://www.friendsoftheclearwater.org/',
                        receipt_email: current_email,
    
                    },
                });
            }
            else
            {
            error = await stripe.confirmPayment({
                // clientSecret,
                elements,
                payment_method: {
                    billing_details: {  
                        name: current_address.name,
                        first_name: firstName,
                        last_name: lastName,
                        email: `${current_email}`,
                        address: current_address.address,
                    },
                },
                
                confirmParams: {
                    return_url: 'https://www.friendsoftheclearwater.org/',
                    receipt_email: current_email,

                },
            });
            }

            if (error) {
                console.error('Payment failed:', error.message);
                document.getElementById('payment-message').textContent = error.message;
            } else {
                document.getElementById('payment-message').textContent = recurring_input === true 
                ? 'Subscription created successfully!' 
                : 'Payment successful!';
            }
        } catch (error) {
            console.error('Error during payment:', error);
        } 
    });
});
