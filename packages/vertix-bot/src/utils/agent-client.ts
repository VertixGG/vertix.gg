import OpenAI from "openai";

const DEFAULT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const MAX_DISCORD_RESPONSE_LENGTH = 1900;

let openAIClient: OpenAI | null = null;

export const isOpenAIConfigured = () => Boolean( process.env.OPENAI_API_KEY );

const getOpenAIClient = (): OpenAI => {
    if ( openAIClient ) {
        return openAIClient;
    }

    if ( !isOpenAIConfigured() ) {
        throw new Error( "OPENAI_API_KEY is not configured" );
    }

    openAIClient = new OpenAI( { apiKey: process.env.OPENAI_API_KEY } );

    return openAIClient;
};

export type AgentChatMessage = OpenAI.ChatCompletionMessageParam;

export async function runAgentChat( messages: AgentChatMessage[], temperature = 0.7 ) {
    const completion = await getOpenAIClient().chat.completions.create( {
        model: DEFAULT_MODEL,
        temperature,
        messages
    } );

    const responseContent = completion.choices[ 0 ]?.message?.content;

    return sanitizeResponse( responseContent );
}

export function sanitizeResponse( text?: string | null ) {
    if ( !text ) {
        return "I wasn't able to generate a reply.";
    }

    const trimmed = text.trim();

    if ( trimmed.length <= MAX_DISCORD_RESPONSE_LENGTH ) {
        return trimmed;
    }

    return `${ trimmed.slice( 0, MAX_DISCORD_RESPONSE_LENGTH ) }\n... (truncated)`;
}
