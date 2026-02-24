const test = await actor.setupSkill('Cool',  {
  appendTitle: ` – ${this.effect.name}`,
  skipTargets: true,
  fields: {difficulty: 'difficult'},
  characteristic: 'wp',
  context: {
    failure: "You became beguiled by the eerie singing and unable to perform any action except moving towards the Oceanid. You count as Helpless."
  }
});
await test.roll();