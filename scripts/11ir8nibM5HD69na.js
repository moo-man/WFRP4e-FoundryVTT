const balanced = game.i18n.localize("WFRP4E.YenluiBalanced");
const light = game.i18n.localize("WFRP4E.YenluiLight");
const dark = game.i18n.localize("WFRP4E.YenluiDark");

let newName, newDescription;

if (this.effect.name === game.i18n.localize("WFRP4E.YenluiDark")) {
  newName = game.i18n.localize("WFRP4E.YenluiBalanced");
  newDescription = game.i18n.localize("WFRP4E.YenluiBalancedDesc");
} else if (this.effect.name === game.i18n.localize("WFRP4E.YenluiBalanced")) {
  newName = game.i18n.localize("WFRP4E.YenluiLight");
  newDescription = game.i18n.localize("WFRP4E.YenluiLightDesc");
}

if (newName) {
  await this.effect.update({name: newName});
  await this.item.update({name: newName, "system.description.value": newDescription});
}