let sl = this.effect.sourceTest.result.slOver;

this.actor.system.characteristics.s.modifier += sl * 10;
this.actor.system.characteristics.s.calculationBonusModifier -= sl;