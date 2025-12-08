let resistances = this.actor.itemTags.talent.filter(i => i.name == game.i18n.localize("NAME.MagicResistanceTalent"));

for(let talent of resistances)
{
  talent.system.max.value = "custom";
  talent.system.max.formula = "@characteristics.t.bonus + 2"
}