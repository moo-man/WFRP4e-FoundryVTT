if (parseInt(this.effect.sourceTest.result.SL) >= 3)
{
     this.actor.modifyWounds(this.actor.system.characteristics.t.bonus * 2)
}
else 
{
   this.actor.modifyWounds(this.actor.system.characteristics.t.bonus)
}