import WFRP_Audio from "./audio-wfrp4e.js";

export default class OpposedTest {
  constructor(attackerTestData = undefined, defenderTestData = undefined, opposeResult = {}) {
    this.data = {
      attackerTestData,
      defenderTestData,
      opposeResult
    }

    this.attackerTest = this._createTest(attackerTestData);
    this.defenderTest = this._createTest(defenderTestData);
  }
  get opposeResult() { return this.data.opposeResult }
  get result() { return this.data.opposeResult }
  get attacker() { return this.attackerTest.actor }
  get defender() { return this.defenderTest.defender }

  _createTest(testData) {
    if (!testData)
      return testData
    let test = game.wfrp4e.rolls.TestWFRP.recreate(testData)
    test.data = testData
    return test
  }

  createAttackerTest(testData) {
    this.attackerTest = this._createTest(testData)
    this.data.attackerTestData = testData
  }

  createDefenderTest(testData) {
    this.defenderTest = this._createTest(testData)
    this.data.defenderTestData = testData
  }

  createUnopposedDefender(actor) {
    this.defenderTest = new game.wfrp4e.rolls.CharacteristicTest({
      item: "ws",
      SL: 0,
      target: 0,
      roll: 0,
      unopposedTarget: true,
    }, actor)
    this.defenderTest.data.context.unopposed = true;
    this.data.defenderTestData = this.defenderTest.data
  }


  /*Known Bugs: attempting to reroll causes it to not reroll at all, actually. Manually editing cards causes a duplicate result card at the end.
*
*
*
*/
  checkPostModifiers() {

    let didModifyAttacker = false, didModifyDefender = false;

    let modifiers = {
      attacker: {
        target: 0,
        SL: 0
      },
      defender: {
        target: 0,
        SL: 0
      },
      message: []
    }

    // Things to Check:
    // Weapon Length DONE
    // Fast Weapon Property DONE
    // Size 
    // Done - Weapon Defending: You suﬀer a penalty of –2 SL for each step larger your opponent is when using Melee to defend an Opposed Test
    // Done - To Hit Modifiers: +10 Bonus if smaller
    // Done - Ranged to Hit Modifiers : You gain a hefty bonus when shooting at larger targets (Ex. +40 to hit Enormous).
    //Shooting at smaller targets?

    if (game.settings.get("wfrp4e", "weaponLength") && this.attackerTest.weapon && this.defenderTest.weapon && this.attackerTest.weapon.attackType == "melee" && this.defenderTest.weapon.attackType == "melee") {
      let attackerReach = this.attackerTest.item.reachNum;
      let defenderReach = this.defenderTest.item.reachNum;
      if (defenderReach > attackerReach && !this.attackerTest.result.infighter) {
        didModifyAttacker = true;
        modifiers.message.push(game.i18n.format(game.i18n.localize('CHAT.TestModifiers.WeaponLength'), { defender: this.defenderTest.actor.data.token.name, attacker: this.attackerTest.actor.data.token.name }))
        modifiers.attacker.target += -10;
      }
    }


    //Apply the modifiers
    if (didModifyAttacker || didModifyDefender) {
      modifiers.message.push(game.i18n.localize('CHAT.TestModifiers.FinalModifiersTitle'))
      if (didModifyAttacker)
        modifiers.message.push(`${game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FinalModifiers'), { target: modifiers.attacker.target, sl: modifiers.attacker.SL, name: this.attackerTest.actor.data.token.name })}`)
      if (didModifyDefender)
        modifiers.message.push(`${game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FinalModifiers'), { target: modifiers.defender.target, sl: modifiers.defender.SL, name: this.defenderTest.actor.data.token.name })}`)
    }
    return mergeObject(modifiers, { didModifyAttacker, didModifyDefender });
  }

  /**
    * Main Opposed test evaluation logic. Takes attacker and defender test data and 
    * determines who won, by how much, etc. Displays who won accordingly, with different
    * logic for manual and targeted opposed tests
    * 
    * @param {Object} attacker Attacker data
    * @param {Object} defender Defender Data
    * @param {Object} options Targeted?
    */
  async evaluate() {
    try {
      let opposeResult = this.result
      let attackerTest = this.attackerTest
      let defenderTest = this.defenderTest

      let soundContext = {};
      opposeResult.other = [];


      let attacker = this.attackerTest.actor
      let defender = this.defenderTest.actor


      attacker.runEffects("preOpposedAttacker", { attackerTest, defenderTest, opposedTest: this })
      defender.runEffects("preOpposedDefender", { attackerTest, defenderTest, opposedTest: this })


      opposeResult.modifiers = this.checkPostModifiers(attackerTest, defenderTest);

      // Redo the test with modifiers
      if (opposeResult.modifiers.didModifyAttacker) {
        attackerTest.preData.roll = attackerTest.result.roll
        attackerTest.preData.postOpposedModifiers = opposeResult.modifiers.attacker
        attackerTest.preData.hitloc = attackerTest.result.hitloc?.roll;
        attackerTest = game.wfrp4e.rolls.TestWFRP.recreate(attackerTest.data)
        await attackerTest.roll()
      }

      // Redo the test with modifiers
      if (opposeResult.modifiers.didModifyDefender) {
        defenderTest.preData.roll = defenderTest.result.roll
        defenderTest.preData.postOpposedModifiers = opposeResult.modifiers.defender
        defenderTest.preData.hitloc = defenderTest.result.hitloc?.roll;
        defenderTest = game.wfrp4e.rolls.TestWFRP.recreate(defenderTest.data)
        await defenderTest.roll()
      }
      else if (defenderTest.context.unopposed)
        await defenderTest.roll()

      opposeResult.other = opposeResult.other.concat(opposeResult.modifiers.message);

      let attackerSL = parseInt(attackerTest.result.SL);
      let defenderSL = parseInt(defenderTest.result.SL);
      opposeResult.differenceSL = 0;

      // If attacker has more SL OR the SLs are equal and the attacker's target number is greater than the defender's, then attacker wins. 
      // Note: I know this isn't technically correct by the book, where it states you use the tested characteristic/skill, not the target number, i'll be honest, I don't really care.
      if (attackerSL > defenderSL || (attackerSL === defenderSL && (attackerTest.target > defenderTest.target || (attackerTest.outcome == "success" && defenderTest.context.unopposed)))) {
        opposeResult.winner = "attacker"
        opposeResult.differenceSL = attackerSL - defenderSL;

        // If Damage is a numerical value
        if (Number.isNumeric(attackerTest.damage)) {
          let damage = this.calculateOpposedDamage();
          opposeResult.damage = {
            description: `<b>${game.i18n.localize("Damage")}</b>: ${damage}`,
            value: damage
          };
        }
        // If attacker is using a weapon or trait but there wasn't a numerical damage value, output unknown
        else if (attackerTest.weapon || attackerTest.trait) {
          opposeResult.damage = {
            description: `<b>${game.i18n.localize("Damage")}</b>: ?`,
            value: null
          };
        }
        if (attackerTest.hitloc) {
          // Remap the hit location roll to the defender's hit location table, note the change if it is different
          let remappedHitLoc = await game.wfrp4e.tables.rollTable(defender.details.hitLocationTable.value, { lookup: attackerTest.hitloc.roll, hideDSN: true })
          if (remappedHitLoc.description != attackerTest.hitloc.description) {
            remappedHitLoc.description = remappedHitLoc.description + " (Remapped)"
            remappedHitLoc.remapped = true;
            attackerTest.result.hitloc = remappedHitLoc
          }

          opposeResult.hitloc = {
            description: `<b>${game.i18n.localize("ROLL.HitLocation")}</b>: ${attackerTest.hitloc.description}`,
            value: attackerTest.hitloc.result
          };
        }

        try // SOUND
        {
          if (attackerTest.weapon.weaponGroup.value === "bow"
            || attackerTest.weapon.weaponGroup.value === "crossbow") {
            soundContext = { item: attackerTest.weapon, action: "hit" }
          }
          if (attackerTest.weapon.weaponGroup.value == "throwing") {
            soundContext.item = { type: "throw" }
            if (attackerTest.weapon.properties.qualities.hack) {
              soundContext.item = { type: "throw_axe" }
            }
          }
        }
        catch (e) { console.log("wfrp4e | Sound Context Error: " + e) } // Ignore sound errors
      }
      else // Defender won
      {
        try {
          if (attackerTest.weapon
            && (attackerTest.weapon.weaponGroup.value === "bow"
              || attackerTest.weapon.weaponGroup.value === "crossbow"
              || attackerTest.weapon.weaponGroup.value === "blackpowder"
              || attackerTest.weapon.weaponGroup.value === "engineering")) {
            soundContext = { item: attackerTest.weapon, action: "miss" }
          }
          if (defenderTest.weapon && defenderTest.weapon.properties.qualities.shield) {
            if (attackerTest.weapon.attackType == "melee") {
              soundContext = { item: { type: "shield" }, action: "miss_melee" }
            }
            else {
              if (attackerTest.weapon.weaponGroup.value === "bow"
                || attackerTest.weapon.weaponGroup.value === "sling"
                || attackerTest.weapon.weaponGroup.value === "throwing"
                || attackerTest.weapon.weaponGroup.value === "crossbow") {
                soundContext = { item: { type: "shield" }, action: "miss_ranged" }
              }
            }
          }
        }
        catch (e) { console.log("wfrp4e | Sound Context Error: " + e) } // Ignore sound errors


        opposeResult.winner = "defender"
        opposeResult.differenceSL = defenderSL - attackerSL;

        let riposte;
        if (defenderTest.weapon)
          riposte = defenderTest.result.riposte && !!defenderTest.weapon.properties.qualities.fast

        if (defenderTest.result.champion || riposte) {
          let temp = duplicate(defenderTest.data);
          this.defenderTest = game.wfrp4e.rolls.TestWFRP.recreate(attackerTest.data);
          this.attackerTest = game.wfrp4e.rolls.TestWFRP.recreate(temp)
          this.data.attackerTestData = this.attackerTest.data
          this.data.defenderTestData = this.defenderTest.data
          let damage = this.calculateOpposedDamage();
          opposeResult.damage = {
            description: `<b>${game.i18n.localize("Damage")} (${riposte ? game.i18n.localize("NAME.Riposte") : game.i18n.localize("NAME.Champion")})</b>: ${damage}`,
            value: damage
          };
          let hitloc = await game.wfrp4e.tables.rollTable(defenderTest.actor.details.hitLocationTable.value)

          opposeResult.hitloc = {
            description: `<b>${game.i18n.localize("ROLL.HitLocation")}</b>: ${hitloc.description}`,
            value: hitloc.result
          };
          opposeResult.swapped = true;

          soundContext = { item: { type: "weapon" }, action: "hit" }
        }
      }

      attacker.runEffects("opposedAttacker", { opposedTest: this, attackerTest, defenderTest })
      if (defender)
        defender.runEffects("opposedDefender", { opposedTest: this, attackerTest, defenderTest })

      Hooks.call("wfrp4e:opposedTestResult", this, attackerTest, defenderTest)
      WFRP_Audio.PlayContextAudio(soundContext)

      return opposeResult

    }
    catch (err) {
      ui.notifications.error(`${game.i18n.localize("ErrorOpposed")}: ` + err)
      console.error("Could not complete opposed test: " + err)
    }
  }


  calculateOpposedDamage() {
    // Calculate size damage multiplier 
    let damageMultiplier = 1;
    let sizeDiff

    sizeDiff = game.wfrp4e.config.actorSizeNums[this.attackerTest.size] - game.wfrp4e.config.actorSizeNums[this.defenderTest.size]

    if (this.attackerTest.actor.getItemTypes("trait").find(i => i.name == game.i18n.localize("NAME.Swarm") && i.included) || this.defenderTest.actor.getItemTypes("trait").find(i => i.name == game.i18n.localize("NAME.Swarm")))
      sizeDiff = 0

    damageMultiplier = sizeDiff >= 2 ? sizeDiff : 1


    let opposedSL = Number(this.attackerTest.result.SL) - Number(this.defenderTest.result.SL)
    let item = this.attackerTest.item

    let damage
    if (this.attackerTest.useMount)
      damage = item.mountDamage
    else
      damage = item.Damage

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooSLDamage")) {
      game.wfrp4e.utility.logHomebrew("mooSLDamage")
      opposedSL = Number(this.attackerTest.result.SL)
    }
    //@/HOUSE

    damage += (opposedSL + (this.attackerTest.result.additionalDamage || 0));

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooRangedDamage"))
    {
      game.wfrp4e.utility.logHomebrew("mooRangedDamage")
      if (this.attackerTest.item && this.attackerTest.item.attackType == "ranged")
      {
        damage -= (Math.floor(this.attackerTest.targetModifiers / 10) || 0)
        if (damage < 0)
          damage = 0
      }
    }
    //@/HOUSE

    let effectArgs = { damage, damageMultiplier, sizeDiff, opposedTest: this }
    this.attackerTest.actor.runEffects("calculateOpposedDamage", effectArgs);
    ({ damage, damageMultiplier, sizeDiff } = effectArgs)

    if (game.settings.get("wfrp4e", "mooSizeDamage"))
      return damage

    let addDamaging = false;
    let addImpact = false;
    if (this.attackerTest.trait) {
      if (sizeDiff >= 1)
        addDamaging = true;
      if (sizeDiff >= 2)
        addImpact = true;
    }

    let hasDamaging = false;
    let hasImpact = false;
    if (this.attackerTest.weapon) {
      hasDamaging = this.attackerTest.weapon.properties.qualities.damaging
      hasImpact = this.attackerTest.weapon.properties.qualities.impact

      if (this.attackerTest.result.charging || !this.attackerTest.weapon.properties.flaws.tiring) {
        if (hasDamaging)
          addDamaging = true;
        if (hasImpact)
          addImpact = true;
      }

      if (sizeDiff >= 1)
        addDamaging = true;
      if (sizeDiff >= 2)
        addImpact = true;
    }

    if (addDamaging) {
      let unitValue = Number(this.attackerTest.result.roll.toString().split("").pop())
      if (unitValue === 0)
        unitValue = 10;

      if (unitValue > opposedSL) {
        damage = damage - opposedSL + unitValue; // replace opposedSL with unit value
      }
    }
    if (addImpact) {
      let unitValue = Number(this.attackerTest.result.roll.toString().split("").pop())
      if (unitValue === 0)
        unitValue = 10;
      damage += unitValue
    }
    this.result.damaging = hasDamaging || addDamaging
    this.result.impact = hasImpact || addImpact
    return damage * damageMultiplier
  }

}