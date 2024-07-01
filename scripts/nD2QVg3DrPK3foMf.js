args.actor.setupSkill(game.i18n.localize("NAME.Dodge"), { fields: { difficulty: "average" } }).then(async test => {
      await test.roll();
      if (test.failed) {
        await args.actor.addCondition("bleeding")
        await args.actor.addCondition("entangled")
      }
    })