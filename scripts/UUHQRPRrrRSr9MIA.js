const venomFlag = this.effect.getFlag("wfrp4e-tribes", "venom");

if (venomFlag) {
  this.actor.updateEmbeddedDocuments("Item", [venomFlag]);
}