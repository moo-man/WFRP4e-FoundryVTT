if (this.actor.hasCondition("surprised"))
{
    this.script.scriptNotification("Cannot be surprised");
    this.actor.removeCondition("surprised");
}