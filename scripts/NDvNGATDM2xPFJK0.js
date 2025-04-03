brokenbone = await fromUuid("Compendium.wfrp4e-core.items.hCadFsTRvLN9faaY")
teeth = await fromUuid("Compendium.wfrp4e-core.items.fBcZhOBn8IpoVqQ1")
tongue = await fromUuid("Compendium.wfrp4e-core.items.rkJA1DlK51QuRlJy")
brokenbone = brokenbone.toObject();
teeth = teeth.toObject();
tongue = tongue.toObject();


let roll = await new Roll("1d10").roll({allowInteractive : false});
roll.toMessage(this.script.getChatData({flavor : "Teeth Lost"}))

teeth.system.location.value = `${roll.total} ${teeth.system.location.value}`
brokenbone.system.location.value = "Jaw"
this.actor.createEmbeddedDocuments("Item", [brokenbone, teeth, tongue])

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty : "vhard"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
    this.actor.addCondition("unconscious")
}