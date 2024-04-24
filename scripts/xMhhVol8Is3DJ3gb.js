if (this.effect.sourceTest.succeeded)
{
    let blinded = 1 + this.effect.sourceTest.result.overcast.usage.other.count
    this.actor.addCondition("blinded", blinded)
}