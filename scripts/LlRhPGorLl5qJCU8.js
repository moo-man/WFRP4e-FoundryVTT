if (this.actor.hasCondition("prone")) 
{
    this.actor.addCondition("unconscious");
}
else 
{
    this.actor.addCondition("prone");
}