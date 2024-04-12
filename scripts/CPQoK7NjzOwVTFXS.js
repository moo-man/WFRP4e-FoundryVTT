for(let effect of this.actor.effects.filter(e => e.isCondition))
{
    if (effect.isCondition)
    {
        effect.delete();
    }
}