if (this.effect.sourceTest.result.outcome == "success")
{
    let blinded = 1 + this.effect.sourceTest.result.overcast.usage.other.count
    this.actor.addCondition("blinded", blinded)
}