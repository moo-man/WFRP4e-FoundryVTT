// Get the size
let size = this.actor.sizeNum 
let diff = "difficult";
if (size < 5) { // 5 = Monstrous
   diff = "hard";
}
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : diff}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed) {
        this.actor.addSystemEffect("fear")
}