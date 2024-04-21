this.actor.setupCharacteristic("i", {skipTargets: true, appendTitle :  " - " + this.effect.name}).then(test => {
    test.roll();
})