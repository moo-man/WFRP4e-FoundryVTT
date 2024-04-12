let test = await this.actor.setupSkill(game.i18n.localize("NAME.Athletics"), {fields : {difficulty : "difficult"}, appendTitle : " - Walking"})
test.roll();