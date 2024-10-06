let cured = await Dialog.wait({
    title : this.effect.name,
    content : "<p>Enter the number of diseases/poisons cured</p><input type='number'>",
    buttons : {
        confirm : {
            label : "Confirm",
            callback : (dlg) => {
                let input = dlg.find("input");
                value = parseInt(input[0].value);
                return value;
            }
        }
    }
})


let damage = 0;

let rolls = new Array(cured).fill("").map(i => `max(0, 1d10 - ${this.actor.system.characteristics.fel.bonus})`)

let test = new Roll(`${rolls.join(" + ")}`);
await test.roll();
test.toMessage({speaker : {alias : this.actor.name}, flavor : this.effect.name});
this.script.message(await this.actor.applyBasicDamage(test.total, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true }))