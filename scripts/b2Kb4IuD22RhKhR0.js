let actor = Array.from(game.user.targets)[0]?.actor;

if (actor)
{
    actor.applyEffect({effectUuids : this.effect.sourceItem.effects.contents[0].uuid})
}
else
{
    this.script.notification("No target!", "error")
}