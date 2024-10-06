// An imbiber must take a Consume Alcohol Test.
this.actor.setupSkill(game.i18n.localize("NAME.ConsumeAlcohol"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`}).then(async test => {
  await test.roll()
  // If they succeed, 
  // as a result of whatever potential futures they glimpse, 
  // they can spend a Fortune Point within the next hour to reverse the dice of any failed Test.
  if (test.succeeded) {
    this.script.message(`As a result of whatever potential futures they glimpse, <strong>${this.actor.prototypeToken.name}</strong> can spend a Fortune Point within the next hour to reverse the dice of any failed Test.`, 
    {
      whisper: ChatMessage.getWhisperRecipients("GM"), 
      blind: true 
    })    
  }
})