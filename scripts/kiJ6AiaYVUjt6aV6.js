teeth = await fromUuid("Compendium.wfrp4e-core.items.fBcZhOBn8IpoVqQ1")
teeth = teeth.toObject();

let roll = await new Roll("1d10").roll({allowInteractive : false});
roll.toMessage(this.script.getChatData({flavor : "Teeth Lost"}))
teeth.system.location.value = `${roll.total} ${teeth.system.location.value}`
this.actor.createEmbeddedDocuments("Item", [teeth])