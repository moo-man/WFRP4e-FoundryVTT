const deletes = this.actor.itemTags.armour.map(a => {
  return {_id: a._id}
});
const armourTrait = this.actor.itemTags.trait.find(t => t.name === game.i18n.localize("NAME.TraitArmour"));

if (armourTrait)
  deletes.push({_id: armourTrait._id});

this.actor.deleteEmbeddedDocuments("Item", deletes);