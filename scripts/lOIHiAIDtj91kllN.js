const chanties = await WFRP_Utility.findAll('wfrp4e-soc.chanty');
let choice = await ItemDialog.create(chanties, 1, "Choose Chanty");
if (choice.length) {
  console.log(choice);
  this.actor.createEmbeddedDocuments("Item", choice, {fromEffect: this.effect.id});
}