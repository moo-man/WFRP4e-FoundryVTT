let actorSize = game.wfrp4e.config.actorSizeNums[args.actor.details.size.value]
let attackerSize = game.wfrp4e.config.actorSizeNums[args.attacker.details.size.value]

if (attackerSize > actorSize)
{
   let msg = `<b>Tongue Attack</b>: ${args.actor.prototypeToken.name} is now @Condition[Entangled]`;
   await args.actor.addCondition("entangled");
   if (actorSize <= 2)
   {
       msg += `and @Condition[Engaged]`
   }
   this.script.message(msg, {speaker : {alias: args.attacker.prototypeToken.name}})
}