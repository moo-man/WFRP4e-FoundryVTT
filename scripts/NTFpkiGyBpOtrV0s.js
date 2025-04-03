if (this.actor.uuid == this.effect.sourceActor.uuid)
{
	return;
}

if (this.actor.has("Cold Blooded") && !this.actor.hasSystemEffect("nausea")) { 
  let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : `- ${this.effect.name}`})
await test.roll();
if (test.failed)
{

  let myRoll = await new Roll("1d10").roll({allowInteractive : false});
  let duration = myRoll.total
  this.actor.addSystemEffect("nausea");
  this.script.scriptMessage(`Nausea symptom added, duration : ${duration} hours`);
}
}
return false;