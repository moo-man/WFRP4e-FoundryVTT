if (!args.messageSent)
{ 
  args.messageSent = true;
  let runes = this.actor.effects.contents.filter(i => i.name == this.effect.name);
   this.script.message(`<strong>${args.attacker.speaker.alias}</strong> reduce Run speed by ${runes.length * 4} yds.`)
}