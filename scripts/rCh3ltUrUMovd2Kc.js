if (this.actor.hasCondition("surprised"))
{
    this.script.notification("Cannot be surprised");
    this.actor.removeCondition("surprised");
}