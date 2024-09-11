let test = await this.actor.setupCharacteristic("t", { appendTitle: ` - ${this.effect.name}`, fields: { difficulty: "challenging" } })
await test.roll();

if (test.failed) 
{
    let ageAdded = Math.ceil(CONFIG.Dice.randomUniform() * 10) + Math.ceil(CONFIG.Dice.randomUniform() * 10)
    let ws = Math.ceil(CONFIG.Dice.randomUniform() * 10)
    let bs = Math.ceil(CONFIG.Dice.randomUniform() * 10)
    let s = Math.ceil(CONFIG.Dice.randomUniform() * 10)
    let t = Math.ceil(CONFIG.Dice.randomUniform() * 10)
    let ag = Math.ceil(CONFIG.Dice.randomUniform() * 10)
    let dex = Math.ceil(CONFIG.Dice.randomUniform() * 10)

    let currentAge = parseInt(this.actor.system.details.age.value)

    let inline = `<a class="inline-roll" data-tooltip="@TT"><i class="fas fa-dice-d20"></i>@ROLL</a>`
    let msg =
        `<p><b>${this.actor.prototypeToken.name}</b> ages by ${inline.replace("@ROLL", ageAdded).replace("@TT", "2d10")} and loses</p>
      <p>${inline.replace("@ROLL", ws).replace("@TT", "1d10")} <b>Weapon Skill</b></p>
      <p>${inline.replace("@ROLL", bs).replace("@TT", "1d10")} <b>Ballistic Skill</b></p>
      <p>${inline.replace("@ROLL", s).replace("@TT", "1d10")} <b>Strength</b></p>
      <p>${inline.replace("@ROLL", t).replace("@TT", "1d10")} <b>Toughness</b></p>
      <p>${inline.replace("@ROLL", ag).replace("@TT", "1d10")} <b>Agility</b></p>
      <p>${inline.replace("@ROLL", dex).replace("@TT", "1d10")} <b>Dexterity</b></p>
 `
    this.script.message(msg);

    let characteristics = foundry.utils.duplicate(this.actor.system.characteristics)

    characteristics.ws.initial -= ws
    characteristics.bs.initial -= bs
    characteristics.s.initial -= s
    characteristics.t.initial -= t
    characteristics.ag.initial -= ag
    characteristics.dex.initial -= dex

    this.actor.update({ "system.characteristics": characteristics, "data.details.age.value": ageAdded + currentAge })
}