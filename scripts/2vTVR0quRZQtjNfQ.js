let currentCareer = this.actor.system.currentCareer;
if (!currentCareer)
{
    return;
}

let talents = [game.i18n.localize("NAME.AA"),
`${game.i18n.localize("NAME.ArcaneMagic")} (${game.i18n.localize("SPEC.Any")})`,
game.i18n.localize("NAME.ChaosMagic") + " " +  "(Tzeentch)",
game.i18n.localize("NAME.FastHands"),
game.i18n.localize("NAME.ID"),
game.i18n.localize("NAME.MagicalSense"),
game.i18n.localize("NAME.PettyMagic"),
game.i18n.localize("NAME.SecondSight"),
game.i18n.localize("NAME.WarWizard"),
game.i18n.localize("NAME.Witch")].filter(t => !currentCareer.system.talents.includes(t))

currentCareer.system.talents = currentCareer.system.talents.concat(talents)