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
    VOCABULARIES_TRAIN: "vocabularies:train",
    VOCABULARIES_DIFFICULT: "vocabularies:difficult",
    VOCABULARIES_BACK_TO_MAIN: "vocabularies:back:main",
    VOCABULARIES_BACK_TO_MENU: "vocabularies:back:menu",
    VOCABULARIES_ANSWER_PREFIX: "vocabularies:answer:",
    VOCABULARIES_FINISH_PREFIX: "vocabularies:finish:",
} as const;

export const ORTHOEPY_ANSWER_PATTERN = /^orthoepy:answer:([a-z0-9-]+):(\d+):(\d+)$/i;
export const ORTHOEPY_FINISH_PATTERN = /^orthoepy:finish:([a-z0-9-]+)$/i;
export const VOCABULARIES_ANSWER_PATTERN = /^vocabularies:answer:([a-z0-9-]+):(\d+):(\d+)$/i;
export const VOCABULARIES_FINISH_PATTERN = /^vocabularies:finish:([a-z0-9-]+)$/i;

export type CallbackPayload = (typeof CALLBACKS)[keyof typeof CALLBACKS];
