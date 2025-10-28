if (["dragon"].includes(args.opposedTest.defender.details.species.value.toLowerCase()))
    {
      args.modifiers.other.push({label : this.effect.name, details : "Double Wounds vs Dragons", value : args.totalWoundLoss});
      args.totalWoundLoss *=2;
    }