let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields: {difficulty: "hard"}})
await test.roll();
this.item.updateSource({"flags.wfrp4e.passed" : test.succeeded})