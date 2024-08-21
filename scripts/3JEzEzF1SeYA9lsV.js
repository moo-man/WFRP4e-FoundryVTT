let choice = await ItemDialog.create(ItemDialog.objectToArray(game.wfrp4e.config.locations, this.effect.img), 1, "Choose Location");
if (choice[0])
{
    this.effect.updateSource({name : `${this.effect.name} (${choice[0].name})`})
this.effect.updateSource({"flags.wfrp4e.location" : choice[0].id})
}

let location = choice[0].id;

if (["lArm", "rArm"].includes(location))
{
    let dropped = this.actor.itemTypes.weapon.filter(i => i.isEquipped & i.system.usesHands.includes(location));

    if (dropped.length)
    {
        this.script.notification(`Dropped ${dropped.map(i => i.name).join(", ")}!`)
        for(let weapon of dropped)
        {
            await weapon.system.toggleEquip();
        }
    }
}

if (location == "body")
{
    await this.actor.addCondition("fatigued");
    test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "hard"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
    await test.roll();
    if (test.failed)
    {
        this.actor.addCondition("prone");
    }
}

if (location == "head")
{
    await this.actor.addCondition("stunned");
    test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "average"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
    await test.roll();
    if (test.failed)
    {
        this.actor.addCondition("unconscious");
    }
}