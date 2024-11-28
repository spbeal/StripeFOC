<?php
/*
Plugin Name: Stripe Payment Plugin
Description: A plugin to handle Stripe payments in WordPress.
Version: 1.0
Author: Samuel Beal
*/

// Enqueue Scripts and Styles
function stripe_payment_enqueue_scripts() {
    wp_enqueue_script('stripe-js', 'https://js.stripe.com/v3/', [], null, true);
    wp_enqueue_script('stripe-payment-script', plugin_dir_url(__FILE__) . 'stripe-payment.js', [], null, true);
    wp_enqueue_style('stripe-payment-style', plugin_dir_url(__FILE__) . 'stripe-payment.css');
    //wp_enqueue_script('stripe-php', plugin_dir_path(__FILE__) . 'init.php');
    // Pass AJAX URL to JavaScript
    wp_localize_script('stripe-payment-script', 'stripeParams', [
        'ajaxurl' => admin_url('admin-ajax.php'),
    ]);
}
add_action('wp_enqueue_scripts', 'stripe_payment_enqueue_scripts');

// Register Shortcode
function stripe_payment_form_shortcode() {
    ob_start(); ?>

    <div id="main-container">
        <div class="member-section1" id="">
            <!-- <h1 class="text-container">Keep Idaho Wild!</h1> -->
            <h1 class="text-container">Your donation helps preserve Idaho's public lands for future generations.</h1>
            <div class=""> 
                 <!-- button-container -->
                <!-- <p class="text-container">
                    Ancient cedars, lynx and wolves, wild steelhead and chinook salmon all need your help. 
                    So do your present and future grandchildren. Someone needs to speak for the animals, the trees, the water.
                    <br> 
                    <b>That someone can be you.</b>
                </p> -->
            </div>
        </div>
        <div class="member-section2" >
            <div class="">
                <!-- button-container -->
                <p class="text-container2">
                    <b> Become a Friends of the Clearwater member with a gift of $35 or more!</b>
                    <br>
                    $20 dollars for students/low income to become a member. 
                    <br>                    
                </p>
            </div>
        </div>
    </div>
    <img src="https://www.foesoftheclearwater.com/wp-content/uploads/2024/08/2024-Logos-05.png" 
    alt="Logo" class="responsive-logo" style="max-width: 30%; max-width: 250px; ">


    <div id="main-content-container" style="">
        <!-- Left Column (Form) -->
        <div id="" style="">

            <p id="loading-message" class="loading-message">Loading form...</p>
            <form id="payment-form" class="form-container hidden">
                <!-- Section 1: Cash Amount Selection -->
                <div class="section" id="amount-selection-section">
                    <h3>Select an Amount</h3>
                    <div class="button-container">
                    <div class="button-row">
                        <button id="selected" type="button" class="amount-button" data-amount="20">$20 <br>Membership </button>
                        <button id="selected" type="button" class="amount-button" data-amount="35">$35 Membership </button>
                        <button id="selected" type="button" class="amount-button" data-amount="50">$50</button>
                    </div>
                    <div class="button-row">
                        <button id="selected" type="button" class="amount-button" data-amount="100">$100</button>
                        <button id="selected" type="button" class="amount-button" data-amount="200">$200</button>
                        <button id="selected" type="button" class="amount-button" data-amount="custom">Other</button>
                    </div>
                </div>
                    <div id="custom-amount-input" style="display: none;" class="custom-amount-container">
                        <label for="custom-amount" class="custom-amount-label">Enter Amount:</label>
                        <input type="number" id="custom-amount" name="custom_amount" min="5" value="5" class="custom-amount-input">
                    </div>
                </div>

                <!-- Section 2: Processing Fee Coverage -->
                <div class="section" id="processing-fee-section">
                    <h3>Cover Processing Fees?</h3>
                    <label>
                        <input type="radio" name="cover_fees" value="yes"> Yes (3% will be added)
                    </label>
                    <label>
                        <input type="radio" name="cover_fees" value="no" checked> No
                    </label>
                </div>

                <!-- Section 3: Recurring Subscription -->
                <div class="section" id="subscription-section">
                    <h3>Make it Recurring?</h3>
                    <label>
                        <input type="radio" name="recurring"  value="yes"> Yes, make it monthly
                    </label>
                    <label>
                        <input type="radio" name="recurring"  value="no" checked> No
                    </label>
                </div>

                <!-- Section 4: Payment form  -->
                <div class="section">
            
                    <div id="address-element"></div>
                    <br>

                    <div id="link-authentication-element"></div> <!-- For the Link Authentication Element -->
                    <br>
                    <input type="hidden" id="email-input" /> <!-- Hidden email input field -->

                    <div id="payment-element">
                        <!--Stripe.js injects the Payment Element-->
                    </div>
                    
                    <button id="submit" style="">
                        <div class="spinner hidden" id="spinner"></div>
                        <span id="button-text">Pay Now</span>
                    </button>
                    <div id="payment-message" class="hidden"></div>

                </div>

                <!-- Section 5: Date and purchase -->
                <div class="section" id="charge-details">
                    <p id="chargeamount">Amount: $5</p>
                    <p id="chargefee">Fee: $0</p>
                    <p id="chargedate">Time: N/A</p>
                    <p id="chargerecurring">Recurring: No</p>

                </div>
            </form>
        </div>

        <!-- Right Column (Image and Text) -->
        <div class ="member-section" id="right-column">
        <img src="https://www.foesoftheclearwater.com/wp-content/uploads/2024/11/katiebilodeau.jpg" 
        alt="Nature Image" style="max-width: 80%; height: auto; border-radius: 10px;">
            <br>
            <h2 class ="text-container" style="color=#005870">
                <b> Your gift helps...</b>
            </h2>
            <br>
            <h3 class ="text-container">
                KEEP IDAHO WILD
            </h3>
            <br>
            <!-- <p style="text-align: center; margin-top: 10px;">
                Your support helps preserve Idaho's pristine wilderness for future generations.
            </p> -->
            <p class="text-container" style="">
                    Ancient cedars, lynx and wolves, wild steelhead and chinook salmon all need your help. 
                    So do your present and future grandchildren. Someone needs to speak for the animals, the trees, the water.
                    <br> 
                    <b>That someone can be you.</b>
                </p>
        </div>
</div>


    <?php
    return ob_get_clean();
}
add_shortcode('stripe_payment_form', 'stripe_payment_form_shortcode');

require_once plugin_dir_path(__FILE__) . 'stripe-php/init.php';
add_action('wp_ajax_create_payment_intent', 'create_payment_intent');
add_action('wp_ajax_nopriv_create_payment_intent', 'create_payment_intent');
add_action('wp_ajax_create_subscription', 'create_subscription');
add_action('wp_ajax_nopriv_create_subscription', 'create_subscription');
//add_action('wp_ajax_get_secret', 'get_secret');

function create_subscription()
{
    try {

        $data = json_decode(file_get_contents('php://input'), true);  // Decode the JSON payload
        error_log(print_r($data, true));  // Logs the data for debugging purposes

        // Check if 'amount' is valid
        if (!isset($data['amount']) || !is_numeric($data['amount']) || $data['amount'] <= 0) {
            echo json_encode(['success' => false, 'data' => ['message' => 'Invalid or missing amount.']]);
            wp_die(); // End the request
        }

        // Process amount (ensure it's in cents)
        $amount = floatval($data['amount']) * 100;  // Convert to cents
        $cover_fees = boolval($data['cover_fees']);
        if ($cover_fees) {
            $amount += $amount * 0.03;  // Add 3% fee
        }

        // $is_recurring = isset($data['recurring']) && $data['recurring'] === 'yes';
        $is_recurring = boolval($data['recurring']);

        $stripe = new \Stripe\StripeClient(STRIPE_SECRET_KEY);

        $email = $data['email'];
        $address = $data['address'];
        $name =  $data['name'];
        $customer = $stripe->customers->create([
            'email' => $email,
            'address' => $address,
            'name' => $name,
            // 'name' => '{{CUSTOMER_NAME}}',
        
            // 'address' => [
            //   'city' => 'Brothers',
            //   'country' => 'US',
            //   'line1' => '27 Fredrick Ave',
            //   'postal_code' => '97712',
            //   'state' => 'CA',
            // ],
          ]);
          $product_name = "Subscription - $name";
        $price = $stripe->prices->create([
            'unit_amount' => $amount,
            'currency' => 'usd',
            'recurring' => ['interval' => 'month'],  // Monthly subscription
            'product_data' => [
                'name' => $product_name,  // Name of the product
            ],
        ]);

        $subscription = $stripe->subscriptions->create([
            'customer' => $customer->id,
            // 'default_payment_method' => ['card'],
            'items' => [
                [
                    'price' => $price->id,
                ],
            ],
            'payment_behavior' => 'default_incomplete',
            'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
            'expand' => ['latest_invoice.payment_intent', 'pending_setup_intent'],
        ]);
        echo json_encode(['data' => ['clientSecret' => $subscription->latest_invoice->payment_intent->client_secret]]);

        // if ($subscription->pending_setup_intent !== NULL) {
        //     echo json_encode(['type' => 'setup', 'data' => ['clientSecret' => $subscription->pending_setup_intent->client_secret]]);
        //   } else {

        //     echo json_encode(['type' => 'payment', 'data' => ['clientSecret' => $subscription->latest_invoice->payment_intent->client_secret]]);

        // }

        // $clientSecret = $subscription->latest_invoice->payment_intent->client_secret ?? null;

        // if ($clientSecret) {
        //     echo json_encode(['success' => true, 'data' => ['clientSecret' => $clientSecret]]);
        // } else {
        //     error_log('No client secret in subscription payment intent.');
        //     echo json_encode(['success' => false, 'data' => ['message' => 'Subscription created, but no client secret found.']]);
        // }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'data' => ['message' => $e->getMessage()]]);
    }
    wp_die(); // Terminate the request
}

function create_payment_intent() {
    //\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY); // Your secret key

    // Parse the JSON body from the POST request
    $data = json_decode(file_get_contents('php://input'), true);  // Decode the JSON payload

    // Debugging: Log the received data to verify if the 'amount' is sent correctly
    error_log(print_r($data, true));  // Logs the data for debugging purposes

    // Check if 'amount' is valid
    if (!isset($data['amount']) || !is_numeric($data['amount']) || $data['amount'] <= 0) {
        echo json_encode(['success' => false, 'data' => ['message' => 'Invalid or missing amount.']]);
        wp_die(); // End the request
    }

    // Process amount (ensure it's in cents)
    $amount = floatval($data['amount']) * 100;  // Convert to cents
    $cover_fees = boolval($data['cover_fees']);
    if ($cover_fees) {
        $amount += $amount * 0.03;  // Add 3% fee
    }

    // $is_recurring = isset($data['recurring']) && $data['recurring'] === 'yes';

    try {
        // \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY); 
        $stripe = new \Stripe\StripeClient(STRIPE_SECRET_KEY);

        // Create a one-time payment intent
        $intent = $stripe->paymentIntents->create([
            'amount' => $amount,
            'currency' => 'usd',
            'payment_method_types' => ['card'],
        ]);
        
        echo json_encode(['success' => true, 'data' => ['clientSecret' => $intent->client_secret]]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'data' => ['message' => $e->getMessage()]]);
    }


    // try {
    //     \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY); // Your secret key

    //     $intent = \Stripe\PaymentIntent::create([
    //         'amount' => $amount,
    //         'currency' => 'usd',
    //         'payment_method_types' => ['card'],
    //     ]);
    //     echo json_encode(['success' => true, 'data' => ['clientSecret' => $intent->client_secret]]);
    // } catch (Exception $e) {
    //     echo json_encode(['success' => false, 'data' => ['message' => $e->getMessage()]]);
    // }
    wp_die(); // Terminate the request
}