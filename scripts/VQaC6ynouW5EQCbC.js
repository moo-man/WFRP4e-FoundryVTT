let roll = await new Roll("1d10").roll();

await roll.toMessage(this.script.getChatData());

this.script.message(await this.actor.applyBasicDamage(roll.total, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}));

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  " - " + this.effect.name});
await test.roll();

if (test.succeeded)
{
    return false;
}