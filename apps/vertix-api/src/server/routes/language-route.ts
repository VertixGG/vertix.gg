import { uiRuntimeLoader } from "@vertix.gg/api/src/bootstrap";
import { API_ROUTES } from "@vertix.gg/api/src/server/constants";
import { handleError, sendBadRequest } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

export interface LanguageInfo {
    code: string;
    name: string;
    flag: string;
}

export interface LanguageTranslations {
    embeds: Record<string, { title?: string; description?: string }>;
    elements: Record<string, { label?: string }>;
    modals: Record<string, { title?: string }>;
}

interface TranslationsParams {
    code: string;
}

async function handleGetLanguages( _request: FastifyRequest, reply: FastifyReply ) {
    try {
        return await uiRuntimeLoader.getAvailableLanguages();
    } catch ( error ) {
        handleError( handleGetLanguages, error, reply, "Failed to fetch available languages" );
    }
}

async function handleGetTranslations(
    request: FastifyRequest<{ Params: TranslationsParams }>,
    reply: FastifyReply
) {
    const { code } = request.params;

    if ( !code ) {
        sendBadRequest( reply, "Language code is required" );
        return;
    }

    try {
        return await uiRuntimeLoader.getLanguageTranslations( code );
    } catch ( error ) {
        handleError( handleGetTranslations, error, reply, "Failed to fetch language translations" );
    }
}

const languageRoutePlugin: FastifyPluginAsync = async ( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Reply: LanguageInfo[] }>( API_ROUTES.LANGUAGES, handleGetLanguages );
    fastify.get<{ Params: TranslationsParams; Reply: LanguageTranslations }>(
        API_ROUTES.LANGUAGE_TRANSLATIONS,
        handleGetTranslations
    );
};

export default languageRoutePlugin;
