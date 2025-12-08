let blows = this.item.getFlag("wfrp4e", "blows") || 0
let difficulties = Object.keys(game.wfrp4e.config.difficultyLabels)

blows = Math.clamp(blows, 0, difficulties.length - 1)
if (this.item.system.protects[args.opposedTest.result.hitloc.value])
{
    let difficulty = difficulties[blows];
    this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields: {difficulty}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`}).then(async test => {
        await test.roll();
        if (test.failed)
        {
            this.script.message(`${this.actor.name} must break from combat and flee until they pass a <strong>Challenging (+0) Willpower</strong> Test`);
            this.item.setFlag("wfrp4e", "failedCool", true);
        }
    })
}