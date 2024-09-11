if ( args.totalWoundLoss > 0 ) {
    let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {difficulty: "average"})
    await test.roll();
    if (!test.succeeded)
    {   
        this.actor.addSystemEffect("gangrene");
    }
}