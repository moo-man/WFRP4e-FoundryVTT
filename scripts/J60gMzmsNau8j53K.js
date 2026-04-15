const excessSL = this.effect.sourceTest.result.baseSL - this.effect.sourceItem.system.sl;
await this.effect.update({duration:{rounds: this.actor.system.characteristics.ag.bonus + excessSL}});