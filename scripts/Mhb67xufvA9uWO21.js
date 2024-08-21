let actorSize = game.wfrp4e.config.actorSizeNums[args.actor.details.size.value]
let attackerSize = game.wfrp4e.config.actorSizeNums[args.attacker.details.size.value]

if (attackerSize > actorSize)
{
   args.actor.addCondition("prone")
   this.script.message(`<strong>Tail Attack</strong>: ${args.actor.prototypeToken.name} is now <strong>Prone</strong>`)
}