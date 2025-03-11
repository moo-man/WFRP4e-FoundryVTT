let value = parseInt(this.item.specification.value)
let name = this.actor.prototypeToken.name

if (game.user.isGM && game.user.targets.size)
{
  game.user.targets.forEach(t => {
    t.actor.applyTerror(value, name)
  })
  game.canvas.tokens.setTargets([])
}
else 
{
  game.wfrp4e.utility.postTerror(value, name)
}