if (!args.test.preData.options?.kingship) return

if (!this.item.equipped.value || !args.test.item) return;
if ([game.i18n.localize("NAME.Charm"), 
    game.i18n.localize("NAME.Intimidate"), 
    game.i18n.localize("NAME.Leadership")].includes(args.test.item.name))
{
    args.test.preData.canReverse = true
}