export const CALLBACKS = {
    MENU_ORTHOEPY: "menu:orthoepy",
    MENU_VOCAB: "menu:vocab",
    MENU_PUNCTUATION: "menu:punctuation",
} as const;

export type CallbackPayload = (typeof CALLBACKS)[keyof typeof CALLBACKS];