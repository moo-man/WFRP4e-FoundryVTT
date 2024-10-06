ChatMessage.create({content : "<em>Yield or die!</em>", speaker : ChatMessage.getSpeaker({token: this.actor.getActiveTokens()[0]?.document, actor: this.actor})}, {chatBubble : true})
let item = await fromUuid("Compendium.wfrp4e-core.items.pTorrE0l3VybAbtn")
let data = item.toObject();
data.system.specification.value = 2;
this.script.notification("Adding " + data.name);
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id});
game.wfrp4e.utility.postFear(2, this.actor.prototypeToken.name)