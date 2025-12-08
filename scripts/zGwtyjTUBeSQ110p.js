if (args.opposedTest.attackerTest.preData.charging) 
{
  let mostProtectedLoc;
  let mostProtectedValue = 0;
  for (let loc in this.actor.status.armour) 
  {
    if (this.actor.status.armour[loc].value != undefined && this.actor.status.armour[loc].value > mostProtectedValue) 
    {
      mostProtectedLoc = loc;
      mostProtectedValue = this.actor.status.armour[loc].value;
    }
  }
  if (mostProtectedValue)
  {
    args.modifiers.other.push({label: this.effect.name, value : mostProtectedValue});
  }
}