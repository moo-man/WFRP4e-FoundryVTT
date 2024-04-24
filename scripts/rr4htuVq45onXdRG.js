let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle: ` - ${this.effect.name}`, fields : {difficulty : "average"}})
test.roll();