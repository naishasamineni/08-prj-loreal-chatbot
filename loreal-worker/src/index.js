export default {
	async fetch(request, env) {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Content-Type': 'application/json',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
				status: 405,
				headers: corsHeaders,
			});
		}

		try {
			const body = await request.json();

			if (!body.messages || !Array.isArray(body.messages)) {
				return new Response(JSON.stringify({ error: 'Request must include a messages array.' }), {
					status: 400,
					headers: corsHeaders,
				});
			}

			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.OPENAI_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: 'gpt-4.1-mini',
					messages: body.messages,
					temperature: 0.7,
					max_tokens: 300,
				}),
			});

			const data = await response.json();

			return new Response(JSON.stringify(data), {
				status: response.status,
				headers: corsHeaders,
			});
		} catch (error) {
			return new Response(
				JSON.stringify({
					error: 'Something went wrong in the worker.',
					details: error.message,
				}),
				{
					status: 500,
					headers: corsHeaders,
				},
			);
		}
	},
};
