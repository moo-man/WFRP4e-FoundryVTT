let test = args.test
if (test && test.spell?.system.magicMissile.value)
{
  let roll = await new Roll("1d100").roll();
  roll.toMessage(this.script.getChatData());
  if (roll.total <= 30)
  {
    this.script.message(`<strong>${this.item.name}</strong>: Spell Fails!`)
  }
}