let modifier = this.effect.sourceTest?.result.overcast.usage.other.current || 0

let test = await this.actor.setupCharacteristic("dex", {fields: {modifier}, appendTitle : " - " + this.script.label});

test.roll();