const knownTechniques = this.actor.itemTypes["wfrp4e-helf.technique"].length;
const xpCost = knownTechniques * 100;

if (this.actor.system.details.experience.current < xpCost) {
  return this.script.notification(game.i18n.localize("SCRIPT.NotEnoughXP"));
}

const techniques = await warhammer.utility.findAllItems("wfrp4e-helf.technique", "Loading Techniques", true);
const choice = await ItemDialog.create(techniques, 1, {text: "Choose Sword Dance", title: this.effect.name});
if (choice.length) {
  this.actor.addEffectItems(choice.map(i => i.uuid), this.effect);
  let expLog = foundry.utils.duplicate(this.actor.details.experience.log || []);
  expLog.push({
    amount: xpCost,
    reason: `${game.i18n.localize("WFRP4E.SwordDance")}: ${choice[0].name}`,
    spent: this.actor.details.experience.spent + xpCost,
    total: this.actor.details.experience.total,
    type: "spent",
  });
  this.actor.update({
    "system.details.experience.spent": this.actor.details.experience.spent + xpCost,
    "system.details.experience.log": expLog,
  });
}