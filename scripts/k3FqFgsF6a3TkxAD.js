let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle : ` - ${this.effect.name}`})
test.roll();
return true;