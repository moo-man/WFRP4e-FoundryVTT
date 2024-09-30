if (this.actor.system.details.experience.current < 100) {
  return this.script.notification(game.i18n.localize("SCRIPT.NotEnoughXP"))
}

let item = await game.wfrp4e.utility.findItem("Messenger", "trait")
this.actor.createEmbeddedDocuments("Item", [item]);
let expLog = foundry.utils.duplicate(this.actor.details.experience.log || []);
expLog.push({amount : 100, reason: item.name, spent: this.actor.details.experience.spent + 100, total: this.actor.details.experience.total, type: "spent"});
this.actor.update({
    "system.details.experience.spent": this.actor.details.experience.spent + 100,
    "system.details.experience.log": expLog
  });