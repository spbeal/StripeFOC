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
    <form id="payment-form">
        <div id="link-authentication-element"></div> <!-- For the Link Authentication Element -->
        
        <input type="hidden" id="email-input" /> <!-- Hidden email input field -->
        <div id="payment-element">
            <!--Stripe.js injects the Payment Element-->
        </div>
    </form>
    <?php
    return ob_get_clean();
}
add_shortcode('stripe_payment_form', 'stripe_payment_form_shortcode');

require_once plugin_dir_path(__FILE__) . 'stripe-php/init.php';
add_action('wp_ajax_create_payment_intent', 'create_payment_intent');
add_action('wp_ajax_nopriv_create_payment_intent', 'create_payment_intent');
//add_action('wp_ajax_get_secret', 'get_secret');


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

    try {
        \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY); // Your secret key

        $intent = \Stripe\PaymentIntent::create([
            'amount' => $amount,
            'currency' => 'usd',
            'payment_method_types' => ['card'],
        ]);
        echo json_encode(['success' => true, 'data' => ['clientSecret' => $intent->client_secret]]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'data' => ['message' => $e->getMessage()]]);
    }
    wp_die(); // Terminate the request
}