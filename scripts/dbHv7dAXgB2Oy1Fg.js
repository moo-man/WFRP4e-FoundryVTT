let nbBleeding = 1 + Number(this.effect.sourceTest.result.SL);
this.actor.removeCondition("bleeding", nbBleeding);
console.log(this.actor);
