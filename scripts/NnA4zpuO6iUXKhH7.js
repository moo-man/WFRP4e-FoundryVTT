if ((args.opposedTest.attackerTest.item && args.opposedTest.attackerTest.item.isMelee) || (args.opposedTest.attackerTest.item && !args.opposedTest.attackerTest.item.name.includes(game.i18n.localize("NAME.Ranged"))))
{
    let AP = parseInt(this.effect.sourceTest.result.SL)
    args.modifiers.ap.value += AP;
    args.modifiers.ap.magical += AP;
    args.modifiers.ap.details.push(`${this.effect.name} (${AP})`)
}