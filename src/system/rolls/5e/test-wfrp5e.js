
import WFRP_Audio from "../../audio-wfrp4e.js";
import WFRP_Utility from "../../utility-wfrp4e.js";

export default class TestWFRP5e extends WarhammerTestBase {
  constructor(data, actor) {
    super();
    if (!data)
      data = {}
    this.data = {
      testData: {
        definedSL: data.definedSL ?? null,
        SL: data.SL ?? 0,
        roll: data.roll,
        target: data.target,
        difficulty: data.difficulty,
        state: data.state,
        unreverse: false,
        hitLocation: {
          selected: data.hitLocation,
          table: data.hitLocationTable,
          roll: null,
          evaluate: data.hitLocation != "none"
        }
      },
      result: {
        roll: data.roll,
        description: "",
        tooltips: {},
        text: data.text || [],
        tables: {},
        actions: []
      },
      context: {
        itemData: data.context?.itemData,
        rollClass: this.constructor.name,
        rollMode: data.rollMode,
        reroll: false,
        edited: false,
        item: data.item?.id,
        speaker: data.speaker,
        title : data.context?.title,
        targets: data.targets,
        unopposed : data.unopposed,
        defending : data.defending,
        breakdown : data.context?.breakdown,
        messageId: data.messageId,
        messageTemplate: data.context?.messageTemplate,
        opposedMessageIds : data.opposedMessageIds || [],
      }
    }

    // store flags from dialog scripts in context
    foundry.utils.mergeObject(this.context, data.context?.flags || {});

    if (this.context.speaker && this.actor.isOpposing && this.context.targets.length)
    {
      ui.notifications.notify("TargetingCancelled", {localize: true});
      this.context.targets = [];
    }

    // Used for unopposed tests, dummy tests need to have speaker data
    if (!this.context.speaker && actor)
      this.context.speaker = actor.speakerData()
  }

  async runPreEffects() {
    if (!this.context.unopposed)
    {
      await Promise.all(this.actor.runScripts("preRollTest", { test: this }));
      if (this.item instanceof Item)
      {
        await Promise.all(this.item.runScripts("preRollTest", { test: this }));
      }
    }
  }

  async runPostEffects() {
    if (!this.context.unopposed)
    {
      await Promise.all(this.actor.runScripts("rollTest", { test: this }));
      if (this.item instanceof Item)
      {
        await Promise.all(this.item.runScripts("rollTest", { test: this }));
      }
      Hooks.call("wfrp4e:rollTest", this);
    }
  }

  async runScripts(trigger, args={})
  {
    // Important to preserve object reference for args so any changes done in the script is maintained (for anything besides the test arg)
    args.test = this;
    await Promise.all(this.actor.runScripts(trigger, args));
    if (this.item instanceof Item)
    {
      await Promise.all(this.item.runScripts(trigger, args));
    }
  }

  async roll() {
    await this.runPreEffects();

    await this.rollDice();
    this.initializeResult();
    await this.computeResult();
    this.computeTables();
    await this.runPostEffects();
    await this.postTest();

    this.result.breakdown = this.context.breakdown
    this.result.breakdown.formatted = this.formatBreakdown()

    // Do not render chat card or compute oppose if this is a dummy unopposed test
    if (!this.context.unopposed)
    {
      await this.renderMessage();
      await this.handleOpposed();
    }

    warhammer.utility.log("Rolled Test: ", undefined, this)
    return this
  }

  unreverse()
  {
    this.testData.unreverse = true;
    this.roll();
  }

  reverse()
  {
    // Reversing happens automatically, so this just unsets the unreverse flag
    this.testData.unreverse = false;
    this.roll();
  }

  _reverseDice(roll)
  {
    let reverseRoll = roll.toString();
    if (reverseRoll.length == 1)
    {
      reverseRoll = reverseRoll[0] + "0"
    }
    else if (reverseRoll == "100")
    {
          reverseRoll = "100";
    }
    else 
    {
      reverseRoll = reverseRoll[1] + reverseRoll[0]
    }

    reverseRoll = Number(reverseRoll);
    return reverseRoll;
  }


  initializeResult()
  {
    this.data.result = {
      SLModifier: 0, // Allow subclasses to modify before computing result
      actions: [],
      other: []
    };
  }

  /**
     * Provides the basic evaluation of a test.
     */
  async computeResult() {
    let automaticSuccess = game.settings.get("wfrp4e", "automaticSuccess");
    let automaticFailure = game.settings.get("wfrp4e", "automaticFailure");
    this.result.SLModifier += this.testData.SL + (game.wfrp4e.config.difficultyModifiers[this.testData.difficulty] || 0);
    this.result.target = this.testData.target;

    this.result.roll = this.testData.roll;
    this.result.originalRoll = this.result.roll;
    this.result.reversedRoll = this._reverseDice(this.result.roll);

    // Prompt for unreversal instead of reversal
    // Reasoning: Reversing is optional if you have advantage, and there may be good reason to do so
    // However, if some scripts perform actions due to a failed test that could've been reversed, this is annoying
    // because those scripts' actions aren't undone. Prompting for unreversal solves that somewhat.

    if (this.testData.state == "adv")
    {
      if (this.result.reversedRoll < this.result.originalRoll && !this.testData.unreverse)
      {
        this.result.reversed = true;
        this.result.canUnreverse = true;
      }
    }
    else if (this.testData.state == "dis")
    {
      if ( this.result.reversedRoll > this.result.originalRoll)
      {
        this.result.reversed = true;
      }
    }
    
    if (this.result.reversed)
    {
      this.result.roll = this.result.reversedRoll;
    }

    let baseSL = (Math.floor(this.result.target / 10) - Math.floor(this.result.roll / 10));
    if (game.settings.get("wfrp4e", "SLMethod") == "dos")
    {
      baseSL = Math.floor(Math.abs(this.result.target - this.result.roll) / 10) * ((this.result.target - this.result.roll) < 0 ? -1 : 1);
    }

    // Determine SL, either pre-defined or computed with achieved + modifier
    let SL = baseSL + this.result.SLModifier;

    // Automatic success/failure bind SL to +/-0
    if (this.result.roll >= automaticFailure) 
    {
      SL = Math.min(SL, 0);
      this.result.automaticFailure = true;
    }
    else if (this.result.roll <= automaticSuccess)
    {
      SL = Math.max(SL, 0);
      this.result.automaticSuccess = true;
    }

    // Now that we know SL we compute outcome, either "success" or "failure"
    this.result.SL = SL;
    await this.runScripts("computeSL");
    this.computeOutcome();


    // Now that outcome is set, determine critical/fumble. If not in combat, set SL to +/- 5 
     if (this.result.roll % 11 == 0 && this.result.success)
     {
       this.result.critical = true;
     }
     else if (this.result.roll % 11 == 0 && this.result.failure)
     {
        this.result.fumble = true;
      }

      await this.runScripts("computeCriticalFumble")

      if (!this.testData.combatCriticals)
      {
        if (this.result.fumble) this.result.SL = Math.min(-5, this.result.SL);
        else if (this.result.criical) this.result.SL = Math.max(5, this.result.SL);
      }
      
      if (this.testData.definedSL != null)
      {
        this.result.SL = this.testData.definedSL;
      }

      // Now that the final SL value is found, get the description (astounding, marginal, etc)
      this.computeDescription()

      if (this.result.SL == 0)
      {
        this.result.displaySL = `${this.result.success ? "+" : "-"}${this.result.SL}`;
      }
      else if (this.result.SL > 0)
      {
        this.result.displaySL = `+${this.result.SL}`;
      }
      else
      {
        this.result.displaySL = `${this.result.SL}`;
      }

    if (this.testData.hitLocation.evaluate)
    {
      await this.computeHitLocation();
      await this.runScripts("computeHitLocation");
  }

    return this.result;
  }
  
  computeDescription()
  {

    let description

    if (this.result.SL >= 5)
    {
      description = game.i18n.localize("ROLL.AstoundingSuccess")
    }
    else if (this.result.SL >= 3)
    {
      description = game.i18n.localize("ROLL.ImpressiveSuccess")
    }
    else if (this.result.SL >= 1)
    {
      description = game.i18n.localize("ROLL.Success")
    }
    else if (this.result.SL == 0)
    {
      if (this.result.success)
      {
          description = game.i18n.localize("ROLL.MarginalSuccess");
      }
      else if (this.result.failure)
      {
          description = game.i18n.localize("ROLL.MarginalFailure");
      }
    }
    else if (this.result.SL >= -2)
    {
      description = game.i18n.localize("ROLL.Failure")
    }
    else if (this.result.SL >= -4)
    {
      description = game.i18n.localize("ROLL.ImpressiveFailure")
    }
    else if (this.result.SL >= -5)
    {
      description = game.i18n.localize("ROLL.AstoundingFailure")
    }

    this.result.description = description;
  }

  computeOutcome()
  {
    if (this.result.SL == 0)
    {
      this.result.success = this.result.roll <= this.result.target;
      this.result.outcome = this.result.success ? "success" : "failure";
      this.result.failure = !this.result.success;
    }
    else if (this.result.SL > 0) 
    {
      this.result.success = true;
      this.result.outcome = "success"
    }
    else if (this.result.SL < 0)
    {
      this.result.failure = true;
      this.result.outcome = "failure"
    }
  }

  computeTables()
  {
    this.result.tables = {};
    if (this.result.critical && this.result.hitloc)
    {
      this.result.tables.critical = {
        label : game.i18n.localize("Critical"),
        class : "critical-roll",
        modifier : this.result.critModifier || 0,
        key: `crit${this.result.hitloc.result}`
      }
    }
    if (this.result.fumble)
    {
      this.result.tables.fumble = {
        label : game.i18n.localize("Fumble"),
        class : "fumble-roll",
        key : "oops"
      }
    }
  }

  async computeHitLocation()
  {
     // Called Shots
     if (this.testData.hitLocation.selected != "roll") // hitLocation.selected is possibly "none" but if so, testData.hitLocation would be false (see constructor) so this won't execute
     {
       this.result.hitloc = game.wfrp4e.tables.hitLocKeyToResult(this.testData.hitLocation.selected)
     }

     // Pre-set hitloc (e.g. editing a test)
     if (this.testData.hitLocation.roll)
     {
        this.result.hitloc = await game.wfrp4e.tables.rollTable("hitloc", { lookup: this.testData.hitLocation.roll, hideDSN: true });
     }

     // No defined hit loc, roll for one
    if (!this.result.hitloc)
    {
      if (false) // TODO: adding setting for reverse
      {
        this.result.hitloc = await game.wfrp4e.tables.rollTable("hitloc", { lookup: this.result.reversedRoll, hideDSN: true });
      }
      else
      {
        this.result.hitloc = await game.wfrp4e.tables.rollTable("hitloc", { hideDSN: true });
        this.testData.hitLocation.roll = this.result.hitloc.roll; // Prevent editing the test from changing the hit location every time
      }
    }

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

     if (this.testData.hitLocation.selected && this.testData.hitLocation.selected != "roll")
     {
       this.result.hitloc.description = this.testData.hitLocation.table[this.testData.hitLocation.selected] + ` (${game.i18n.localize("ROLL.CalledShot")})`
     }
  }

  // Function that all tests should go through after the main roll
  async postTest() 
  {

    // if (this.options.corruption) {
    //   await this.handleCorruptionResult();
    // }
    // if (this.options.mutate) {
    //   await this.handleMutationResult()
    // }

    // if (this.options.extended) {
    //   await this.handleExtendedTest()
    // }

    // if (this.options.income) {
    //   await this.handleIncomeTest()
    // }

    // if (this.options.crewTest)
    // {
    //   this.result.crewTestSL = parseInt(this.result.SL);
    //   if (this.options.roleVital)
    //   {
    //     this.result.crewTestSL *= 2;
    //   }
    // }

    // if (this.options.rest) {
    //   this.result.woundsHealed = Math.max(Math.trunc(this.result.SL) + this.options.tb, 0);
    // }
  }

  async postTestGM(message)
  {
    // if (!game.user.isGM)
    // {
    //   return;
    // }

    // if (this.options.crewTest)
    // {
      
    //   let crewTestMessage = game.messages.get(this.options.crewTestMessage)
    //   let crewTestData = crewTestMessage.getFlag("wfrp4e", "crewTestData");
    //   let crewTest = CrewTest.fromData(crewTestData);
    //   crewTest.updateRole(this.options.roleId, message)
    // }
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
      await handler.computeOpposeResult("5e");
      await this.actor.clearOpposed();
      await this.updateMessageModel();
    }
    else // if actor is attacking - rerolling old test. 
    {
      if (this.opposedMessages.length)
      {
        for (let message of this.opposedMessages) {
          let handler = message.system.opposedHandler;
          await handler.setAttacker(this.message); // Make sure the opposed test is using the most recent message from this test
          if (handler.defenderTest) // If defender has rolled (such as if this test was rerolled or edited after the defender rolled) - recompute opposed test
            await handler.computeOpposeResult("5e")
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
    let test = new game.wfrp4e.rolls5e[data.context.rollClass]()
    test.data = data

    return test
  }


  edit(data)
  {

    this.testData.definedSL = data.SL;
    this.testData.roll = data.roll;
    this.testData.unreverse = true;
    this.testData.target = data.target;
    this.testData.hitLocation.roll = data.hitloc;
    this.context.edited = true;

    return this.roll();
  }

  async reroll() {
    this.context.previousResult = this.result
    this.context.reroll = true;
    this.context.previousMessage = this.message.id;
    this.context.messageId = "";
    delete this.testData.roll;
    delete this.testData.unreverse;

    return this.roll()
  }
  /**
   * Start a dice roll
   * Used by the rollTest method and its overrides
   * @param {Object} testData
   */
  async rollDice() {
    if (!this.testData.roll) 
    {
      let roll = await new Roll("1d100").roll();
      this.testData.roll = roll.total;
      this._roll = roll; // used for the message
    }
  }

  async renderMessage({ newMessage = false } = {}) 
  {

    let messageData = {
      speaker: this.context.speaker,
    }
    
    await this.handleSoundContext(messageData)

    let templateData = {
      test: this,
      title: this.context.targets.length ? `${this.context.title} - ${game.i18n.localize("Opposed")}` : this.context.title
    }

    ChatMessage.applyRollMode(messageData, this.context.rollMode)

    let content = await foundry.applications.handlebars.renderTemplate(this.context.messageTemplate, templateData)
    messageData.content = content;

    if (newMessage || !this.message) {

      if (messageData.sound)
        warhammer.utility.log(`Playing Sound: ${messageData.sound}`)

      this.context.messageId = foundry.utils.randomID();
      messageData.system = this.data;
      messageData.type = "test5e";
      messageData._id = this.context.messageId;
      messageData.rolls = [this._roll];

      let message = await ChatMessage.create(messageData, {keepId : true, chatBubble: false})
    }
    else // Update message 
    {
      // Update Message if allowed, otherwise send a request to GM to update
      if (game.user.isGM || this.message.isAuthor) {
        await this.message.update(messageData)
      }
      else {
        await SocketHandlers.call("updateMessage", { id: this.message.id, updateData : messageData }, "GM");
      }
      await this.updateMessageModel()
    }
  }

  // Update message data without rerendering the message content
  async updateMessageModel(updateData = {}) {
    let data = foundry.utils.mergeObject(this.data, updateData, { overwrite: true })
    let update = { "system": data}
    
    if (this.message && game.user.isGM)
      await this.message.update(update)

    else if (this.message) {
      await SocketHandlers.call("updateMessage", { id: this.message.id, updateData : update }, "GM");
    }
  }

  // Backwards compatibility
  async updateMessageData(updateData = {})
  {
    return this.updateMessageModel(updateData);
  }

  async createOpposedMessage(token) {
    let oppose = new game.wfrp4e.opposedHandler();
    await oppose.setAttacker(this.message);
    let opposeMessageId = await oppose.startOppose(token);
    if (opposeMessageId) {
      this.context.opposedMessageIds.push(opposeMessageId);
    }
    await this.updateMessageModel();
  }


  formatBreakdown()
  {
    let testBreakdown = "";
    let breakdown = this.result.breakdown;

    try {

      // @@@@@@@@@@@@@@@ Test @@@@@@@@@@@@@@@@@@
      testBreakdown += `<p><strong>${game.i18n.localize("Characteristic")}</strong>: ${breakdown.characteristic}</p>`

      if (breakdown.skill)
      {
        testBreakdown += `<p><strong>${game.i18n.localize("Skill")}</strong>: ${breakdown.skill}</p>`
      }

      testBreakdown += `<p><strong>${game.i18n.localize("Difficulty")}</strong>: ${game.wfrp4e.config.difficultyLabels[breakdown.difficulty]}</p>`

      // No need to show SL value unless it's boosted by slBonus or successBonus
      if (breakdown.SL)
      {
          testBreakdown += `<p><strong>${game.i18n.localize("SL")}</strong>: ${foundry.applications.handlebars.numberFormat(breakdown.SL, {hash :{sign: true}})}</p>`
      }

      if (game.settings.get("wfrp4e", "SLMethod") != "default")
      {
        testBreakdown += "<p>SL Evaluated with " + (game.settings.get("wfrp4e", "SLMethod") == "fast" ? "Fast SL" : "Degrees of Success") + "</p>"
      }

      if (breakdown.modifiersBreakdown)
      {
        testBreakdown += `<hr><h4>${game.i18n.localize("CHAT.ModifiersBreakdown")}</h4>`
        testBreakdown += breakdown.modifiersBreakdown
      }

      return {test : testBreakdown};
    }
    catch(e)
    {
      console.error(`Error generating formatted breakdown: ${e}`, this);
    }
  }

  // Registers an action within the test, creating a button in the chat message
  // When pressed, find effect and script index, execute that script
  addAction({label, scriptIndex, effectId=null, effectPath=null, itemUuid=null})
  {
    this.result.actions.push({label, effectId, effectPath, scriptIndex, itemUuid});
  }

  async executeAction({actionIndex, scriptIndex,  effectId=null, effectPath=null, itemUuid=null})
  {
    if (this.result.actions[actionIndex])
    {
      let item = itemUuid ? await fromUuid(itemUuid) : this.item;
      let effect;
      if (effectId)
      {
        effect = item.effects.get(effectId);
      }
      else if (effectPath)
      {
        effect = foundry.utils.getProperty(item, effectPath);
      }
      if (effect)
      {
        let script = effect.scripts[scriptIndex];
        if (script)
        {
          await script.execute({test: this});
        }
      }
    }
  }

  get item() 
  {
    if (this.context.itemData)
      return new CONFIG.Item.documentClass(this.context.itemData, { parent: this.actor });
    else
      return this.actor.items.get(this.context.item);
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

  get e5() {
    return true;
  }
  
  get target() { return this.data.result.target }
  get size() { return this.useMount ? this.actor.mount.details.size.value : this.actor.details.size.value }
  get options() { return this.data.testData.options }
  get outcome() { return this.data.result.outcome }
  get result() { return this.data.result }
  get testData() { return this.data.testData }
  get context() { return this.data.context }
  get actor() { return WFRP_Utility.getSpeaker(this.context.speaker) }
  get token() { return WFRP_Utility.getToken(this.context.speaker) }

  get targets() {
    return this.context.targets.map(i => WFRP_Utility.getSpeaker(i))
  }

  get targetTokens() {
    return this.context.targets.map(i => game.scenes.get(i.scene)?.tokens.get(i.token))
  }

}