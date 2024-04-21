let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();

if (test.failed)
{
    if (!this.actor.hasCondition("fatigued"))
    {
        await this.actor.addCondition("fatigued");
    }
    else
    {
        await this.actor.addCondition("blinded");
        await this.actor.addCondition("deafened");
    }
    
    if (((this.actor.hasCondition("blinded").conditionValue || 0) + (this.actor.hasCondition("deafened").conditionValue || 0)) > this.actor.system.characteristics.i.bonus)
    {
        await this.actor.addCondition("unconscious");        
    }
}