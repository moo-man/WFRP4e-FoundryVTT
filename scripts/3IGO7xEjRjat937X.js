let fatigue = this.actor.hasCondition("fatigued")
if (fatigue)
{
   this.script.scriptNotification("Removing Fatigued Condition, disabled effect")
    this.effect.update({disabled : true})
   await this.actor.removeCondition("fatigued")
}