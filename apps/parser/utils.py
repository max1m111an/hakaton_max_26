VOWELS = "аеёиоуыэюяАЕЁИОУЫЭЮЯ"

def accent_index(word: str):
    word = ''.join([c for c in word if c.lower() in VOWELS])
    return next((i for i, c in enumerate(word) if ord(c) in range(1040, 1072)), -2) + 1


def make_gap(word: str):
    res = list(word)
    for i, c in enumerate(list(res)):
        if c in VOWELS:
            res[i] = "."
    return ''.join(res)
    
