document.addEventListener('DOMContentLoaded', function () {
    const stripe = Stripe('pk_test_51Q7i5JIzczgg3ibGb6QdyYhCA64fMBya6fI1b1Lx4b3sjRGNZ16WiRalqFv6tlscBHFNzJZsFb8M7vq9rCtvYBG500TBh9RGvS');
    const paymentForm = document.getElementById('payment-form');


    const appearance = {
        theme: 'flat',
        variables: { colorPrimaryText: '#262626' }
      };
    const options = { /* options */ };

    async function initializeStripe() {
        try {
            // Fetch client secret via AJAX

            //             const response = await fetch('wp-admin/admin-ajax.php?action=create_payment_intent');
            const response = await fetch(stripeParams.ajaxurl + '?action=create_payment_intent');
            const result = await response.json();
            console.log("AJAX Response:", result); // Debug the full response

            if (result.success) {

                const clientSecret = result.data.clientSecret;

                const loader = 'auto';
                
                // Initialize Stripe Elements with the client secret
                const elements = stripe.elements({clientSecret, loader, appearance});
                const paymentElement = elements.create('payment', options, { clientSecret,
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

                const linkAuthenticationElement = elements.create("linkAuthentication");
                linkAuthenticationElement.mount("#link-authentication-element");
                linkAuthenticationElement.on('change', (event) => {
                    const email = event.value.email;
                  });

                // Listen for form submission
                paymentForm.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    const { error } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            return_url: 'https://www.foesoftheclearwater.com',
                            // return_url: 'https://www.foesoftheclearwater.com/payment-success',

                        },
                    });

                    if (error) {
                        console.error('Payment failed:', error.message);
                        document.getElementById('payment-message').textContent = error.message;
                    } else {
                        document.getElementById('payment-message').textContent = 'Payment successful!';
                    }
                });
            } else {
                console.error('Error fetching client secret:', result.data.message);

            }
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    initializeStripe();
});
