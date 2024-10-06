const diff = foundry.utils.diffObject(this.item.toObject(), args.data);
if (args.data?.system?.APdamage?.head > this.item.system.APdamage.head) {
  const result = await game.wfrp4e.tables.rollTable('armet-damage');
  this.script.message(result.result);
  if (result.total > 5) 
    delete args.data.system.APdamage.head;
}