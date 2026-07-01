/**
 * Cloudflare Worker: Supabase API Proxy
 * This worker acts as a proxy for Supabase API calls to ensure accessibility for users in Iran.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Replace the worker URL with the Supabase URL
    // e.g., https://worker.yourname.workers.dev/rest/v1/courses -> https://xyz.supabase.co/rest/v1/courses
    const supabaseUrl = new URL(env.SUPABASE_URL);
    url.hostname = supabaseUrl.hostname;
    url.protocol = supabaseUrl.protocol;
    url.port = supabaseUrl.port;

    // Create a new request based on the original one
    const modifiedRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual'
    });

    // Optional: Inject API Key if not provided by client (though usually it is)
    // modifiedRequest.headers.set('apikey', env.SUPABASE_ANON_KEY);

    try {
      const response = await fetch(modifiedRequest);

      // Clone response to modify headers for CORS if necessary
      const newResponse = new Response(response.body, response);

      // Ensure CORS headers allow the GitHub Pages origin
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      newResponse.headers.set('Access-Control-Allow-Headers', '*');

      return newResponse;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Proxy error: ' + error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
