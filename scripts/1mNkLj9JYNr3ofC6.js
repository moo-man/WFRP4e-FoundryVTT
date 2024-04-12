this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle : ` - ${this.effect.name}`}).then(async test => {
    await test.roll();
    if (test.failed)
    {
        this.actor.addCondition("stunned", 3)
    }
})