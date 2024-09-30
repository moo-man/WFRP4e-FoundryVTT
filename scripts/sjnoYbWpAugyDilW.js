let test = await args.actor.setupSkill("Charm",  {
    appendTitle: ` – ${this.effect.name}`,
    skipTargets: true,
    fields: {difficulty: 'average'},
    characteristic: 'fel',
    context: {
        success: "Animal becomes docile towards Humans, Elves who honour Isha, and similar allies."
    }
});
await test.roll();