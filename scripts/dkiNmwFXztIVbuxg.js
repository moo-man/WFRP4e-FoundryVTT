let currentCareer = this.actor.system.currentCareer;

if (!currentCareer || currentCareer.system.talents.includes(game.i18n.localize("NAME.Frenzy")))
{
    return
}

currentCareer.system.talents.push(game.i18n.localize("NAME.Frenzy"));