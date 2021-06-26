import WFRP_Utility from "../utility-wfrp4e.js";

export default class TestWFRP {
  constructor(data, actor) {
    if (!data)
      data = {}
    this.data = {
      preData: {
        rollClass: this.constructor.name,
        testModifier: data.testModifier || 0,
        testDifficulty: data.testDifficulty || 0,
        successBonus: data.successBonus || 0,
        slBonus: data.slBonus || 0,
        hitLocation: data.hitLocation || false,
        target: undefined,
        itemId: data.itemId,
        options: data.options || {},
        extra: {
          other: data.other || [],
          isMounted: data.isMounted || false,
          canReverse: data.canReverse || false
        },
        postOpposedModifiers: data.postOpposedModifiers || { modifiers: 0, slBonus: 0 }
      },
      result: {
        roll: undefined,
        description: "",
      },
      context: {
        rollMode: data.rollMode,
        reroll: false,
        edited: false,
        speaker: data.speaker
      }
    }

    if (!this.data.context.speaker && actor) {
      if (actor.isToken)
        this.data.context.speaker = {
          token: actor.token.id,
          scene: actor.token.scene.id
        }
      else {
        this.data.context.speaker = {
          actor: actor.id
        }
      }
    }
  }

  computeTargetNumber() {
    this.data.preData.target += (this.preData.testModifier + this.preData.testDifficulty + (this.preData.postOpposedModifiers.target || 0))
  }

  async roll() {
    if (!this.preData.itemId)
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
    let slBonus = this.preData.slBonus + this.preData.postOpposedModifiers.slBonus;
    let target = this.preData.target;
    let outcome;

    slBonus += this.preData.postOpposedModifiers.slBonus

    let description = "";

    if (this.preData.extra.canReverse) {
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
          this.preData.extra.other.push(game.i18n.localize("ROLL.Reverse"))
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
      if (this.result.roll <= 5 && SL < 1)
        SL = 1;


      // If size modifiers caused a success, SL becomes 0 // TODO fix this
      if (this.preData.extra.weapon && this.preData.extra.weapon.sizeModifier) {
        let unmodifiedTarget = target - this.preData.extra.weapon.sizeModifier
        if (this.result.roll > unmodifiedTarget) {
          SL = 0;
          this.preData.extra.other.push(game.i18n.localize("ROLL.SizeCausedSuccess"))
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

    this.result.target = target,
      this.result.SL = SL
      console.log(SL)
    this.result.description = description
    this.result.outcome = outcome

    mergeObject(this.result, this.preData.extra)

    if (this.options.context) {
      if (this.options.context.general)
        this.result.other = this.result.other.concat(this.options.context.general)
      if (this.result.outcome == "failure" && this.options.context.failure)
        this.result.other = this.result.other.concat(this.options.context.failure)
      if (this.result.outcome == "success" && this.options.context.success)
        this.result.other = this.result.other.concat(this.options.context.success)
    }


    // TODO Move this out
    if (this.options.rest) {
      this.result.woundsHealed = Math.max(Math.trunc(SL) + this.options.tb, 0);
      this.result.other.push(`${this.result.woundsHealed} ${game.i18n.localize("Wounds Healed")}`)
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


  /**
   * Start a dice roll
   * Used by the rollTest method and its overrides
   * @param {Object} testData
   */
  async rollDices() {
    if (!this.preData.roll) {
      let roll = new Roll("1d100").roll();
      await this._showDiceSoNice(roll, this.data.context.rollMode || "roll");
      this.result.roll = roll.total;
    }
    else
      this.result.roll = this.preData.roll;
  }

  /**
   * Add support for the Dice So Nice module
   * @param {Object} roll 
   * @param {String} rollMode 
   */
  async _showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
      let whisper = null;
      let blind = false;
      switch (rollMode) {
        case "blindroll": //GM only
          blind = true;
        case "gmroll": //GM + rolling player
          let gmList = game.users.filter(user => user.isGM);
          let gmIDList = [];
          gmList.forEach(gm => gmIDList.push(gm.data._id));
          whisper = gmIDList;
          break;
        case "roll": //everybody
          let userList = game.users.filter(user => user.active);
          let userIDList = [];
          userList.forEach(user => userIDList.push(user.data._id));
          whisper = userIDList;
          break;
      }
      await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
    }
  }

  get succeeded() {
    return this.result.outcome == "success"
  }

  get isCritical() {
    return false
  }

  get isFumble() {
    return false
  }


  get target() { return this.data.result.target }
  get damage() { return this.data.result.damage }
  get hitloc() { return this.data.result.hitloc }
  get type() { return this.data.type }
  get item() { return this.data.item }
  get size() { return this.actor.details.size.value }
  get options() { return this.data.preData.options }
  get outcome() { return this.data.result.outcome }
  get result() { return this.data.result }
  get preData() { return this.data.preData }
  get context() { return this.data.context }
  get actor() { return WFRP_Utility.getSpeaker(this.data.context.speaker) }
  get item() {
    return this.actor.items.get(this.data.preData.itemId)
  }
}