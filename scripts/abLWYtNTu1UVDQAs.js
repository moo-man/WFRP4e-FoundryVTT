if (args.opposedTest.result.hitloc.value == this.effect.flags.wfrp4e.location) // e.g. 'head', rLeg, 'lArm'
{
     this.message(`Gains a @Condition[Blinded] condition as their <strong>${this.item.name}</strong> was hit`);
     this.actor.addCondition("blinded");
}