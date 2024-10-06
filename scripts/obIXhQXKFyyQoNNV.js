this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle: ` - ${this.effect.name}`, fields: { difficulty: "average" } }).then(async test => {
    await test.roll()
    if (test.failed) {
        this.actor.modifyWounds(-1);
        this.script.message("Takes 1 Damage")
    }
})