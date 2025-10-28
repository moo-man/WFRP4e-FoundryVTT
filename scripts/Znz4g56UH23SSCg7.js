if (!args.messageSent)
{
  args.messageSent = true;
  let advantage = this.item.effects.filter(i => i.name == this.effect.name).length;
  this.actor.setAdvantage(advantage)
  this.script.message(`Allies within 6 yards gain ${advantage} Advantage`)
}