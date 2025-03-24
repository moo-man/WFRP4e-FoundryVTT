const chanties = await warhammer.utility.findAllItems('wfrp4e-soc.chanty', "Loading Chanties", true);
let choice = await ItemDialog.create(chanties, 1, {text : "Choose Chanty", title : this.effect.name});
if (choice.length) 
{
  this.actor.addEffectItems(choice.map(i => i.uuid), this.effect)
}