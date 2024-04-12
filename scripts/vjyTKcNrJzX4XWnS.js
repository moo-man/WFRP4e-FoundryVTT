let SL = parseInt(this.effect.sourceTest.result.SL)
if (SL < 0)
   SL = 0
this.actor.addCondition("fatigued", 1 + SL)