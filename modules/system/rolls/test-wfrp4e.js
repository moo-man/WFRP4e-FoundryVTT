import WFRP_Utility from "../utility-wfrp4e.js";
import OpposedHandler from "../opposed-handler.js";
import WFRP_Audio from "../audio-wfrp4e.js";
import CrewTest from "../crew-test.js"

export default class TestWFRP extends WarhammerTestBase{
  constructor(data, actor) {
    super();
    if (!data)
      data = {}
    this.data = {
      preData: {
        title: data.title,
        SL: data.SL,
        roll: data.roll,
        target: data.target,
        rollClass: this.constructor.name,
        testModifier: data.modifier || 0,
        testDifficulty: (typeof data.difficulty == "string" ? game.wfrp4e.config.difficultyModifiers[data.difficulty] : data.difficulty) || 0,
        successBonus: data.successBonus || 0,
        slBonus: data.slBonus || 0,
        hitLocation: data.hitLocation != "none" && data.hitLocation || false,
        characteristic : data.characteristic,
        item: data.item,
        diceDamage: data.diceDamage,
        options: data.options || {},
        other: data.other || [],
        canReverse: data.canReverse || false,
        postOpposedModifiers: data.postOpposedModifiers || { modifiers: 0, SL: 0 },
        additionalDamage: data.additionalDamage || 0,
        selectedHitLocation : typeof data.hitLocation == "string" ? data.hitLocation : "", // hitLocation could be boolean
        hitLocationTable : data.hitLocationTable,
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
        targets: data.targets,
        chatOptions: data.chatOptions,
        unopposed : data.unopposed,
        defending : data.defending,
        breakdown : foundry.utils.mergeObject({damage : {other : []}}, data.breakdown),

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
      await Promise.all(this.actor.runScripts("preRollTest", { test: this, chatOptions: this.context.chatOptions }))
      if (this.item instanceof Item)
      {
        await Promise.all(this.item.runScripts("preRollTest", { test: this, chatOptions: this.context.chatOptions }))
      }
    }
  }

  async runPostEffects() {
    if (!this.context.unopposed)
    {
      await Promise.all(this.actor.runScripts("rollTest", { test: this, chatOptions: this.context.chatOptions }))
      if (this.item instanceof Item)
      {
        await Promise.all(this.item.runScripts("rollTest", { test: this, chatOptions: this.context.chatOptions }))
      }
      Hooks.call("wfrp4e:rollTest", this, this.context.chatOptions)
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

    warhammer.utility.log("Rolled Test: ", undefined, this)
    return this
  }

  async reroll() {
    this.context.previousResult = this.result
    this.context.reroll = true;
    this.context.previousMessage = this.message.id;
    delete this.result.roll;
    delete this.result.hitloc
    delete this.preData.hitloc
    delete this.preData.roll;
    delete this.preData.SL;
    this.context.messageId = ""

    await this.roll()
  }

  addSL(SL) {
    this.context.previousResult = foundry.utils.duplicate(this.result)
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
          this.result.reversed = true;
          this.result.other.push(game.i18n.localize("ROLL.Reverse"))
        }
      }
    }


    let baseSL = (Math.floor(target / 10) - Math.floor(this.result.roll / 10));
    let SL
    if (this.preData.SL == 0)
      SL = this.preData.SL
    else
      SL = this.preData.SL || baseSL + slBonus; // Use input SL if exists, otherwise, calculate from roll (used for editing a test result)


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
    this.result.baseSL = baseSL;
    this.result.breakdown = this.context.breakdown

    if (this.options.context) {
      if (this.options.context.general)
        this.result.other = this.result.other.concat(this.options.context.general)
      if (this.failed && this.options.context.failure)
        this.result.other = this.result.other.concat(this.options.context.failure)
      if (this.succeeded && this.options.context.success)
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

      // "rArm" and "lArm" from the table actually means "primary" and "secondary" arm
      // So convert the descriptions to match that. Opposed tests handle displaying
      // which arm was hit, as it is based on the actor's settings
      if (["lArm", "rArm"].includes(this.result.hitloc.result))
      {
        if (this.result.hitloc.result == "rArm")
        {
          this.result.hitloc.description = game.i18n.localize("Primary Arm")
        }
        if (this.result.hitloc.result == "lArm")
        {
          this.result.hitloc.description = game.i18n.localize("Secondary Arm")
        }
      }

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
        warhammer.utility.log("Error appyling homebrew mooCriticalMitigation: " + e)
      }
    }
    //@/HOUSE

    if (this.options.corruption) {
      await this.handleCorruptionResult();
    }
    if (this.options.mutate) {
      await this.handleMutationResult()
    }

    if (this.options.extended) {
      await this.handleExtendedTest()
    }

    if (this.options.income) {
      await this.handleIncomeTest()
    }

    if (this.options.crewTest)
    {
      this.result.crewTestSL = parseInt(this.result.SL);
      if (this.options.roleVital)
      {
        this.result.crewTestSL *= 2;
      }
    }

    if (this.options.rest) {
      this.result.woundsHealed = Math.max(Math.trunc(this.result.SL) + this.options.tb, 0);
      this.result.other.push(`${this.result.woundsHealed} ${game.i18n.localize("Wounds Healed")}`)
    }
  }

  async postTestGM(message)
  {
    if (!game.user.isGM)
    {
      return;
    }

    if (this.options.crewTest)
    {
      
      let crewTestMessage = game.messages.get(this.options.crewTestMessage)
      let crewTestData = crewTestMessage.getFlag("wfrp4e", "crewTestData");
      let crewTest = CrewTest.fromData(crewTestData);
      crewTest.updateRole(this.options.roleId, message)
    }
  }

  async handleSoundContext(chatOptions) 
  {
    
    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(this))
      chatOptions.sound = contextAudio.file || chatOptions.sound
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
      let handler = opposeMessage.system.opposedHandler;
      await handler.setDefender(this.message);
      await handler.computeOpposeResult();
      await this.actor.clearOpposed();
      await this.updateMessageData();
    }
    else // if actor is attacking - rerolling old test. 
    {
      if (this.opposedMessages.length)
      {
        for (let message of this.opposedMessages) {
          let handler = message.system.opposedHandler;
          await handler.setAttacker(this.message); // Make sure the opposed test is using the most recent message from this test
          if (handler.defenderTest) // If defender has rolled (such as if this test was rerolled or edited after the defender rolled) - recompute opposed test
            await handler.computeOpposeResult()
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

  async handleIncomeTest() {
    let { standing, tier } = this.options.income
    let result = this.result;

    let {earned} = await game.wfrp4e.market.rollIncome(null, {standing, tier})

    // After rolling, determined how much, if any, was actually earned
    if (result.outcome == "success") {
      this.result.incomeResult = game.i18n.localize("INCOME.YouEarn") + " " + earned;
      switch (tier) {
        case "b":
          result.incomeResult += ` ${game.i18n.localize("NAME.BPPlural").toLowerCase()}.`
          break;
        case "s":
          result.incomeResult += ` ${game.i18n.localize("NAME.SSPlural").toLowerCase()}.`
          break;
        case "g":
          if (earned == 1)
            result.incomeResult += ` ${game.i18n.localize("NAME.GC").toLowerCase()}.`
          else
            result.incomeResult += ` ${game.i18n.localize("NAME.GCPlural").toLowerCase()}.`
          break;
      }
    }
    else if (Number(result.SL) > -6) {
      earned /= 2;
      result.incomeResult = game.i18n.localize("INCOME.YouEarn") + " " + earned;
      switch (tier) {
        case "b":
          result.incomeResult += ` ${game.i18n.localize("NAME.BPPlural").toLowerCase()}.`
          break;
        case "s":
          result.incomeResult += ` ${game.i18n.localize("NAME.SSPlural").toLowerCase()}.`
          break;
        case "g":
          if (earned == 1)
            result.incomeResult += ` ${game.i18n.localize("NAME.GC").toLowerCase()}.`
          else
            result.incomeResult += ` ${game.i18n.localize("NAME.GCPlural").toLowerCase()}.`
          break;
      }
    }
    else {
      result.incomeResult = game.i18n.localize("INCOME.Failure")
      earned = 0;
    }
    // let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
    // cardOptions.sound = contextAudio.file || cardOptions.sound
    result.earned = earned + tier;
  }


  async handleCorruptionResult() {
    let strength = this.options.corruption;
    let failed = this.failed
    let corruption = 0 // Corruption GAINED
    switch (strength) {
      case game.i18n.localize("CORRUPTION.Minor").toLowerCase():
        if (failed)
          corruption++;
        break;

        case game.i18n.localize("CORRUPTION.Moderate").toLowerCase():
        if (failed)
          corruption += 2
        else if (this.result.SL < 2)
          corruption += 1
        break;

        case game.i18n.localize("CORRUPTION.Major").toLowerCase():
        if (failed)
          corruption += 3
        else if (this.result.SL < 2)
          corruption += 2
        else if (this.result.SL < 4)
          corruption += 1
        break;
    }

    // Revert previous test if rerolled
    if (this.context.reroll || this.context.fortuneUsedAddSL) {
      let previousFailed = this.context.previousResult.outcome == "failure"
      switch (strength) {
        case "minor":
          if (previousFailed)
            corruption--;
          break;

        case "moderate":
          if (previousFailed)
            corruption -= 2
          else if (this.context.previousResult.SL < 2)
            corruption -= 1
          break;

        case "major":
          if (previousFailed)
            corruption -= 3
          else if (this.context.previousResult.SL < 2)
            corruption -= 2
          else if (this.context.previousResult.SL < 4)
            corruption -= 1
          break;
      }
    }
    let newCorruption = Number(this.actor.system.status.corruption.value) + corruption
    if (newCorruption < 0) newCorruption = 0

    if (!this.context.reroll && !this.context.fortuneUsedAddSL)
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.format("CHAT.CorruptionFail", { name: this.actor.name, number: corruption }), "gmroll", false))
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.format("CHAT.CorruptionReroll", { name: this.actor.name, number: corruption }), "gmroll", false))

    await this.actor.update({ "system.status.corruption.value": newCorruption })
  }

  async handleMutationResult() 
  {
    if (this.failed) 
    {
      let wpb = this.actor.system.characteristics.wp.bonus;
      let tableText = game.i18n.localize("CHAT.MutateTable") + "<br>" + game.wfrp4e.config.corruptionTables.map(t => `@Table[${t}]<br>`).join("")
      ChatMessage.create(WFRP_Utility.chatDataSetup(`
      <h3>${game.i18n.localize("CHAT.DissolutionTitle")}</h3> 
      <p>${game.i18n.localize("CHAT.Dissolution")}</p>
      <p>${game.i18n.format("CHAT.CorruptionLoses", { name: this.actor.name, number: wpb })}
      <p>${tableText}</p>`,
        "gmroll", false))  
      this.actor.update({ "system.status.corruption.value": Number(this.actor.system.status.corruption.value) - wpb }, {skipCorruption: true}) // Don't keep checking corruption, causes a possible loop of dialogs
    }
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.localize("CHAT.MutateSuccess"), "gmroll", false))

  }
  
  async handleExtendedTest() {
    let item = fromUuidSync(this.options.extended);
    let deleteTest = false;
    if (item)
    {
      let itemData = item.toObject();
      let SL = Number(this.result.SL);

      if (game.settings.get("wfrp4e", "extendedTests") && SL == 0)
      {
        this.result.SL = this.result.roll <= this.result.target ? 1 : -1
      }

      if (itemData.system.failingDecreases.value) 
      {
        itemData.system.SL.current += SL
        if (!itemData.system.negativePossible.value && itemData.system.SL.current < 0)
        {
          itemData.system.SL.current = 0;
        }
      }
      else if (SL > 0)
      {
        itemData.system.SL.current += SL;
      }

      let displayString = `${itemData.name} ${itemData.system.SL.current} / ${itemData.system.SL.target} ${game.i18n.localize("SuccessLevels")}`

      if (itemData.system.SL.current >= itemData.system.SL.target) {

        if (getProperty(itemData, "flags.wfrp4e.reloading")) {
          let actor
          if (getProperty(itemData, "flags.wfrp4e.vehicle"))
            actor = WFRP_Utility.getSpeaker(getProperty(itemData, "flags.wfrp4e.vehicle"))

          actor = actor ? actor : this.actor
          let weapon = actor.items.get(getProperty(itemData, "flags.wfrp4e.reloading"))
          await weapon.update({ "flags.wfrp4e.-=reloading": null, "system.loaded.amt": weapon.loaded.max, "system.loaded.value": true })
        }

        if (itemData.system.completion.value == "reset")
        {
          itemData.system.SL.current = 0;
        }
        else if (itemData.system.completion.value == "remove") 
        {
          deleteTest = true;
        }
        displayString = displayString.concat(`<br><b>${game.i18n.localize("Completed")}</b>`)
      }

      this.result.other.push(displayString)

      if (deleteTest)
      {
        await item.delete();
      }
      else 
      { 
        await item.update(itemData)
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
      await this._showDiceSoNice(roll, this.context.chatOptions.rollMode || "roll", this.context.speaker);
      this.result.roll = roll.total;
    }
    else
      this.result.roll = this.preData.roll;
  }

  reset() {
    this.data.result = foundry.utils.mergeObject({
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
  async renderRollCard({ newMessage = false } = {}) 
  {

    let messageData = foundry.utils.deepClone(this.context.chatOptions);

    await this.handleSoundContext(messageData)

    this.result.breakdown.formatted = this.formatBreakdown()

    // Blank if manual chat cards
    if (game.settings.get("wfrp4e", "manualChatCards") && !this.message)
      this.result.roll = this.result.SL = null;

    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active && messageData.sound?.includes("dice"))
      messageData.sound = undefined;

    let templateData = {
      title: messageData.title,
      test: this,
      hideData: game.user.isGM,

    }


    if (this.context.targets.length) {
      templateData.title += ` - ${game.i18n.localize("Opposed")}`;
    }

    ChatMessage.applyRollMode(messageData, messageData.rollMode)

    let html = await renderTemplate(messageData.template, templateData)

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

      messageData.content = html;
      if (messageData.sound)
        warhammer.utility.log(`Playing Sound: ${messageData.sound}`)

      messageData.system = {testData : this.data};
      messageData.type = "test";
      let message = await ChatMessage.create(messageData)

      this.context.messageId = message.id
      await this.updateMessageData()
    }
    else // Update message 
    {
      messageData.content = html;

      // Update Message if allowed, otherwise send a request to GM to update
      if (game.user.isGM || this.message.isAuthor) {
        await this.message.update(messageData)
      }
      else {
        await SocketHandlers.executeOnUserAndWait("GM", "updateMessage", { id: this.message.id, updateData : messageData });
      }
      await this.updateMessageData()
    }
  }

  // Update message data without rerendering the message content
  async updateMessageData(updateData = {}) {
    let data = foundry.utils.mergeObject(this.data, updateData, { overwrite: true })
    let update = { "system.testData": data }
    
    if (this.message && game.user.isGM)
      await this.message.update(update)

    else if (this.message) {
      await SocketHandlers.executeOnUserAndWait("GM", "updateMessage", { id: this.message.id, updateData : update });
    }
  }


  async createOpposedMessage(token) {
    let oppose = new OpposedHandler();
    await oppose.setAttacker(this.message);
    let opposeMessageId = await oppose.startOppose(token);
    if (opposeMessageId) {
      this.context.opposedMessageIds.push(opposeMessageId);
    }
    await this.updateMessageData();
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
          overcastData.usage[choice].current += (parseInt(this.result.SL) + (parseInt(this.item.system.computeSpellPrayerFormula(undefined, false, overcastData.valuePerOvercast.additional)) || 0))
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
    if (game.settings.get("wfrp4e", "mooOvercasting") && this.spell) {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")

      let spent = (game.settings.get("wfrp4e-eis", "dharRules") && game.wfrp4e.config.magicWind[this.spell.lore.value] == "Dhar") ? 1 : 2
      this.result.SL = `+${this.result.SL - spent}`
      await this.calculateDamage()
    }
    //@/HOUSE
    
    await this.updateMessageData();
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
      let multiplier = (game.settings.get("wfrp4e-eis", "dharRules") && game.wfrp4e.config.magicWind[this.spell.lore.value] == "Dhar") ? 1 : 2
      this.result.SL = `+${Number(this.result.SL) + (multiplier * (overcastData.total - overcastData.available))}`
      await this.calculateDamage()
    }
    //@/HOUSE
    overcastData.available = overcastData.total;
    await this.updateMessageData();
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

  formatBreakdown()
  {
    let testBreakdown = "";
    let breakdown = this.result.breakdown

    try {

      // @@@@@@@@@@@@@@@ Test @@@@@@@@@@@@@@@@@@
      testBreakdown += `<p><strong>${game.i18n.localize("Characteristic")}</strong>: ${breakdown.characteristic}</p>`

      if (breakdown.skill)
      {
        testBreakdown += `<p><strong>${game.i18n.localize("Skill")}</strong>: ${breakdown.skill}</p>`
      }

      testBreakdown += `<p><strong>${game.i18n.localize("Difficulty")}</strong>: ${game.wfrp4e.config.difficultyLabels[breakdown.difficulty]}</p>`

      if (breakdown.modifier)
      {
        testBreakdown += `<p><strong>${game.i18n.localize("Modifier")}</strong>: ${HandlebarsHelpers.numberFormat(breakdown.modifier, {hash :{sign: true}})}</p>`
      }

      // No need to show SL value unless it's boosted by slBonus or successBonus
      if (breakdown.slBonus || (breakdown.successBonus && this.succeeded))
      {
        let SLstring = `<p><strong>${game.i18n.localize("SL")}</strong>: ${this.result.baseSL} (Base)`
        
        if (breakdown.slBonus)
        {
          if (breakdown.slBonus > 0)
          {
            SLstring += ` + ${breakdown.slBonus}`;
          }
          else if (breakdown.slBonus < 0)
          {
            SLstring += ` - ${Math.abs(breakdown.slBonus)}`;
          }
          SLstring += ` (${game.i18n.localize("DIALOG.SLBonus")})`;
        }
        
        if (breakdown.successBonus && this.succeeded)
        {
          if (breakdown.successBonus > 0)
          {
            SLstring += ` + ${breakdown.successBonus}`;
          }
          else if (breakdown.successBonus < 0)
          {
            SLstring += `- ${Math.abs(breakdown.successBonus)}`;
          }
          SLstring += ` (${game.i18n.localize("DIALOG.SuccessBonus")})`;
        }
        testBreakdown += SLstring
      }

      if (breakdown.modifiersBreakdown)
      {
        testBreakdown += `<hr><h4>${game.i18n.localize("CHAT.ModifiersBreakdown")}</h4>`
        testBreakdown += breakdown.modifiersBreakdown
      }

      // @@@@@@@@@@@@@@@@@@ Damage @@@@@@@@@@@@@@@@@@@@
      let damageBreakdown = "";

      damageBreakdown += `<p><strong>${game.i18n.localize("BREAKDOWN.Base")}</strong>: ${breakdown.damage.base}</p>`;
      if (breakdown.damage.item)
      {
        damageBreakdown += `<p><strong>${game.i18n.localize(CONFIG.Item.typeLabels[this.item?.type])}</strong>: ${breakdown.damage.item}</p>`;
      }

      for(let source of breakdown.damage.other)
      {
        damageBreakdown += `<p><strong>${source.label}</strong>: ${HandlebarsHelpers.numberFormat(source.value, {hash: {sign : true}})}`
      }

      return {test : testBreakdown, damage : damageBreakdown};
    }
    catch(e)
    {
      console.error(`Error generating formatted breakdown: ${e}`, this);
    }

  }



    /**
   * Use a fortune point from the actor to reroll or add sl to a roll
   * @param {String} type (reroll, addSL)
   */
    useFortune(type) {
      if (this.actor.system.status.fortune?.value > 0) 
      {
        let html = `<h3 class="center"><b>${game.i18n.localize("FORTUNE.Use")}</b></h3>`;
        //First we send a message to the chat
        if (type == "reroll")
          html += `${game.i18n.format("FORTUNE.UsageRerollText", { character: '<b>' + this.actor.name + '</b>' })}<br>`;
        else
          html += `${game.i18n.format("FORTUNE.UsageAddSLText", { character: '<b>' + this.actor.name + '</b>' })}<br>`;
  
        html += `<b>${game.i18n.localize("FORTUNE.PointsRemaining")} </b>${this.actor.system.status.fortune.value - 1}`;
        ChatMessage.create(WFRP_Utility.chatDataSetup(html));
  
  
        if (type == "reroll") {
          this.context.fortuneUsedReroll = true;
          this.context.fortuneUsedAddSL = true;
          this.reroll()
  
        }
        else //add SL
        {
          this.context.fortuneUsedAddSL = true;
          this.addSL(1)
        }
        this.actor.update({ "system.status.fortune.value": this.actor.system.status.fortune.value - 1 });
      }
    }

      /**
   * Take a Dark Deal to reroll for +1 Corruption
   * @param {Object} message 
   */
  useDarkDeal() {
    let html = `<h3 class="center"><b>${game.i18n.localize("DARKDEAL.Use")}</b></h3>`;
    html += `${game.i18n.format("DARKDEAL.UsageText", { character: '<b>' + this.actor.name + '</b>' })}<br>`;
    
    let corruption = Math.trunc(this.actor.system.status.corruption.value) + 1;
    html += `<b>${game.i18n.localize("Corruption")}: </b>${corruption}/${this.actor.system.status.corruption.max}`;

    ChatMessage.create(WFRP_Utility.chatDataSetup(html));
    this.actor.update({ "system.status.corruption.value": corruption });

    this.reroll()
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
  

  get targetModifiers() {
    return this.preData.testModifier + this.preData.testDifficulty + (this.preData.postOpposedModifiers.target || 0)
  }

  get succeeded() {
    return this.result.outcome == "success"
  }

  get failed() {
    return this.result.outcome == "failure"
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

  get targetTokens() {
    return this.context.targets.map(i => game.scenes.get(i.scene)?.tokens.get(i.token))
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

  get characteristicKey() { return this.preData.characteristic }

  get otherText() { return this.result.other?.length ? this.result.other.join("<br>") : null; }
}
