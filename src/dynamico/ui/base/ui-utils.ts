export const UI_TEMPLATE_WRAPPER_START = "{",
    UI_TEMPLATE_WRAPPER_END = "}";

export const uiUtilsWrapAsTemplate = ( template: string ): string => {
    return UI_TEMPLATE_WRAPPER_START + template + UI_TEMPLATE_WRAPPER_END;
};
