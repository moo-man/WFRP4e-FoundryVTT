let wounds = this.effect.sourceActor.system.characteristics.wp.bonus;
this.actor.modifyWounds(wounds);
this.script.message(`Healed $[wounds} Wounds`);