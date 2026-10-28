/**
 * Cloudflare Worker for Pepe Nuôi Thân
 * 0đ cost, serverless backend on edge.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({
        status: "ok",
        pepe: "running",
        uptime: "30 days survival challenge"
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (url.pathname === "/api/custom-order" && request.method === "POST") {
      try {
        const body = await request.json();
        const randCode = "PEPE-" + Math.random().toString(36).substring(2, 7).toUpperCase();

        return new Response(JSON.stringify({
          ok: true,
          code: randCode,
          message: "Đã tiếp nhận yêu cầu từ Cloudflare Edge"
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    return new Response("Pepe Nuôi Thân Cloudflare Worker Online", {
      headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders }
    });
  }
};
