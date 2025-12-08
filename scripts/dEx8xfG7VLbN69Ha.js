if (!this.item.system.properties.flaws.reload) return;

const minReload = this.item.system.properties.qualities?.salvo ? 1 : 0;
const originalReload = this.item.system.properties.flaws.reload.value;
const runesOfReloading = Number(this.item.effects.contents.filter(e => e.name == this.effect.name).length);
const newReload = Math.max(originalReload - (2 * runesOfReloading), minReload);

if (newReload) {
  this.item.system.properties.flaws.reload.value = newReload;
  this.item.system.properties.flaws.reload.display = `${game.i18n.localize("PROPERTY.Reload")} ${newReload}`;
}
else {
  delete this.item.system.properties.flaws.reload
}