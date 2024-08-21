let caster = this.effect.sourceActor

if (caster)
{
    let bonus = caster.system.characteristics.wp.bonus
    this.actor.modifyWounds(bonus)

    this.script.message(`<strong>${this.actor.prototypeToken.name}</strong> regains ${bonus} Wounds`)
}