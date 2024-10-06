let caster = this.effect.sourceActor;

this.actor.modifyWounds(caster.system.characteristics.fel.bonus);

this.script.message(`Healed ${caster.system.characteristics.fel.bonus} Wounds`);