if (this.actor.hasCondition("surprised"))
{
    this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "average"}, skipTargets: true, appendTitle :  " - " + this.effect.name}).then(test => test.roll())
}
