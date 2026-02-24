const balanced = game.i18n.localize("WFRP4E.YenluiBalanced");
const light = game.i18n.localize("WFRP4E.YenluiLight");
const dark = game.i18n.localize("WFRP4E.YenluiDark");

let newName;

if (this.effect.name === game.i18n.localize("WFRP4E.YenluiBalanced")) {
  newName = game.i18n.localize("WFRP4E.YenluiDark");
  newDescription = game.i18n.localize("WFRP4E.YenluiDarkDesc");
} else if (this.effect.name === game.i18n.localize("WFRP4E.YenluiLight")) {
  newName = game.i18n.localize("WFRP4E.YenluiBalanced");
  newDescription = game.i18n.localize("WFRP4E.YenluiBalancedDesc");
}

if (newName) {
  await this.effect.update({name: newName});
  await this.item.update({name: newName, "system.description.value": newDescription});
}