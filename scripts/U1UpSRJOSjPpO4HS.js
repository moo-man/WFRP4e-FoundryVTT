let mutations = await warhammer.utility.findAllItems("mutation", "Loading Mutations", true)

let roll = Math.floor(CONFIG.Dice.randomUniform() * mutations.length);

this.actor.createEmbeddedDocuments("Item", [(await fromUuid(mutations[roll].uuid)).toObject()]);
this.script.notification(`Added ${mutations[roll].name}`)