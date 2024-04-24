let caster = this.effect.sourceActor;

this.actor.modifyWounds(caster.system.characteristics.fel.bonus);

this.script.scriptMessage(`Healed ${caster.system.characteristics.fel.bonus} Wounds`);