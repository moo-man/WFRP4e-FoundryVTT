import WFRP_Audio from "./audio-wfrp4e.js";
import WomCastTest from "./rolls/wom-cast-test.js";
import WFRP_Utility from "./utility-wfrp4e.js";


export default class OpposedTest {
  constructor(attackerTest = undefined, defenderTest = undefined, opposeResult = {
      modifiers: {
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
    }) {
      
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
    let opposedTest = new OpposedTest();
    opposedTest.data = data;
    opposedTest.createAttackerTest(data.attackerTestData);
    opposedTest.createDefenderTest(data.defenderTestData);
    return opposedTest;
  }

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
  checkPostModifiers(modifiers) {

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
        modifiers.message.push(game.i18n.format(game.i18n.localize('CHAT.TestModifiers.WeaponLength'), { defender: this.defenderTest.actor.prototypeToken.name, attacker: this.attackerTest.actor.prototypeToken.name }))
        modifiers.attacker.target += -10;
      }
    }

    return modifiers;
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

      let originalModifiers = foundry.utils.deepClone(opposeResult.modifiers)

      await Promise.all(attacker.runScripts("preOpposedAttacker", { attackerTest, defenderTest, opposedTest: this }))
      await Promise.all(attackerTest.item?.runScripts?.("preOpposedAttacker", { attackerTest, defenderTest, opposedTest: this }) ?? [])
      await Promise.all(defender.runScripts("preOpposedDefender", { attackerTest, defenderTest, opposedTest: this }))
      await Promise.all(defenderTest.item?.runScripts?.("preOpposedDefender", { attackerTest, defenderTest, opposedTest: this }) ?? [])

      this.checkPostModifiers(opposeResult.modifiers);
      
      // Redo the test with modifiers
      if (opposeResult.modifiers.attacker.target != originalModifiers.attacker.target
        || opposeResult.modifiers.attacker.SL != originalModifiers.attacker.SL) {
        attackerTest.preData.roll = attackerTest.result.roll
        attackerTest.preData.postOpposedModifiers = opposeResult.modifiers.attacker
        attackerTest.preData.hitloc = attackerTest.result.hitloc?.roll;

        attackerTest.context.breakdown.slBonus += opposeResult.modifiers.attacker.SL;
        defenderTest.context.breakdown.modifiersBreakdown += "<p>" + opposeResult.modifiers.message.join("<br/>") + "</p>";

        await attackerTest.computeResult();
        await attackerTest.renderRollCard();
      } 
      if (opposeResult.modifiers.defender.target != originalModifiers.defender.target
        || opposeResult.modifiers.defender.SL != originalModifiers.defender.SL) {
        defenderTest.preData.roll = defenderTest.result.roll
        defenderTest.preData.postOpposedModifiers = opposeResult.modifiers.defender
        defenderTest.preData.hitloc = defenderTest.result.hitloc?.roll;

        defenderTest.context.breakdown.slBonus += opposeResult.modifiers.defender.SL;
        defenderTest.context.breakdown.modifiersBreakdown += "<p>" + opposeResult.modifiers.message.join("<br/>") + "</p>";
        
        await defenderTest.computeResult();
        await defenderTest.renderRollCard();
      }
      if (defenderTest.context.unopposed)
      {
        await defenderTest.roll();
      }

      opposeResult.other = opposeResult.other.concat(opposeResult.modifiers.message);

      let attackerSL = parseInt(attackerTest.result.SL ?? 0);
      let defenderSL = parseInt(defenderTest.result.SL ?? 0);
      opposeResult.differenceSL = 0;

      // If attacker has more SL OR the SLs are equal and the attacker's target number is greater than the defender's, then attacker wins. 
      // Note: I know this isn't technically correct by the book, where it states you use the tested characteristic/skill, not the target number, i'll be honest, I don't really care.
      if (attackerSL > defenderSL || (attackerSL === defenderSL && (attackerTest.target > defenderTest.target || (attackerTest.outcome == "success" && defenderTest.context.unopposed)))) {
        opposeResult.winner = "attacker"
        opposeResult.differenceSL = attackerSL - defenderSL;
        opposeResult.showDualWielding = attackerTest.result.canDualWield

        // If Damage is a numerical value
        if (Number.isNumeric(attackerTest.damage)) {
          let damage = await this.calculateOpposedDamage();
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
        if (attackerTest.hitloc) 
        {
          await this.findHitLocation();
        }

        if (opposeResult.breakdown) {
          opposeResult.breakdown.formatted = this.formatBreakdown();
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
        catch (e) { warhammer.utility.log("Sound Context Error: " + e, true) } // Ignore sound errors
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
      console.error("Could not complete opposed test: " + err)
    }
  }

  async calculateOpposedDamage() {
    // Calculate size damage multiplier 
    let damageMultiplier = 1;
    let sizeDiff
    let breakdown = {other : []};

    if (this.attackerTest.actor.type == "vehicle" || this.defenderTest.actor.type == "vehicle")
      sizeDiff = 0;
    else 
      sizeDiff = game.wfrp4e.config.actorSizeNums[this.attackerTest.size] - game.wfrp4e.config.actorSizeNums[this.defenderTest.size]

    if (this.attackerTest.actor.has(game.i18n.localize("NAME.Swarm")) || this.defenderTest.actor.has(game.i18n.localize("NAME.Swarm")))
      sizeDiff = 0

    if (game.settings.get("wfrp4e", "homebrew").mooSizeDamage)
      sizeDiff = 0

    damageMultiplier = sizeDiff >= 2 ? sizeDiff : 1


    let opposedSL = Number(this.attackerTest.result.SL ?? 0) - Number(this.defenderTest.result.SL ?? 0)
    let item = this.attackerTest.item

    if (item?.system.damage?.hasOwnProperty("addSL") && !item.system.damage.addSL)
    {
      opposedSL = 0;
    }

    let damage
    if (this.attackerTest.useMount)
      damage = item.mountDamage
    else
      damage = item.Damage

    //@HOUSE
    if (game.settings.get("wfrp4e", "homebrew").mooSLDamage) {
      game.wfrp4e.utility.logHomebrew("mooSLDamage")
      opposedSL = Number(this.attackerTest.result.SL)
    }
    //@/HOUSE

    breakdown.base = damage + this.attackerTest.result.additionalDamage; 
    breakdown.opposedSL = opposedSL

    // Winds of Magic overcast
    if (this.attackerTest instanceof WomCastTest) {	
      damage += (this.attackerTest.result.additionalDamage || 0);	
    } else {	
      damage += (opposedSL + (this.attackerTest.result.additionalDamage || 0));	
    }

    //@HOUSE
    if (game.settings.get("wfrp4e", "homebrew").mooRangedDamage)
    {
      game.wfrp4e.utility.logHomebrew("mooRangedDamage")
      if (this.attackerTest.item && this.attackerTest.item.isRanged)
      {
        damage -= (Math.floor(this.attackerTest.targetModifiers / 10) || 0)
        if (damage < 0)
          damage = 0
      }
    }
    //@/HOUSE



    let effectArgs = { damage, damageMultiplier, sizeDiff, opposedTest: this, addDamaging : false, addImpact : false, breakdown }
    await Promise.all(this.attackerTest.actor.runScripts("calculateOpposedDamage", effectArgs));
    await Promise.all(this.attackerTest.item?.runScripts("calculateOpposedDamage", effectArgs));
    ({ damage, damageMultiplier, sizeDiff } = effectArgs)

    let addDamaging = effectArgs.addDamaging || false;
    let addImpact = effectArgs.addImpact || false;
    if (this.attackerTest.trait) {
      if (sizeDiff >= 1)
        addDamaging = true;
      if (sizeDiff >= 2)
        addImpact = true;
    }

    let hasDamaging = false;
    let hasImpact = false;
    if (this.attackerTest.item.properties) {
      hasDamaging = this.attackerTest.item.properties.qualities.damaging
      hasImpact = this.attackerTest.item.properties.qualities.impact

      if (this.attackerTest.item.properties.qualities.hullbreaker && this.defender.type == "vehicle")
      {
        addDamaging = true;
        damage += 2;
        breakdown.other.push({label : game.i18n.localize("PROPERTY.Hullbreaker"), value : 2});
      }

      if (this.attackerTest.result.charging || !this.attackerTest.item.properties.flaws.tiring) {
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
        breakdown.damaging = unitValue;
        damage = damage - opposedSL + unitValue; // replace opposedSL with unit value
      }
    }
    if (addImpact) {
      let unitValue = Number(this.attackerTest.result.roll.toString().split("").pop())
      if (unitValue === 0)
        unitValue = 10;
      damage += unitValue
      breakdown.impact = unitValue;
    }
    this.result.damaging = hasDamaging || addDamaging
    this.result.impact = hasImpact || addImpact

    breakdown.multiplier = damageMultiplier
    this.result.breakdown = breakdown;
    return damage * damageMultiplier
  }

  async findHitLocation()
  {
      // If an attacker's test hit location is "rArm" this actually means "primary arm"
      // So convert "rArm" to "rArm" or "lArm" depending on the actor's settings 
      let attackerHitloc = foundry.utils.deepClone(this.attackerTest.hitloc)
      attackerHitloc.result = this.defender.convertHitLoc(attackerHitloc.result)
      attackerHitloc.description = game.wfrp4e.config.locations[attackerHitloc.result];

      let hitlocToUse;

      // Remap the hit location roll to the defender's hit location table, note the change if it is different
      let remappedHitLoc = await game.wfrp4e.tables.rollTable(this.defender.details.hitLocationTable.value, { lookup: attackerHitloc.roll, hideDSN: true })

      if (remappedHitLoc && this.defender.details.hitLocationTable.value != "hitloc") // Only remap if using a different hitloc table, this prevents Primary Arm -> Right Arm -> Primary Arm (Remapped)
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
        description: `<b>${game.i18n.localize("Damage")} (${label})</b>: ${damage}`,
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
      let accumulator = Number(breakdown.base);

      string += `<p><strong>${game.i18n.localize("BREAKDOWN.AttackerBase")}</strong>: ${breakdown.base}</p>`;
      if (breakdown.damaging) 
      {
        accumulator += Number(breakdown.damaging);
        string += `<p><strong>${game.i18n.localize("PROPERTY.Damaging")}</strong>: +${breakdown.damaging} (${accumulator})</p>`;
      }
      else if (breakdown.opposedSL) 
      {
        accumulator += Number(breakdown.opposedSL);
        string += `<p><strong>${game.i18n.localize("BREAKDOWN.OpposedSL")}</strong>: +${breakdown.opposedSL} (${accumulator})</p>`;
      }
      if (breakdown.impact) 
      {
        accumulator += Number(breakdown.impact);
        string += `<p><strong>${game.i18n.localize("PROPERTY.Impact")}</strong>: +${breakdown.impact} (${accumulator})</p>`;
      }

      for (let source of breakdown.other) 
      {
        accumulator += Number(source.value);
        string += `<p><strong>${source.label}</strong>: ${foundry.applications.handlebars.numberFormat(source.value, { hash: { sign: true } })} (${accumulator})</p>`
      }

      if (breakdown.multiplier > 1) 
      {
        accumulator *= breakdown.multiplier
        string += `<p><strong>${game.i18n.localize("BREAKDOWN.Multiplier")}</strong>: ×${breakdown.multiplier} (${accumulator})</p>`
      }
    }
    catch (e) 
    {
      console.error(`Error generating formatted breakdown: ${e}`, this);
    }

    return string;
  }

}