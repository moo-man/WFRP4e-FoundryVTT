let test = await args.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  " - " + this.effect.name, context: { failure: "Gained a Broken Condition", success: "Resisted the Broken Condition" } })

 await test.roll();

 if (!test.succeeded)
 {
    args.actor.addCondition("broken");
 }