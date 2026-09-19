import CharacteristicTest5e from "../rolls/5e/characteristic-test5e.js";
import WFRP_Audio from "../audio-wfrp4e.js";


export default class OpposedTest5e {
  constructor(attackerTest = undefined, defenderTest = undefined, opposeResult={}) {
    this.data = {
      attackerTestData: attackerTest?.data,
      defenderTestData: defenderTest?.data,
      opposeResult
    }

    this.attackerTest = attackerTest
    this.defenderTest = defenderTest;
  }
  get opposeResult() { return this.data.opposeResult }
  get result() { return this.data.opposeResult }
  get attacker() { return this.attackerTest.actor }
  get defender() { return this.defenderTest.actor }

  static recreate(data)
  {
    let opposedTest = new this();
    opposedTest.data = data;
    opposedTest.createAttackerTest(data.attackerTestData);
    opposedTest.createDefenderTest(data.defenderTestData);
    return opposedTest;
  }

  _createTest(testData) {
    if (!testData)
      return testData
    let test = game.wfrp4e.rolls5e.TestWFRP5e.recreate(testData)
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
    this.defenderTest = new CharacteristicTest5e({
      characteristic: "ws",
      definedSL: 0,
      target: 0,
      roll: 0,
      unopposed: true
    }, actor)
    this.data.defenderTestData = this.defenderTest.data
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


      if (defenderTest.context.unopposed)
      {
        await defenderTest.computeResult();
      }

      let attacker = this.attackerTest.actor
      let defender = this.defenderTest.actor

      await Promise.all(attacker.runScripts("preOpposedAttacker", { attackerTest, defenderTest, opposedTest: this }))
      await Promise.all(attackerTest.item?.runScripts?.("preOpposedAttacker", { attackerTest, defenderTest, opposedTest: this }) ?? [])
      await Promise.all(defender.runScripts("preOpposedDefender", { attackerTest, defenderTest, opposedTest: this }))
      await Promise.all(defenderTest.item?.runScripts?.("preOpposedDefender", { attackerTest, defenderTest, opposedTest: this }) ?? [])


      let attackerSL = attackerTest.result.SL;
      let defenderSL = defenderTest.result.SL;
      opposeResult.differenceSL = 0;

      if (attackerSL >= defenderSL) {
        opposeResult.winner = "attacker"
        opposeResult.differenceSL = attackerSL - defenderSL;
        opposeResult.showDualWielding = attackerTest.result.canDualWield

        if (attackerTest.result.damage)
        {

          let damage = await this.calculateOpposedDamage();
          opposeResult.damage = {
            description: `<b>${game.i18n.localize("Damage")}</b>: ${damage}`,
            value: damage
          };

          if (attackerTest.result.hitloc) 
          {
            await this.findHitLocation();
          }

        }


        if (opposeResult.breakdown) {
          opposeResult.breakdown.formatted = this.formatBreakdown();
        }

        try // SOUND
        {
          if (attackerTest.weapon.system.weaponGroup.value === "bow"
            || attackerTest.weapon.system.weaponGroup.value === "crossbow") {
            soundContext = { item: attackerTest.weapon, action: "hit" }
          }
          if (attackerTest.weapon.system.weaponGroup.value == "throwing") {
            soundContext.item = { type: "throw" }
            if (attackerTest.weapon.system.properties.qualities.hack) {
              soundContext.item = { type: "throw_axe" }
            }
          }
        }
        catch (e) { warhammer.utility.log("Sound Context Error: " + e, true) } // Ignore sound errors
      }
      else // Defender won
      {
        try {
          if (attackerTest.weapon
            && (attackerTest.weapon.system.weaponGroup.value === "bow"
              || attackerTest.weapon.system.weaponGroup.value === "crossbow"
              || attackerTest.weapon.system.weaponGroup.value === "blackpowder"
              || attackerTest.weapon.system.weaponGroup.value === "engineering")) {
            soundContext = { item: attackerTest.weapon, action: "miss" }
          }
          if (defenderTest.weapon && defenderTest.weapon.properties.qualities.shield) {
            if (attackerTest.weapon.attackType == "melee") {
              soundContext = { item: { type: "shield" }, action: "miss_melee" }
            }
            else {
              if (attackerTest.weapon.system.weaponGroup.value === "bow"
                || attackerTest.weapon.system.weaponGroup.value === "sling"
                || attackerTest.weapon.system.weaponGroup.value === "throwing"
                || attackerTest.weapon.system.weaponGroup.value === "crossbow") {
                soundContext = { item: { type: "shield" }, action: "miss_ranged" }
              }
            }
          }
        }
        catch (e) { warhammer.utility.log("Sound Context Error: " + e, true) } // Ignore sound errors

        opposeResult.winner = "defender"
        opposeResult.differenceSL = defenderSL - attackerSL;
      }

      await Promise.all(attacker.runScripts("opposedAttacker", { opposedTest: this, attackerTest, defenderTest }))
      await Promise.all(attackerTest.item?.runScripts?.("opposedAttacker", { opposedTest: this, attackerTest, defenderTest }) ?? [])
      if (defender) {
        await Promise.all(defender.runScripts("opposedDefender", { opposedTest: this, attackerTest, defenderTest}))
        await Promise.all(defenderTest.item?.runScripts?.("opposedDefender", { opposedTest: this, attackerTest, defenderTest }) ?? [])
      }

      Hooks.call("wfrp4e:opposedTestResult", this, attackerTest, defenderTest)
      WFRP_Audio.PlayContextAudio(soundContext)
      return opposeResult
    }
    catch (err) {
      ui.notifications.error(`${game.i18n.localize("ErrorOpposed")}: ` + err)
      console.error("Could not complete opposed test: " + err.stack)
    }
  }

  async calculateOpposedDamage() {

    let breakdown = {other : []};
    let damage = this.attackerTest.result.damage;
    let defenderSL = this.defenderTest?.result?.SL || 0;

    breakdown.base = damage;
    breakdown.defenderSL = defenderSL;

    damage += -defenderSL;

    let effectArgs = { damage, opposedTest: this, breakdown }
    await Promise.all(this.attackerTest.actor.runScripts("calculateOpposedDamage", effectArgs) || []);
    await Promise.all(this.attackerTest.item?.runScripts("calculateOpposedDamage", effectArgs) || []);
    ({ damage } = effectArgs)

    breakdown;
    this.result.breakdown = breakdown;
    return damage;
  }

  async findHitLocation()
  {
      // If an attacker's test hit location is "rArm" this actually means "primary arm"
      // So convert "rArm" to "rArm" or "lArm" depending on the actor's settings 
      let attackerHitloc = foundry.utils.deepClone(this.attackerTest.result.hitloc)
      attackerHitloc.result = this.defender.convertHitLoc(attackerHitloc.result)
      attackerHitloc.description = game.wfrp4e.config.locations[attackerHitloc.result];

      let hitlocToUse;

      // Remap the hit location roll to the defender's hit location table, note the change if it is different
      let remappedHitLoc = await game.wfrp4e.tables.rollTable(this.defender.system.details.hitLocationTable.value, { lookup: attackerHitloc.roll, hideDSN: true })

      if (remappedHitLoc && this.defender.system.details.hitLocationTable.value != "hitloc") // Only remap if using a different hitloc table, this prevents Primary Arm -> Right Arm -> Primary Arm (Remapped)
      {
        if (remappedHitLoc.result != attackerHitloc.result) {
          remappedHitLoc.description = game.i18n.localize(remappedHitLoc.description) + " (Remapped)";
          remappedHitLoc.remapped = true;
        }
        hitlocToUse = remappedHitLoc;
      }
      else
      {
        hitlocToUse = attackerHitloc
      }

      this.result.hitloc = {
        description: `<b>${game.i18n.localize("ROLL.HitLocation")}</b>: ${hitlocToUse.description}`,
        value: hitlocToUse.result
      };
  }

  async swap(label)
  {
      let temp = foundry.utils.duplicate(this.defenderTest.data);
      this.defenderTest = game.wfrp4e.rolls.TestWFRP.recreate(this.attackerTest.data);
      this.attackerTest = game.wfrp4e.rolls.TestWFRP.recreate(temp)
      this.data.attackerTestData = this.attackerTest.data
      this.data.defenderTestData = this.defenderTest.data
      let damage = await this.calculateOpposedDamage();
      this.result.damage = {
        description: `<strong>${game.i18n.localize("Damage")} (${label})</strong>: ${damage}`,
        value: damage
      };
      await this.findHitLocation();
      this.result.swapped = true;
  }

  formatBreakdown()
  {
    let string = "";
    try 
    {
      let breakdown = this.result.breakdown;
      let accumulator = breakdown.base;

      string += `<p><strong>${game.i18n.localize("BREAKDOWN.Attack")}</strong>: ${breakdown.base}</p>`;
      if (breakdown.defenderSL) 
      {
        accumulator -= Number(breakdown.defenderSL);
        string += `<p><strong>${game.i18n.localize("BREAKDOWN.OpposedSL")}</strong>:  ${foundry.applications.handlebars.numberFormat(-breakdown.defenderSL, { hash: { sign: true } })} (${accumulator})</p>`;
      }

      for (let source of breakdown.other) 
      {
        accumulator += Number(source.value);
        string += `<p><strong>${source.label}</strong>: ${foundry.applications.handlebars.numberFormat(source.value, { hash: { sign: true } })} (${accumulator})</p>`
      }
    }
    catch (e) 
    {
      console.error(`Error generating formatted breakdown: ${e}`, this);
    }

    return string;
  }

}