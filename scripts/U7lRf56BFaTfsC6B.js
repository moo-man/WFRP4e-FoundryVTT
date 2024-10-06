const type = await ValueDialog.create({
  title: game.i18n.localize("SCRIPT.FellstaveDialogTitle"),
  text: game.i18n.localize("SCRIPT.FellstaveDialogText")
}, "");

await this.effect.item.update({name: `${this.effect.item.name} (${type})`});
const updates = this.effect.item.effects.map(e => {
  return {_id: e.id, name: e.name + ` (${type})`}
});
this.effect.item.updateEmbeddedDocuments("ActiveEffect", updates);