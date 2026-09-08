
import WFRP_Audio from "../../audio-wfrp4e.js";
import WFRP_Utility from "../../utility-wfrp4e.js";

export default class TestWFRP5e extends WarhammerTestBase {
  constructor(data) {
    super();
    if (!data)
      data = {}
    this.data = {
      testData: {
        definedSL: data.definedSL,
        SL: data.SL,
        roll: data.roll,
        target: data.target,
        difficulty: data.difficulty,
        state: data.state,
        reverse: false,
      },
      result: {
        roll: data.roll,
        description: "",
        tooltips: {},
        text: data.text || [],
      },
      context: {
        rollClass: this.constructor.name,
        rollMode: data.rollMode,
        reroll: false,
        edited: false,
        item: data.item,
        speaker: data.speaker,
        title : data.context?.title,
        targets: data.targets,
        unopposed : data.unopposed,
        defending : data.defending,
        breakdown : data.breakdown,
        messageId: data.messageId,
        messageTemplate: data.context?.messageTemplate,
        opposedMessageIds : data.opposedMessageIds || [],
      }
    }

    if (this.context.speaker && this.actor.isOpposing && this.context.targets.length)
    {
      ui.notifications.notify("TargetingCancelled", {localize: true});
      this.context.targets = [];
    }
  }

  async runPreEffects() {
    if (!this.context.unopposed)
    {
      await Promise.all(this.actor.runScripts("preRollTest", { test: this }))
      if (this.item instanceof Item)
      {
        await Promise.all(this.item.runScripts("preRollTest", { test: this }))
      }
    }
  }

  async runPostEffects() {
    if (!this.context.unopposed)
    {
      await Promise.all(this.actor.runScripts("rollTest", { test: this }))
      if (this.item instanceof Item)
      {
        await Promise.all(this.item.runScripts("rollTest", { test: this }))
      }
      Hooks.call("wfrp4e:rollTest", this)
    }
  }

  async roll() {
    await this.runPreEffects();

    await this.rollDice();
    await this.computeResult();
    // this.computeTables();
    await this.runPostEffects();
    await this.postTest();

    // Do not render chat card or compute oppose if this is a dummy unopposed test
    if (!this.context.unopposed)
    {
      await this.renderMessage();
      await this.handleOpposed();
    }

    warhammer.utility.log("Rolled Test: ", undefined, this)
    return this
  }

  reverse()
  {
    this.testData.reverse = true;
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

  /**
     * Provides the basic evaluation of a test.
     */
  async computeResult() {
    this.data.result = {};
    let automaticSuccess = game.settings.get("wfrp4e", "automaticSuccess");
    let automaticFailure = game.settings.get("wfrp4e", "automaticFailure");
    this.result.SLModifier = this.testData.SL + game.wfrp4e.config.difficultyModifiers[this.testData.difficulty];
    this.result.target = this.testData.target;
    this.result.reversed = this.testData.reverse;

    this.result.roll = this.testData.roll;
    this.result.originalRoll = this.result.roll;
    this.result.reversedRoll = this._reverseDice(this.result.roll);

    if (this.testData.state == "adv")
    {
      if (this.result.reversedRoll < this.result.originalRoll)
      {
        this.result.canReverse = true;
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
      this.result.canReverse = false; // Remove reverse option if already reversed
      this.result.roll = this.result.reversedRoll;
    }

    let baseSL = (Math.floor(this.result.target / 10) - Math.floor(this.result.roll / 10));
    if (game.settings.get("wfrp4e", "SLMethod") == "dos")
    {
      baseSL = Math.floor(Math.abs(this.result.target - this.result.roll) / 10) * ((this.result.target - this.result.roll) < 0 ? -1 : 1);
    }

    let SL 
    if (this.testData.definedSL)
    {
      SL = this.testData.definedSL
    }
    else
    {
      SL = baseSL + this.result.SLModifier;
    }

    if (this.result.roll >= automaticFailure) 
    {
      SL = Math.max(SL, 0);
      this.result.automaticFailure = true;
    }
    else if (this.result.roll <= automaticSuccess)
    {
      SL = Math.min(SL, 0);
      this.result.automaticSuccess = true;
    }

    this.result.SL = SL;
    this.result.outcome = this.computeOutcome()

     if (this.result.roll % 11 == 0 && this.result.success)
     {
        this.result.SL = 5;
        this.result.critical = true;
     }
     else if (this.result.roll % 11 == 0 && this.result.failure)
      {
         this.result.SL = -5;
         this.result.fumble = true;
      }
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

    // this.result.breakdown = this.context.breakdown
    // this.result.breakdown.formatted = this.formatBreakdown()

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
      this.result.success = true;
      this.result.outcome = "success"; // TODO implement
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
    if (this.result.critical && this.result.hitloc)
    {
      this.result.tables.critical = {
        label : this.result.critical,
        class : "critical-roll",
        modifier : this.result.critModifier || 0,
        key: `crit${this.result.hitloc.result}`
      }
    }
    if (this.result.fumble)
    {
      this.result.tables.fumble = {
        label : this.result.fumble,
        class : "fumble-roll",
        key : "oops"
      }
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

    // // If the actor has been targeted - roll defense
    // if (this.actor.isOpposing || this.context.defending)
    // {
    //   let opposeMessage;
    //   if (this.context.defending) // Rehandling a previous defense roll
    //   {
    //     opposeMessage = this.opposedMessages[0]
    //   }
    //   else
    //   {
    //     this.context.defending = true; // If the test is handled again after the initial roll, the actor flag doesn't exist anymore, need a way to know we're still defending
    //     opposeMessage = game.messages.get(this.actor.flags.oppose.opposeMessageId);
    //     this.context.opposedMessageIds.push(opposeMessage.id); // Maintain a link to the opposed message
    //   }
      
    //   // Get oppose message, set this test's message as defender, compute result
    //   let handler = opposeMessage.system.opposedHandler;
    //   await handler.setDefender(this.message);
    //   await handler.computeOpposeResult();
    //   await this.actor.clearOpposed();
    //   await this.updateMessageModel();
    // }
    // else // if actor is attacking - rerolling old test. 
    // {
    //   if (this.opposedMessages.length)
    //   {
    //     for (let message of this.opposedMessages) {
    //       let handler = message.system.opposedHandler;
    //       await handler.setAttacker(this.message); // Make sure the opposed test is using the most recent message from this test
    //       if (handler.defenderTest) // If defender has rolled (such as if this test was rerolled or edited after the defender rolled) - recompute opposed test
    //         await handler.computeOpposeResult()
    //     }
    //   }
    //   else { // actor is attacking - new test
    //     // For each target, create opposed test messages, save those message IDs in this test.
    //     for (let token of this.context.targets.map(t => WFRP_Utility.getToken(t))) {
    //       await this.createOpposedMessage(token)
    //     }
    //   }
    // }
  }

  // Create a test from already formed data
  static recreate(data) {
    let test = new game.wfrp4e.rolls5e[data.context.rollClass]()
    test.data = data

    return test
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
    }
  }

  async renderMessage({ newMessage = false } = {}) 
  {

    let messageData = {
      speaker: this.context.speaker,
      // rolls : [Roll.fromData({evaluated: true, terms: [{results: [{result: this.result.originalRoll, active: true}]}]})]
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
        testBreakdown += `<p><strong>${game.i18n.localize("Modifier")}</strong>: ${foundry.applications.handlebars.numberFormat(breakdown.modifier, {hash :{sign: true}})}</p>`
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

      if (game.settings.get("wfrp4e", "SLMethod") != "default")
      {
        testBreakdown += "<p>SL Evaluated with " + (game.settings.get("wfrp4e", "SLMethod") == "fast" ? "Fast SL" : "Degrees of Success") + "</p>"
      }

      if (breakdown.modifier)
      {
        testBreakdown += `<p><strong>${game.i18n.localize("Modifier")}</strong>: ${foundry.applications.handlebars.numberFormat(breakdown.modifier, {hash :{sign: true}})}</p>`
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
        damageBreakdown += `<p><strong>${source.label}</strong>: ${foundry.applications.handlebars.numberFormat(source.value, {hash: {sign : true}})}`
      }

      return {test : testBreakdown, damage : damageBreakdown};
    }
    catch(e)
    {
      console.error(`Error generating formatted breakdown: ${e}`, this);
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
  
  get target() { return this.data.result.target }
  get size() { return this.useMount ? this.actor.mount.details.size.value : this.actor.details.size.value }
  get options() { return this.data.preData.options }
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