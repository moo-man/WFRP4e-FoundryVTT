if (this.actor.system.details.experience.current < 100) {
  return this.script.notification(game.i18n.localize("SCRIPT.NotEnoughXP"))
}

let traits = await warhammer.utility.findAllItems("trait", null, true);
traits = traits.filter(t => t.name.includes("Companion Trait"));

let items = await ItemDialog.create(traits);
this.actor.createEmbeddedDocuments("Item", items);
let expLog = foundry.utils.duplicate(this.actor.details.experience.log || []);
expLog.push({amount : 100, reason: items[0].name, spent: this.actor.details.experience.spent + 100, total: this.actor.details.experience.total, type: "spent"});
this.actor.update({
    "system.details.experience.spent": this.actor.details.experience.spent + 100,
    "system.details.experience.log": expLog
  });