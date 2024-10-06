let test = await this.actor.setupCharacteristic("wp", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();

// Kind of insane but whatever
let opposedResult = test.opposedMessages[0]?.system.opposedHandler?.resultMessage?.system.opposedTest?.result

return opposedResult?.winner == "attacker";