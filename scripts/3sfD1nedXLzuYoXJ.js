if (this.actor.hasCondition("surprised"))
{
    this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "average"}, appendTitle : " - " + this.effect.name}).then(test => test.roll())
}
