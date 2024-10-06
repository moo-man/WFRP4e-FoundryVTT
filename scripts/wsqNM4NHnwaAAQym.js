    args.applyAP = false;

    this.script.notification("This test only applies to criminals, otherwise close the dialog.");
    this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "average"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`}).then(async test => 
    {
      await test.roll();
      if (test.failed)
      {
        args.actor.addCondition("unconscious");
      }
    });