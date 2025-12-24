import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  packageId: string;
  packageType: "credits" | "plan";
  userId: string;
  userEmail: string;
}

const creditPackages: Record<string, { credits: number; price: number; name: string }> = {
  "100": { credits: 100, price: 1790, name: "100 Créditos" },
  "300": { credits: 300, price: 4790, name: "300 Créditos" },
  "500": { credits: 500, price: 8790, name: "500 Créditos" },
};

const planPackages: Record<string, { price: number; name: string; interval: string }> = {
  "pro": { price: 4900, name: "Plano Pro", interval: "monthly" },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUNIZE_API_KEY = Deno.env.get("SUNIZE_API_KEY");
    
    if (!SUNIZE_API_KEY) {
      console.error("SUNIZE_API_KEY not configured");
      throw new Error("Payment service not configured");
    }

    const { packageId, packageType, userId, userEmail }: CheckoutRequest = await req.json();
    
    console.log("Processing checkout request:", { packageId, packageType, userId, userEmail });

    if (!packageId || !packageType || !userId || !userEmail) {
      throw new Error("Missing required fields");
    }

    let productName: string;
    let priceInCents: number;
    let metadata: Record<string, string>;

    if (packageType === "credits") {
      const creditPackage = creditPackages[packageId];
      if (!creditPackage) {
        throw new Error("Invalid credit package");
      }
      productName = creditPackage.name;
      priceInCents = creditPackage.price;
      metadata = {
        type: "credits",
        credits: String(creditPackage.credits),
        userId,
      };
    } else if (packageType === "plan") {
      const planPackage = planPackages[packageId];
      if (!planPackage) {
        throw new Error("Invalid plan package");
      }
      productName = planPackage.name;
      priceInCents = planPackage.price;
      metadata = {
        type: "plan",
        planId: packageId,
        userId,
      };
    } else {
      throw new Error("Invalid package type");
    }

    // Create Sunize checkout session
    // Note: Adjust the API endpoint and request format according to Sunize's actual API documentation
    const sunizeResponse = await fetch("https://api.sunize.com.br/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUNIZE_API_KEY}`,
      },
      body: JSON.stringify({
        line_items: [
          {
            name: productName,
            amount: priceInCents,
            quantity: 1,
          },
        ],
        customer_email: userEmail,
        metadata,
        success_url: `${req.headers.get("origin")}/upgrades?payment=success`,
        cancel_url: `${req.headers.get("origin")}/upgrades?payment=cancelled`,
      }),
    });

    if (!sunizeResponse.ok) {
      const errorText = await sunizeResponse.text();
      console.error("Sunize API error:", sunizeResponse.status, errorText);
      throw new Error(`Payment provider error: ${sunizeResponse.status}`);
    }

    const checkoutSession = await sunizeResponse.json();
    console.log("Checkout session created:", checkoutSession.id);

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
