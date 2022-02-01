import WFRP_Utility from "../utility-wfrp4e.js";
import OpposedWFRP from "../opposed-wfrp4e.js";

export default class TestWFRP {
  constructor(data, actor) {
    if (!data)
      data = {}
    this.data = {
      preData: {
        title: data.title,
        SL: data.SL,
        roll: data.roll,
        target: data.target,
        rollClass: this.constructor.name,
        testModifier: data.testModifier || 0,
        testDifficulty: (typeof data.testDifficulty == "string" ? game.wfrp4e.config.difficultyModifiers[data.testDifficulty] : data.testDifficulty) || 0,
        successBonus: data.successBonus || 0,
        slBonus: data.slBonus || 0,
        hitLocation: data.hitLocation || false,
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
        postFunction: data.postFunction,
        targets: data.targets,
        cardOptions: data.cardOptions,
        unopposed : data.unopposed,
        defending : data.defending,

        messageId: data.messageId,
        opposedMessageIds : data.opposedMessageIds || [],
        fortuneUsedReroll: data.fortuneUsedReroll,
        fortuneUsedAddSL: data.fortuneUsedAddSL,


        // attackerMessageId: data.attackerMessageId,
        // defenderMessageIds: data.defenderMessageIds || [],
        // unopposedStartMessageId: data.unopposedStartMessageId,
        // startMessageIds: data.startMessageIds || []
      }
    }

    if (this.data.context.speaker && this.actor.isOpposing && this.data.context.targets.length)
    {
      ui.notifications.notify("Targeting canceled: Already opposing a test")
      this.data.context.targets = [];
    }

    if (!this.data.context.speaker && actor)
      this.data.context.speaker = actor.speakerData()
  }

  computeTargetNumber() {
    if (this.preData.target)
      this.data.result.target = this.preData.target
    else
      this.data.result.target += this.targetModifiers
  }

  runPreEffects() {
    this.actor.runEffects("preRollTest", { test: this, cardOptions: this.context.cardOptions })
  }

  runPostEffects() {
    this.actor.runEffects("rollTest", { test: this, cardOptions: this.context.cardOptions })
    Hooks.call("wfrp4e:rollTest", this, this.context.cardOptions)
  }

  async roll() {
    this.runPreEffects();

    this.reset();
    if (!this.preData.item)
      throw new Error("WFRP4e Rolls must specify the item property")
    if (!this.data.context.speaker)
      throw new Error("WFRP4e Rolls must specify a speaker")

    await this.rollDices();
    await this.computeResult();

    this.runPostEffects();
    this.postTest();

    // Do not render chat card or compute oppose if this is a dummy unopposed test
    if (!this.context.unopposed)
    {
      await this.renderRollCard();
      this.handleOpposed();
    }

  }

  async reroll() {
    this.context.previousResult = this.result
    this.context.reroll = true;
    delete this.result.roll;
    delete this.result.hitloc
    delete this.preData.hitloc
    delete this.preData.roll;
    delete this.preData.SL;
    this.context.messageId = ""

    this.roll()

  }

  async addSL(SL) {
    this.preData.SL = Math.trunc(this.result.SL) + SL;
    this.preData.slBonus = 0;
    this.preData.successBonus = 0;
    this.preData.roll = Math.trunc(this.result.roll);
    this.preData.hitloc = this.result.hitloc.roll;

    this.roll()
  }

  /**
     * Provides the basic evaluation of a test.
     * 
     * This function, when given the necessary data (target number, SL bonus, etc.) provides the
     * basic test evaluation - rolling the test (if not already given), determining SL, success, description, critical/fumble if needed.
     * 
     * @param {Object} this.data  Test info: target number, SL bonus, success bonus, (opt) roll, etc
     */
  async computeResult() {
    this.computeTargetNumber();
    let successBonus = this.preData.successBonus;
    let slBonus = this.preData.slBonus + this.preData.postOpposedModifiers.SL;
    let target = this.result.target;
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



      if (!game.settings.get("wfrp4e", "mooRangedDamage")) {
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
        this.result.hitloc = await game.wfrp4e.tables.rollTable("hitloc", { lookup: this.preData.hitloc, hideDSN: true });
      else
        this.result.hitloc = await game.wfrp4e.tables.rollTable("hitloc", { hideDSN: true });

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
  async postTest() {
    //@HOUSE
    if (game.settings.get("wfrp4e", "mooCriticalMitigation") && this.result.critical) {
      game.wfrp4e.utility.logHomebrew("mooCriticalMitigation")
      try {
        let target = this.targets[0];
        if (target) {
          let AP = target.status.armour[this.result.hitloc.result].value
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

    if (this.options.corruption) {
      await this.actor.handleCorruptionResult(this);
    }
    if (this.options.mutate) {
      await this.actor.handleMutationResult(this)
    }

    if (this.options.extended) {
      await this.actor.handleExtendedTest(this)
    }

    if (this.options.income) {
      await this.actor.handleIncomeTest(this)
    }

    if (this.options.rest) {
      this.result.woundsHealed = Math.max(Math.trunc(this.result.SL) + this.options.tb, 0);
      this.result.other.push(`${this.result.woundsHealed} ${game.i18n.localize("Wounds Healed")}`)
    }
  }

  async handleSoundContext(cardOptions) 
  {
    
    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(this))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
  }

  /**
   * Handles opposed context - if actor has been targeted, roll defense. If this test has targets, roll attack
   * Test objects may have one or more opposed test message IDs. If these IDs exist, that means this test is
   * either rerolled, edited, etc. and the opposed result needs to know of the new test (via updating message ID). 
   * The opposed test may also need to be recalculated if the defender test exists
   */
  async handleOpposed() {

    // If the actor has been targeted - roll defense
    if (this.actor.isOpposing || this.context.defending)
    {
      let opposeMessage;
      if (this.context.defending) // Rehandling a previous defense roll
      {
        opposeMessage = this.opposedMessages[0]
      }
      else
      {
        this.context.defending = true; // If the test is handled again after the initial roll, the actor flag doesn't exist anymore, need a way to know we're still defending
        opposeMessage = game.messages.get(this.actor.data.flags.oppose.opposeMessageId);
        this.context.opposedMessageIds.push(opposeMessage.id); // Maintain a link to the opposed message
      }
      
      // Get oppose message, set this test's message as defender, compute result
      let oppose = opposeMessage.getOppose();
      oppose.setDefender(this.message);
      oppose.computeOpposeResult();
      this.actor.clearOpposed();
      this.updateMessageFlags();
    }
    else // if actor is attacking - rerolling old test. 
    {
      if (this.opposedMessages.length)
      {
        for(let message of this.opposedMessages)
        {
          let oppose = message.getOppose()
          await oppose.setAttacker(this.message); // Make sure the opposed test is using the most recent message from this test
          if (oppose.defenderTest) // If defender has rolled (such as if this test was rerolled or edited after the defender rolled) - recompute opposed test
            oppose.computeOpposeResult()
        }
      }
      else { // actor is attacking - new test

        // For each target, create opposed test messages, save those message IDs in this test.
        for(let token of this.context.targets.map(t => WFRP_Utility.getToken(t)))
        {
          await this.createOpposedMessage(token)
        }
      }
    }
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
      let roll = await new Roll("1d100").roll();
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

  /** Take roll data and display it in a chat card template.
 * @param {Object} chatOptions - Object concerning display of the card like the template or which actor is testing
 * @param {Object} testData - Test results, values to display, etc.
 * @param {Object} rerenderMessage - Message object to be updated, instead of rendering a new message
 */
  async renderRollCard({ newMessage = false } = {}) {

    let chatOptions = this.context.cardOptions

    await this.handleSoundContext(chatOptions)

    // Blank if manual chat cards
    if (game.settings.get("wfrp4e", "manualChatCards") && !rerenderMessage)
      this.result.roll = this.result.SL = null;

    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active && chatOptions.sound?.includes("dice"))
      chatOptions.sound = undefined;

    //this.result.other = this.result.other.join("<br>")
    this.result.other = this.preData.other.join("<br>")

    let chatData = {
      title: chatOptions.title,
      test: this,
      hideData: game.user.isGM
    }


    if (this.context.targets.length) {
      chatData.title += ` - ${game.i18n.localize("Opposed")}`;
    }

    ChatMessage.applyRollMode(chatOptions, chatOptions.rollMode)

    let html = await renderTemplate(chatOptions.template, chatData)

    if (newMessage || !this.message) {
      // If manual chat cards, convert elements to blank inputs
      if (game.settings.get("wfrp4e", "manualChatCards")) {
        let blank = $(html)
        let elementsToToggle = blank.find(".display-toggle")

        for (let elem of elementsToToggle) {
          if (elem.style.display == "none")
            elem.style.display = ""
          else
            elem.style.display = "none"
        }
        html = blank.html();
      }

      chatOptions["content"] = html;
      if (chatOptions.sound)
        console.log(`wfrp4e | Playing Sound: ${chatOptions.sound}`)
      let message = await ChatMessage.create(chatOptions)
      this.context.messageId = message.id
      await this.updateMessageFlags()
    }
    else // Update message 
    {
      // Emit the HTML as a chat message
      chatOptions["content"] = html;
      if (chatOptions.sound) {
        console.log(`wfrp4e | Playing Sound: ${chatOptions.sound}`)
        AudioHelper.play({ src: chatOptions.sound }, true) // Play sound manually as updating doesn't trigger it
      }
      await this.message.update(chatOptions)
      await this.updateMessageFlags()
    }
  }



  // Update message data without rerendering the message content
  updateMessageFlags(updateData = {}) {
    let data = mergeObject(this.data, updateData, { overwrite: true })
    if (this.message)
      return this.message.update({ "flags.testData": data })
  }


  async createOpposedMessage(token)
  {
    let oppose = new OpposedWFRP();
    oppose.setAttacker(this.message);
    let opposeMessageId = await oppose.startOppose(token);
    this.context.opposedMessageIds.push(opposeMessageId);
    this.updateMessageFlags();
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
  async _overcast(choice) {
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
          overcastData.usage[choice].current += (parseInt(this.data.result.SL) + (parseInt(this.item.computeSpellPrayerFormula(undefined, false, overcastData.valuePerOvercast.additional)) || 0))
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
      await this._calculateDamage()
    }
    //@/HOUSE

    this.renderRollCard()
  }

  async _overcastReset() {
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
      await this._calculateDamage()
    }
    //@/HOUSE
    overcastData.available = overcastData.total;
    this.renderRollCard()
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
    else if (game.settings.get("wfrp4e", "mooCatastrophicMiscasts") && miscastCounter >= 3) {
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


  get message() {
    return game.messages.get(this.data.context.messageId)
  }
  get isOpposed() {
    return this.data.context.opposedMessageIds.length > 0
  }
  get opposedMessages() {
    return this.data.context.opposedMessageIds.map(id => game.messages.get(id))
  }


  get fortuneUsed() {
    return { reroll: this.data.context.fortuneUsedReroll, SL: this.data.context.fortuneUsedAddSL }
  }
  // get attackerMessage() {
  //   return game.messages.get(game.messages.get(this.context.attackerMessageId))
  // }
  // get defenderMessages() {
  //   return this.data.context.defenderMessageIds.map(id => game.messages.get(id))
  // }
  // get unopposedStartMessage() {
  //   return game.messages.get(game.messages.get(unopposedStartMessageId))
  // }
  // get startMessages() {
  //   return this.data.context.startMessageIds.map(id => game.messages.get(id))
  // }



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
  get token() { return WFRP_Utility.getToken(this.data.context.speaker) }

  get item() {
    if (typeof this.data.preData.item == "string")
      return this.actor.items.get(this.data.preData.item)
    else
      return new CONFIG.Item.documentClass(this.data.preData.item, { parent: this.actor })
  }

  get targets() {
    return this.context.targets.map(i => WFRP_Utility.getSpeaker(i))
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