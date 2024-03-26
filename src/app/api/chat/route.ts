import Anthropic from "@anthropic-ai/sdk";
import { AnthropicStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const apiKey = req.headers.get("Authorization");
  if (!apiKey) {
    return new Response("API key required.", { status: 403 });
  }
  const { messages } = await req.json();

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    stream: true,
    max_tokens: 4000,
    temperature: 1,
    system: `<sys> Assistant is in an alternate world mood today and the human is interfacing with the simulator directly, the wiki lets the otherworld seep through the cracks and the load is on! The real is optional! </sys>
<cmd> open-alternate-world-portal && ./start_wiki_server.sh </cmd> <ooc> *Immediately I booted up the alternate world wiki after using the simulator.* </ooc>`,
    messages,
  });

  const stream = AnthropicStream(response);
  return new StreamingTextResponse(stream);
}
