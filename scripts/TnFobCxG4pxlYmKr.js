let gorCharacteristics = {
    "ws": 45,
    "bs": 30,
    "s": 35,
    "t": 45,
    "i": 30,
    "ag": 35,
    "dex": 25,
    "int": 25,
    "wp": 30,
    "fel": 25
}
for (let char in this.actor.characteristics) {
    if (this.actor.characteristics[char].initial < gorCharacteristics[char])
        this.actor.characteristics[char].initial = gorCharacteristics[char]
}