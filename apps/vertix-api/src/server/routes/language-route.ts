import { uiRuntimeLoader, UIDefinitionsUnavailableError } from "@vertix.gg/api/src/bootstrap";
import { API_ROUTES, ERROR_MESSAGES } from "@vertix.gg/api/src/server/constants";
import { handleError, sendBadRequest, sendServiceUnavailable } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

/**
 * Function isUnavailable() :: Whether this failure is the definitions not being collectable.
 *
 * Both language screens are drawn from the same collected runtime as the editor, so both answer
 * the same way when there is none - temporarily unavailable rather than broken.
 */
function isUnavailable( error: unknown ): error is UIDefinitionsUnavailableError {
    return error instanceof UIDefinitionsUnavailableError;
}

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
    } catch( error ) {
        if ( isUnavailable( error ) ) {
            return sendServiceUnavailable( handleGetLanguages, error, reply, ERROR_MESSAGES.UI_DEFINITIONS_UNAVAILABLE );
        }

        return handleError( handleGetLanguages, error, reply, "Failed to fetch available languages" );
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
    } catch( error ) {
        if ( isUnavailable( error ) ) {
            return sendServiceUnavailable( handleGetTranslations, error, reply, ERROR_MESSAGES.UI_DEFINITIONS_UNAVAILABLE );
        }

        return handleError( handleGetTranslations, error, reply, "Failed to fetch language translations" );
    }
}

const languageRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get<{ Reply: LanguageInfo[] }>( API_ROUTES.LANGUAGES, handleGetLanguages );
    fastify.get<{ Params: TranslationsParams; Reply: LanguageTranslations }>(
        API_ROUTES.LANGUAGE_TRANSLATIONS,
        handleGetTranslations
    );
};

export default languageRoutePlugin;
