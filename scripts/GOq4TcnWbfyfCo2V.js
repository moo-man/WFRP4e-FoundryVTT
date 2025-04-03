this.script.notification(`Healed ${this.actor.characteristics.t.bonus * 2} Wounds`)
await this.actor.modifyWounds(this.actor.characteristics.t.bonus * 2)

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - Side Effects`,fields : {difficulty : "difficult"}})
await test.roll();
if (test.failed)
{
    let roll = await new Roll("1d10").roll({allowInteractive : false});
    await roll.toMessage(this.script.getChatData())
    if (roll.total <= 3)
    {
        this.actor.addCondition("blinded", 3)
    }
    else if (roll.total <= 6)
    {
        this.actor.addCondition("broken");
    }
    else if (roll.total <= 9)
    {
        this.actor.addCondition("stunned");
    }
    else if (roll.total == 10)
    {
        this.actor.addConditon("unconscious")
    }
}