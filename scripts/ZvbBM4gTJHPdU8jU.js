let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "hard"}})
await test.roll();
return test.failed