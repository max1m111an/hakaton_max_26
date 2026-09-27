export const CALLBACKS = {
    MENU_ORTHOEPY: "menu:orthoepy",
    MENU_VOCAB: "menu:vocab",
    MENU_PUNCTUATION: "menu:punctuation",
    ORTHOEPY_TRAIN: "orthoepy:train",
    ORTHOEPY_DIFFICULT: "orthoepy:difficult",
    ORTHOEPY_BACK_TO_MAIN: "orthoepy:back:main",
    ORTHOEPY_BACK_TO_MENU: "orthoepy:back:menu",
    ORTHOEPY_ANSWER_PREFIX: "orthoepy:answer:",
    ORTHOEPY_FINISH_PREFIX: "orthoepy:finish:",
} as const;

export const ORTHOEPY_ANSWER_PATTERN = /^orthoepy:answer:([a-z0-9-]+):(\d+):(\d+)$/i;
export const ORTHOEPY_FINISH_PATTERN = /^orthoepy:finish:([a-z0-9-]+)$/i;

export type CallbackPayload = (typeof CALLBACKS)[keyof typeof CALLBACKS];
