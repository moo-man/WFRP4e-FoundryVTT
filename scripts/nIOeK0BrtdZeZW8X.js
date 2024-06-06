console.log("SKILL", this)

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "challenging"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();

let rollD10 = await new Roll("1d10").roll()
rollD10.toMessage(this.script.getChatData())


if (test.succeeded)
{
  //...
}
else if (test.failed)
{
  //...
}
