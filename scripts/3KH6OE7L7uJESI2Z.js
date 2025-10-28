if (["dragon"].includes(args.opposedTest.defender.details.species.value.toLowerCase()))
    {
      args.applyTB = false;
      args.opposedTest.result.other.push("<b>Wyrmslayer</b>: Ignore TB vs Dragons")
    }