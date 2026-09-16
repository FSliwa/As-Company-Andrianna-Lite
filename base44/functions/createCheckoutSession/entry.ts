import { createClient } from 'npm:@base44/sdk@0.1.0';
import Stripe from 'npm:stripe@^14';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        // CORS headers
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid user' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const { name, description, priceInCents, successUrl, cancelUrl } = await req.json();

        if (!name || !priceInCents || !successUrl || !cancelUrl) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: name,
                            description: description || `Booking for ${name}`,
                        },
                        unit_amount: priceInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: user.email,
        });

        return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*'
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 
                "Content-Type": "application/json",
                'Access-Control-Allow-Origin': '*'
            },
        });
    }
});