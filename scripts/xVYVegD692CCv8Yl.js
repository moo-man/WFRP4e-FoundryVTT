let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "hard"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();

let newFortune = Math.max(0, this.actor.status.fortune.value - 1)
this.actor.update({ "system.status.fortune.value": newFortune  });

if (test.failed)
{ 
  let char = this.effect.sourceActor.characteristics;
  let duration = Math.floor((char.wp.initial + char.wp.advances)/10) ;
  this.script.message("<strong>Fatethief</strong> has been applied for " + duration + " days"); 
}