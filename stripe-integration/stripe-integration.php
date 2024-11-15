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
        <button id="submit">
            <div class="spinner hidden" id="spinner"></div>
            <span id="button-text">Pay Now</span>
        </button>
        <div id="payment-message" class="hidden"></div>
    </form>
    <?php
    return ob_get_clean();
}
add_shortcode('stripe_payment_form', 'stripe_payment_form_shortcode');

require_once plugin_dir_path(__FILE__) . 'stripe-php/init.php';
add_action('wp_ajax_create_payment_intent', 'create_payment_intent');
add_action('wp_ajax_nopriv_create_payment_intent', 'create_payment_intent');

function create_payment_intent() {
    \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY); // Your secret key

    try {
        $intent = \Stripe\PaymentIntent::create([
            'amount' => 1000, // amount in cents
            'currency' => 'usd',
            'payment_method_types' => ['card'],
        ]);
        echo json_encode(['success' => true, 'data' => ['clientSecret' => $intent->client_secret]]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'data' => ['message' => $e->getMessage()]]);
    }
    wp_die(); // Terminate the request
}