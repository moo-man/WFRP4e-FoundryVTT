let wounds = this.effect.sourceActor.system.characteristics.wp.bonus * (1 + (Math.floor(this.effect.sourceTest?.result.slOver / 3) || 0));
this.actor.modifyWounds(wounds);
this.script.message(`Healed ${wounds} Wounds`);