let actor = game.user.character ?? canvas.tokens.controlled[0]?.actor;
if (!actor || !(actor.system instanceof StandardActorModel))
  return ui.notifications.warn("You must control an Actor capable of performing a Strength Test");

let test = await actor.setupCharacteristic("s", {
  skipTargets: true, 
  appendTitle:  " - Bailing Out", 
  fields: {
    difficulty: "challenging"
  },
  context: {
    success: "Reduced the Holed rating!"
  }
});

await test.roll();
if (test.succeeded) {
  let SL = parseInt(test.result.SL);
  let name = this.effect.name.replace(/\d+/, rating => parseInt(rating) - SL);
  await this.effect.update({name});
}

let rating = parseInt(this.effect.name.match(/\d+/)?.[0]);
if (rating <= 1) {
  const scriptData = this.effect.system.scriptData
  scriptData[2].trigger = '';
  await this.effect.update({disabled: true, "system.scriptData": scriptData});
}