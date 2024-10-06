let caster = this.effect.sourceActor;
if (caster)
{
    let healed= caster.system.characteristics.wp.bonus + caster.system.characteristics.int.bonus
    await this.actor.modifyWounds(healed);
    this.script.message(`<strong>${this.actor.prototypeToken.name}</strong> regains ${healed} Wounds`)
}
 
 let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "vhard"}, context : {success : "1 Corruption point that was gained within the last hour is removed.", failure: "Nothing happens"}})
 await test.roll();