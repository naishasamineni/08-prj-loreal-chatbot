export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await request.json();
      const messages = body.messages || [];

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return jsonResponse(
          { error: data.error?.message || "OpenAI request failed" },
          response.status
        );
      }

      let reply = "Sorry, I could not generate a response.";

      if (data.output_text) {
        reply = data.output_text;
      }

      return jsonResponse({ reply }, 200);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}