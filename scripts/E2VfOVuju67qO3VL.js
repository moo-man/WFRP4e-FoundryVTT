let blinded = this.actor.hasCondition("blinded");
if (blinded.getFlag("wfrp4e", "nightshroud"))
{
    blinded.delete()
}