if (args.totalWoundLoss > 0)
{
    
    let test = await args.actor.setupCharacteristic("t",  {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "hard"}})
    await test.roll()
    if (test.failed)
    {
        args.totalWoundLoss += this.effect.sourceActor.system.characteristics.wp.bonus
        args.modifiers.other.push({label : this.effect.name, value : this.effect.sourceActor.system.characteristics.wp.bonus})
    }
}