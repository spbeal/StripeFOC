<?php
/*
Plugin Name: Stripe Payment Plugin
Description: A plugin to handle Stripe payments in WordPress.
Version: 1.0
Author: Samuel Beal
*/
add_action('rest_api_init', function () {
    register_rest_route('stripe/v1', '/webhook', [
        'methods' => 'POST',
        'callback' => 'stripe_webhook_handler',
        'permission_callback' => '__return_true',
    ]);
});

function stripe_webhook_handler($request) {
    $payload = $request->get_body();
    $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
    $secret = 'your_webhook_secret'; // Get this from your Stripe dashboard

    try {
        $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $secret);

        if ($event->type === 'payment_intent.succeeded') {
            $paymentIntent = $event->data->object; // This contains payment details

            // Extract relevant details for LGL
            $amount = $paymentIntent->amount_received / 100; // Stripe stores amounts in cents
            $email = $paymentIntent->charges->data[0]->billing_details->email;
            $name = $paymentIntent->charges->data[0]->billing_details->name;

            // Send this data to LGL
            send_to_lgl($name, $email, $amount);
        }
    } catch (\Stripe\Exception\SignatureVerificationException $e) {
        // Handle the error
        error_log("Webhook signature verification failed: " . $e->getMessage());
    }

    return new WP_REST_Response('Webhook received', 200);
}

function send_to_lgl($name, $email, $amount) {
    $api_url = 'https://api.littlegreenlight.com/v1/donations'; // Check LGL API URL
    $api_key = 'your_lgl_api_key';

    $body = [
        'donor_name' => $name,
        'email' => $email,
        'amount' => $amount,
        'date' => current_time('Y-m-d'),
        'payment_method' => 'Credit Card',
    ];

    $response = wp_remote_post($api_url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json',
        ],
        'body' => json_encode($body),
    ]);

    if (is_wp_error($response)) {
        error_log("Failed to send to LGL: " . $response->get_error_message());
    } else {
        error_log("Successfully sent to LGL: " . print_r($response, true));
    }
}


?>