if (!args.test.weapon?.name.includes("Drakefire"))
{
    args.test.result.misfire = game.i18n.localize("Misfire");
    args.test.result.misfireDamage = (0, eval)(parseInt(args.test.result.roll.toString().split('').pop()) + args.test.weapon.system.Damage);
}