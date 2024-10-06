let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "difficult"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed) {
        this.actor.addCondition("stunned");
}