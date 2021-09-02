import WFRP_Utility from "../utility-wfrp4e.js";

export default class TestWFRP {
  constructor(data, actor) {
    if (!data)
      data = {}
    this.data = {
      preData: {
        SL: data.SL,
        roll: data.roll,
        target: data.target,
        rollClass: this.constructor.name,
        testModifier: data.testModifier || 0,
        testDifficulty: (typeof data.testDifficulty == "string" ? game.wfrp4e.config.difficultyModifiers[data.testDifficulty] : data.testDifficulty) || 0,
        successBonus: data.successBonus || 0,
        slBonus: data.slBonus || 0,
        hitLocation: data.hitLocation || false,
        target: undefined,
        item: data.item,
        diceDamage: data.diceDamage,
        options: data.options || {},
        other: data.other || [],
        canReverse: data.canReverse || false,
        postOpposedModifiers: data.postOpposedModifiers || { modifiers: 0, SL: 0 },
        additionalDamage: data.additionalDamage || 0
      },
      result: {
        roll: data.roll,
        description: "",
        tooltips: {}
      },
      context: {
        rollMode: data.rollMode,
        reroll: false,
        edited: false,
        speaker: data.speaker,
        postFunction: data.postFunction
      }
    }

    if (!this.data.context.speaker && actor) {
      if (actor.isToken)
        this.data.context.speaker = {
          token: actor.token.id,
          scene: actor.token.parent.id
        }
      else {
        this.data.context.speaker = {
          actor: actor.id
        }
      }
    }
  }

  computeTargetNumber() {
    this.data.preData.target += this.targetModifiers
  }

  async roll() {
    this.reset();
    if (!this.preData.item)
      throw new Error("WFRP4e Rolls must specify the item property")
    if (!this.data.context.speaker)
      throw new Error("WFRP4e Rolls must specify a speaker")

    await this.rollDices()
    this.rollTest();
  }

  /**
     * Provides the basic evaluation of a test.
     * 
     * This function, when given the necessary data (target number, SL bonus, etc.) provides the
     * basic test evaluation - rolling the test (if not already given), determining SL, success, description, critical/fumble if needed.
     * 
     * @param {Object} this.data  Test info: target number, SL bonus, success bonus, (opt) roll, etc
     */
  rollTest() {
    let successBonus = this.preData.successBonus;
    let slBonus = this.preData.slBonus + this.preData.postOpposedModifiers.SL;
    let target = this.preData.target;
    let outcome;

    let description = "";

    if (this.preData.canReverse) {
      let reverseRoll = this.result.roll.toString();
      if (this.result.roll >= 96 || (this.result.roll > target && this.result.roll > 5)) {
        if (reverseRoll.length == 1)
          reverseRoll = reverseRoll[0] + "0"
        else {
          reverseRoll = reverseRoll[1] + reverseRoll[0]
        }
        reverseRoll = Number(reverseRoll);
        if (reverseRoll <= 5 || reverseRoll <= target) {
          this.result.roll = reverseRoll
          this.preData.other.push(game.i18n.localize("ROLL.Reverse"))
        }
      }
    }


    let SL
    if (this.preData.SL == 0)
      SL = this.preData.SL
    else
      SL = this.preData.SL || ((Math.floor(target / 10) - Math.floor(this.result.roll / 10)) + slBonus); // Use input SL if exists, otherwise, calculate from roll (used for editing a test result)


    // Test determination logic can be complicated due to SLBonus
    // SLBonus is always applied, but doesn't change a failure to a success or vice versa
    // Therefore, in this case, a positive SL can be a failure and a negative SL can be a success
    // Additionally, the auto-success/failure range can complicate things even more.
    // ********** Failure **********
    if (this.result.roll >= 96 || (this.result.roll > target && this.result.roll > 5)) {
      description = game.i18n.localize("ROLL.Failure")
      outcome = "failure"
      if (this.result.roll >= 96 && SL > -1)
        SL = -1;

      switch (Math.abs(Number(SL))) {
        case 6:
          description = game.i18n.localize("ROLL.AstoundingFailure");
          break;

        case 5:
        case 4:
          description = game.i18n.localize("ROLL.ImpressiveFailure");
          break;

        case 3:
        case 2:
          break;

        case 1:
        case 0:
          description = game.i18n.localize("ROLL.MarginalFailure");
          break;

        default:
          if (Math.abs(Number(SL)) > 6)
            description = game.i18n.localize("ROLL.AstoundingFailure");
      }
      if (SL > 0) {
        description = game.i18n.localize("ROLL.MarginalFailure");
        SL = "+" + SL.toString();
      }
      if (SL == 0)
        SL = "-" + SL.toString()
    }

    // ********** Success **********
    else if (this.result.roll <= 5 || this.result.roll <= target) {
      description = game.i18n.localize("ROLL.Success")
      outcome = "success"
      if (game.settings.get("wfrp4e", "fastSL")) {
        let rollString = this.result.roll.toString();
        if (rollString.length == 2)
          SL = Number(rollString.split('')[0])
        else
          SL = 0;
        SL += slBonus
      }
      SL += successBonus;
      if (this.result.roll <= 5 && SL < 1 && !this.context.unopposed)
        SL = 1;



      if (!game.settings.get("wfrp4e", "mooRangedDamage"))
      {
        // If size modifiers caused a success, SL becomes 0
        if (this.options.sizeModifier) {
          let unmodifiedTarget = target - this.options.sizeModifier
          if (this.result.roll > unmodifiedTarget) {
            SL = 0;
            this.result.other.push(game.i18n.localize("ROLL.SizeCausedSuccess"))
          }
        }
      }

      switch (Math.abs(Number(SL))) {
        case 6:
          description = game.i18n.localize("ROLL.AstoundingSuccess")
          break;

        case 5:
        case 4:
          description = game.i18n.localize("ROLL.ImpressiveSuccess")
          break;

        case 3:
        case 2:
          break;

        case 1:
        case 0:
          description = game.i18n.localize("ROLL.MarginalSuccess");
          break;

        default:
          if (Math.abs(Number(SL)) > 6)
            description = game.i18n.localize("ROLL.AstoundingSuccess")
      }
      if (SL < 0)
        description = game.i18n.localize("ROLL.MarginalSuccess");

      // Add 1 SL for each whole 10 the target number is above 100 (120 target: +2 SL) if the option is selected
      if (game.settings.get("wfrp4e", "testAbove100")) {
        if (target > 100) {
          let addSL = Math.floor((target - 100) / 10)
          SL += addSL;
        }
      }

      // Add a + sign if succeeded
      if (SL >= 0)
        SL = "+" + SL.toString()

    }

    this.result.target = target
    this.result.SL = SL
    this.result.description = description
    this.result.outcome = outcome


    if (this.options.context) {
      if (this.options.context.general)
        this.result.other = this.result.other.concat(this.options.context.general)
      if (this.result.outcome == "failure" && this.options.context.failure)
        this.result.other = this.result.other.concat(this.options.context.failure)
      if (this.result.outcome == "success" && this.options.context.success)
        this.result.other = this.result.other.concat(this.options.context.success)
    }


    if (this.preData.hitLocation) {
      if (this.preData.hitloc)
        this.result.hitloc = game.wfrp4e.tables.rollTable("hitloc", { lookup: this.preData.hitloc });
      else
        this.result.hitloc = game.wfrp4e.tables.rollTable("hitloc");

      this.result.hitloc.roll = eval(this.result.hitloc.roll) // Cleaner number when editing chat card
      this.result.hitloc.description = game.i18n.localize(this.result.hitloc.description)
    }

    let roll = this.result.roll
    // If hit location is being ussed, we can assume we should lookup critical hits
    if (this.preData.hitLocation) {
      if ((roll > target && roll % 11 == 0) || roll == 100 || roll == 99) {
        this.result.color_red = true;
        this.result.fumble = game.i18n.localize("Fumble");
      }
      else if (roll <= target && roll % 11 == 0) {
        this.result.color_green = true;
        this.result.critical = game.i18n.localize("Critical");
      }
    }

    // If optional rule of criticals/fumbles on all tessts - assign Astounding Success/Failure accordingly
    if (game.settings.get("wfrp4e", "criticalsFumblesOnAllTests") && !this.data.hitLocation) {
      if ((roll > target && roll % 11 == 0) || roll == 100 || roll == 99) {
        this.result.color_red = true;
        this.result.description = game.i18n.localize("ROLL.AstoundingFailure")
      }
      else if (roll <= target && roll % 11 == 0) {
        this.result.color_green = true;
        this.result.description = game.i18n.localize("ROLL.AstoundingSuccess")
      }
    }
    return this.result
  }


  // Function that all tests should go through after the main roll
  postTest()
  {
    //@HOUSE
    if (game.settings.get("wfrp4e", "mooCriticalMitigation") && this.result.critical) {
      game.wfrp4e.utility.logHomebrew("mooCriticalMitigation")
      try {
        let target = Array.from(game.user.targets)[0];
        if (target) {
          let AP = target.actor.status.armour[this.result.hitloc.result].value
          if (AP) {
            this.result.critModifier = -10 * AP
            this.result.critical += ` (${this.result.critModifier})`
            this.result.other.push(`Critical Mitigation: Damage AP on target's ${this.result.hitloc.description}`)
          }
        }
      }
      catch (e) {
        game.wfrp4e.utility.log("Error appyling homebrew mooCriticalMitigation: " + e)
      }
    }
    //@/HOUSE
  }

  // Create a test from already formed data
  static recreate(data) {
    let test = new game.wfrp4e.rolls[data.preData.rollClass]()
    test.data = data
    test.computeTargetNumber()
    return test
  }

  /**
   * Start a dice roll
   * Used by the rollTest method and its overrides
   * @param {Object} testData
   */
  async rollDices() {
    if (isNaN(this.preData.roll)) {
      let roll = new Roll("1d100").roll();
      await this._showDiceSoNice(roll, this.data.context.rollMode || "roll", this.data.context.speaker);
      this.result.roll = roll.total;
    }
    else
      this.result.roll = this.preData.roll;
  }

  reset() {
    this.data.result = mergeObject({
      roll: undefined,
      description: "",
      tooltips: {}
    }, this.preData)
  }

  /**
   * Add support for the Dice So Nice module
   * @param {Object} roll 
   * @param {String} rollMode 
   */
  async _showDiceSoNice(roll, rollMode, speaker) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {

      if (game.settings.get("dice-so-nice", "hideNpcRolls")) {
        let actorType = null;
        if (speaker.actor)
          actorType = game.actors.get(speaker.actor).type;
        else if (speaker.token && speaker.scene)
          actorType = game.scenes.get(speaker.scene).tokens.get(speaker.token).actor.type;
        if (actorType != "character")
          return;
      }

      let whisper = null;
      let blind = false;
      let sync = true;
      switch (rollMode) {
        case "blindroll": //GM only
          blind = true;
        case "gmroll": //GM + rolling player
          let gmList = game.users.filter(user => user.isGM);
          let gmIDList = [];
          gmList.forEach(gm => gmIDList.push(gm.data._id));
          whisper = gmIDList;
          break;
        case "selfroll":
          sync = false;
          break;
        case "roll": //everybody
          let userList = game.users.filter(user => user.active);
          let userIDList = [];
          userList.forEach(user => userIDList.push(user.data._id));
          whisper = userIDList;
          break;
      }
      await game.dice3d.showForRoll(roll, game.user, sync, whisper, blind);
    }
  }



  // @@@@@@@ Overcast functions placed in root class because it is used by both spells and prayers @@@@@@@
  _overcast(choice) {
    let overcastData = this.result.overcast

    if (!overcastData.available)
      return overcastData

    if (typeof overcastData.usage[choice].initial != "number")
      return overcastData

    // data-button tells us what button was clicked
    switch (choice) {
      case "range":
        overcastData.usage[choice].current += overcastData.usage[choice].initial
        break
      case "target":
        overcastData.usage[choice].current += overcastData.usage[choice].initial
        break
      case "duration":
        overcastData.usage[choice].current += overcastData.usage[choice].initial
        break
      case "other":
        if (overcastData.valuePerOvercast.type == "value")
          overcastData.usage[choice].current += overcastData.valuePerOvercast.value
        else if (overcastData.valuePerOvercast.type == "SL")
          overcastData.usage[choice].current += (parseInt(this.data.result.SL) + (parseInt(actor.calculateSpellAttributes(overcastData.valuePerOvercast.additional)) || 0))
        else if (overcastData.valuePerOvercast.type == "characteristic")
          overcastData.usage[choice].current += (overcastData.usage[choice].increment || 0) // Increment is specialized storage for characteristic data so we don't have to look it up
        break
    }
    overcastData.usage[choice].count++
    let sum = 0;
    for (let overcastType in overcastData.usage)
      if (overcastData.usage[overcastType].count)
        sum += overcastData.usage[overcastType].count

    overcastData.available = overcastData.total - sum;

    //@HOUSE 
    if (game.settings.get("wfrp4e", "mooOvercasting")) {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
      this.data.result.SL = `+${this.data.result.SL - 2}`
      this._calculateDamage()
    }
    //@/HOUSE

    return overcastData
  }

  _overcastReset() {
    let overcastData = this.result.overcast
    for (let overcastType in overcastData.usage) {
      if (overcastData.usage[overcastType].count) {
        overcastData.usage[overcastType].count = 0
        overcastData.usage[overcastType].current = overcastData.usage[overcastType].initial
      }
    }
    //@HOUSE 
    if (game.settings.get("wfrp4e", "mooOvercasting")) {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
      this.data.result.SL = `+${Number(this.data.result.SL) + (2 * (overcastData.total - overcastData.available))}`
      this._calculateDamage()
    }
    //@/HOUSE
    overcastData.available = overcastData.total;
    return overcastData
  }

  _handleMiscasts(miscastCounter) {

    if (miscastCounter == 1) {
      if (this.hasIngredient)
        this.result.nullminormis = game.i18n.localize("ROLL.MinorMis")
      else {
        this.result.minormis = game.i18n.localize("ROLL.MinorMis")
      }
    }
    else if (miscastCounter == 2) {
      if (this.hasIngredient) {
        this.result.nullmajormis = game.i18n.localize("ROLL.MajorMis")
        this.result.minormis = game.i18n.localize("ROLL.MinorMis")
      }
      else {
        this.result.majormis = game.i18n.localize("ROLL.MajorMis")
      }
    }
    else if (!game.settings.get("wfrp4e", "mooCatastrophicMiscasts") && miscastCounter >= 3)
      this.result.majormis = game.i18n.localize("ROLL.MajorMis")

    //@HOUSE
    else if (game.settings.get("wfrp4e", "mooCatastrophicMiscasts") && miscastCounter >= 3)
    {
      game.wfrp4e.utility.logHomebrew("mooCatastrophicMiscasts")
      if (this.hasIngredient) {
        this.result.nullcatastrophicmis = game.i18n.localize("ROLL.CatastrophicMis")
        this.result.majormis = game.i18n.localize("ROLL.MajorMis")
      }
      else {
        this.result.catastrophicmis = game.i18n.localize("ROLL.CatastrophicMis")
      }
    }
    //@/HOUSE
  }

  get targetModifiers() {
    return this.preData.testModifier + this.preData.testDifficulty + (this.preData.postOpposedModifiers.target || 0)
  }

  get succeeded() {
    return this.result.outcome == "success"
  }

  get isCritical() {
    return this.result.critical
  }

  get isFumble() {
    return this.result.fumble
  }

  get useMount() {
    return this.item.attackType == "melee" && this.actor.isMounted && this.actor.mount && this.result.charging
  }

  get effects() {
    let effects = []
    if (this.item.effects)
      effects = this.item.effects.filter(e => e.application == "apply")
    return effects
  }

  get target() { return this.data.result.target }
  get successBonus() { return this.data.preData.successBonus }
  get slBonus() { return this.data.preData.slBonus }
  get damage() { return this.data.result.damage }
  get hitloc() { return this.data.result.hitloc }
  get type() { return this.data.type }
  get size() { return this.useMount ? this.actor.mount.details.size.value : this.actor.details.size.value }
  get options() { return this.data.preData.options }
  get outcome() { return this.data.result.outcome }
  get result() { return this.data.result }
  get preData() { return this.data.preData }
  get context() { return this.data.context }
  get actor() { return WFRP_Utility.getSpeaker(this.data.context.speaker) }
  get item() {
    if (typeof this.data.preData.item == "string")
      return this.actor.items.get(this.data.preData.item)
    else
      return new CONFIG.Item.documentClass(this.data.preData.item, { parent: this.actor })
  }

  get doesDamage() {
    return !!this.result.damage || !!this.result.diceDamage || !!this.result.additionalDamage
  }

  get DamageString() {
    let damageElements = []
    if (this.result.damage) damageElements.push(this.result.damage)
    if (this.result.diceDamage) damageElements.push(`<span title=${this.result.diceDamage.formula}>${this.result.diceDamage.value}</span>`)

    return `(${damageElements.join(" + ")} ${game.i18n.localize("Damage")})`
  }

  get characteristicKey() { return this.item.characteristic.key }
}