if (this.actor.hasCondition("surprised"))
{
    this.actor.removeCondition("surprised")
    this.script.message(`Cannot be Surprised`);
}