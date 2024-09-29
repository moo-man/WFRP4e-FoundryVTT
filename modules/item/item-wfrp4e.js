import WFRP_Utility from "../system/utility-wfrp4e.js";

/**
 * @extends Item
 * @mixes WarhammerItem
 * @category - Documents
 */
export default class ItemWfrp4e extends WarhammerItem
{
  async _preCreate(data, options, user) {
    let migration = game.wfrp4e.migration.migrateItemData(this)
    this.updateSource({effects : game.wfrp4e.migration.removeLoreEffects(data)}, {recursive : false});

    if (!foundry.utils.isEmpty(migration))
    {
      this.updateSource(migration)
      warhammer.utility.log("Migrating Item: " + this.name, true, migration)
    }

    await super._preCreate(data, options, user)
  }

  async _onCreate(data, options, user)
  {
    if (game.user.id != user)
    {
        return;
    }
    await super._onCreate(data, options, user);

    if (this.isOwned)
    {
      await Promise.all(this.actor.runScripts("update", {data, context: "create"}))

      // Cannot simply call runScripts here because that would only be for Item effects
      // If an item has a transfered effect, it won't call "addItems" scripts because the effect's
      // onCreate method isn't called. Same reason handleImmediate scripts doesn't call runScripts
      let effects = Array.from(this.allApplicableEffects()).filter(effect => effect.system.transferData.type == "document" && ["Actor", "Item"].includes(effect.system.transferData.documentType));
      for(let effect of effects)
      {
        for(let script of effect.scripts.filter(s => s.trigger == "addItems"))
        {
          await script.execute({data, options, user});
        }
      }
    }

  }

  async _onUpdate(data, options, user)
  {
    await super._onUpdate(data, options, user)
    
    if (game.user.id != user)
    {
        return;
    }

    if (this.actor) {
      await Promise.all(this.actor.runScripts("update", {item : this, context: "update"}))
    }
  }

  async _onDelete(options, user) 
  {
    if (game.user.id != user)
    {
        return;
    }
    await super._onDelete(options, user);

    if (!options.skipDeletingItems)
    {
      for(let effect of this.effects)
      {
        await effect.deleteCreatedItems();
      }
    }

    for(let effect of this.effects)
    {
      for(let script of effect.scripts.filter(i => i.trigger == "deleteEffect"))
      {
          await script.execute({options, user});
      }
    }

    if (this.actor) {
      // TODO change this trigger
      await Promise.all(this.actor.runScripts("update", {item : this, context: "delete"}));
    }
  }

  // Conditions shouldn't be tied to the item. Add them to the actor independently.
  async _handleConditions(data, options)
  {
      if (options.condition)
      {
        return // options.condition as true avoids this process
      }

      let conditions = this.effects.filter(e => e.isCondition);

      // updateSource doesn't seem to work here for some reason: 
      // this.updateSource({effects : []})
      this._source.effects = this.effects.filter(e => !e.isCondition).filter(e => e.toObject());

      this.actor?.createEmbeddedDocuments("ActiveEffect", conditions);
  }

    // This function runs the immediate scripts an Item contains in its effects
    // when the Item is added to an Actor. 
    async handleImmediateScripts(data, options, user)
    {
        let effects = Array.from(this.allApplicableEffects()).filter(effect => 
            effect.system.transferData.type == "document" && 
            effect.system.transferData.documentType == "Actor"); // We're looking for actor because if the immediate script was for the Item, it would've been called when it was created. 

        for(let e of effects)
        {
            let keepEffect = await e.handleImmediateScripts(data, options, user);
            if (keepEffect == false) // Can't actually delete the effect because it's owned by an item in _preCreate. Change it to `other` type so it doesn't show in the actor
            {
                e.updateSource({"system.transferData.type" : "other"});
            }
        }

        // let scripts = effects.reduce((prev, current) => prev.concat(current.scripts.filter(i => i.trigger == "immediate")), []);

        // await Promise.all(scripts.map(s => s.execute()));
    }



  prepareBaseData()
  {
    this.system.computeBase();
    this.runScripts("prePrepareData", { item: this })
  }

  prepareDerivedData()
  {
    this.system.computeDerived();
    this.runScripts("prepareData", { item: this })
  }

  prepareOwnedData()
  {
    this.actor.runScripts("prePrepareItem", { item: this })
    this.system.computeOwned();
    this.actor.runScripts("prepareItem", { item: this })
    this.runScripts("prepareOwned", { item: this })

  }

  async addCondition(effect, value = 1, mergeData={}) {
    if (value == 0)
    {
      return;
    }
    if (typeof value == "string")
    {
      value = parseInt(value)
    }

    if (typeof (effect) === "string")
      effect = foundry.utils.duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"


    let existing = this.hasCondition(effect.id)

    if (existing && !existing.isNumberedCondition)
      return existing
    else if (existing) 
    {
      return existing.update({"system.condition.value" : existing.conditionValue + value})
    }
    else if (!existing) {
      effect.name = game.i18n.localize(effect.name);

      if (effect.system.condition.numbered)
        effect.system.condition.value = value;
        
      effect["statuses"] = [effect.id];

      foundry.utils.mergeObject(effect, mergeData, {overwrite: false});

      delete effect.id
      return this.createEmbeddedDocuments("ActiveEffect", [effect], {condition: true})
    }
  }

  async removeCondition(effect, value = 1) {
    if (typeof (effect) === "string")
      effect = foundry.utils.duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"

    if (value == 0)
    {
      return;
    }
    if (typeof value == "string")
    {
      value = parseInt(value)
    }

    let existing = this.hasCondition(effect.id);

    if (existing && !existing.isNumberedCondition) 
    {
      return existing.delete();
    }
    else if (existing) 
    {
      await existing.update({"system.condition.value" : existing.conditionValue - value});
    }

    if (existing.conditionValue <= 0)
    {
      return existing.delete();
    }
  }


  /**
   * Posts this item to chat.
   * 
   * postItem() prepares this item's chat data to post it to chat, setting up 
   * the image if it exists, as well as setting flags so drag+drop works.
   * 
   */
  async postItem(quantity, mergeData={}) {
    const properties = this.system.chatData();
    let postedItem = foundry.utils.mergeObject(this.toObject(), mergeData)
    let chatData = foundry.utils.duplicate(postedItem);
    chatData["properties"] = properties

    //Check if the posted item should have availability/pay buttons
    chatData.hasPrice = "price" in chatData.system && this.type != "cargo";
    if (chatData.hasPrice) {
      if (!chatData.system.price.gc || isNaN(chatData.system.price.gc || 0))
        chatData.system.price.gc = 0;
      if (!chatData.system.price.ss || isNaN(chatData.system.price.ss || 0))
        chatData.system.price.ss = 0;
      if (!chatData.system.price.bp || isNaN(chatData.system.price.bp))
        chatData.system.price.bp = 0;
    }

    let dialogResult;
    if (quantity == undefined && (this.type == "weapon" || this.type == "armour" || this.type == "ammunition" || this.type == "container" || this.type == "money" || this.type == "trapping")) {
      dialogResult = await new Promise((resolve, reject) => {
        new Dialog({
          content:
            `<p>${game.i18n.localize("DIALOG.EnterQuantity")}</p>
          <div class="form-group">
            <label> ${game.i18n.localize("DIALOG.PostQuantity")}</label>
            <input style="width:100px" name="post-quantity" type="number" value="1"/>
          </div>
          <div class="form-group">
          <label> ${game.i18n.localize("DIALOG.ItemQuantity")}</label>
          <input style="width:100px" name="item-quantity" type="number" value="${this.quantity.value}"/>
        </div>
        <p>${game.i18n.localize("DIALOG.QuantityHint")}</p>
          `,
          title: game.i18n.localize("DIALOG.PostQuantity"),
          buttons: {
            post: {
              label: game.i18n.localize("Post"),
              callback: (dlg) => {
                resolve({
                  post: dlg.find('[name="post-quantity"]').val(),
                  qty: dlg.find('[name="item-quantity"]').val()
                })
              }
            },
            inf: {
              label: game.i18n.localize("Infinite"),
              callback: (dlg) => {
                resolve({ post: "inf", qty: dlg.find('[name="item-quantity"]').val() })
              }
            },
          }
        }).render(true)
      })

      if (dialogResult.post != "inf" && (!Number.isNumeric(dialogResult.post) || parseInt(dialogResult.post) <= 0))
        return ui.notifications.error(game.i18n.localize("CHAT.PostError"))

      if (dialogResult.qty != "inf" && (!Number.isNumeric(dialogResult.qty) || parseInt(dialogResult.qty) < 0))
        return ui.notifications.error(game.i18n.localize("CHAT.PostError"))


      let totalQtyPosted = (dialogResult.post * dialogResult.qty)
      if (Number.isNumeric(totalQtyPosted)) {
        if (this.isOwned) {
          if (this.quantity.value < totalQtyPosted) {
            return ui.notifications.notify(game.i18n.format("CHAT.PostMoreThanHave"))
          }
          else {
            ui.notifications.notify(game.i18n.format("CHAT.PostQuantityReduced", { num: totalQtyPosted }));
            this.update({ "system.quantity.value": this.quantity.value - totalQtyPosted })
          }
        }
      }


      if (dialogResult.post != "inf")
        chatData.showQuantity = true

      chatData.postQuantity = dialogResult.post;
      postedItem.system.quantity.value = dialogResult.qty
      chatData.system.quantity.value = dialogResult.qty
    }
    else if (quantity > 0) {
      chatData.postQuantity = quantity;
      chatData.showQuantity = true;
    }

    // if (dialogResult.post != "inf" && isNaN(dialogResult.post * dialogResult.qty))
    //   return


    // Don't post any image for the item (which would leave a large gap) if the default image is used
    if (chatData.img.includes("/blank.png"))
      chatData.img = null;

    renderTemplate('systems/wfrp4e/templates/chat/post-item.hbs', chatData).then(html => {
      let chatOptions = WFRP_Utility.chatDataSetup(html)

      // Setup drag and drop data
      chatOptions["flags.transfer"] = JSON.stringify(
        {
          type: "Item",
          data: postedItem,
        })
      chatOptions["flags.postQuantity"] = chatData.postQuantity;
      chatOptions["flags.recreationData"] = chatData;
      ChatMessage.create(chatOptions)
    });
  }

  //#endregion
   
  get mountDamage() {
    return this.system.mountDamage || this.system.Damage;
  }

  // Don't really like this, but I don't think I can change it easily (used by scripts)
  get characteristic() {
    if (!this.isOwned)
      return this.system.characteristic
    let char
    if (this.type == "skill") {
      char = this.actor.characteristics[this.system.characteristic.value]
      char.key = this.system.characteristic.value
    }
    if (this.type == "trait" && this.rollable.value) {
      char = this.actor.characteristics[this.system.rollable.rollCharacteristic]
      char.key = this.system.rollable.rollCharacteristic
    }
    return char
  }

    // Used for item category display when in a container
  get trappingCategory() {
      if (this.type == "trapping")
        return game.wfrp4e.config.trappingCategories[this.trappingType.value];
      else
        return game.wfrp4e.config.trappingCategories[this.type];
  }

  get parenthesesText()
  {
    return game.wfrp4e.utility.extractParenthesesText(this.name)
  }

  get fromEffect() 
  {
    if (this.isOwned)
    {
      let applicableEffects = Array.from(this.actor.allApplicableEffects());
      
      return applicableEffects.find(i => i.id == this.getFlag("wfrp4e", "fromEffect"));
    }
  }

  // While I wish i could remove most of these, scripts use them and removing them would cause a lot of disruption
  // They made more sense in the `data.data` days
  get attackType()         { return this.system.attackType }
  get isMelee()            { return this.system.isMelee }
  get isRanged()           { return this.system.isRanged }
  get isEquipped()         { return this.system.isEquipped }
  get WeaponGroup()        { return this.system.WeaponGroup }
  get Reach()              { return this.system.Reach }
  get Max()                { return this.system.Max }
  get DisplayName()        { return this.system.DisplayName }
  get cost()               { return this.system.cost }
  get included()           { return !this.system.disabled } // not checking enabled because only traits have enabled getter
  get reachNum()           { return this.system.reachNum }   
  get ammo()               { return this.system.ammo }   
  get ammoList()           { return this.system.ammoList }   
  get ingredient()         { return this.system.ingredient }   
  get ingredientList()     { return this.system.ingredientList }   
  get skillToUse()         { return this.system.skillToUse }   
  get loading()            { return this.system.loading }   
  get repeater()           { return this.system.repeater }   
  get reloadingTest()      { return this.actor.items.get(getProperty(this.data, "flags.wfrp4e.reloading")) }   
  get protects()           { return this.system.protects }   
  get properties()         { return this.system.properties }   
  get originalProperties() { return this.system.originalProperties }   
  get modified()           { return this.system.modified }   
  get Advances()           { return this.system.Advances }   
  get Qualities()          { return this.system.Qualities }   
  get UnusedQualities()    { return this.system.UnusedQualities }   
  get InactiveQualities()  { return this.system.InactiveQualities }   
  get Flaws()              { return this.system.Flaws }   
  get OriginalQualities()  { return this.system.OriginalQualities; }   
  get OriginalFlaws()      { return this.system.OriginalFlaws; }   
  get QualityGroups()      { return this.system.QualityGroups; }   
  get Target()             { return this.system.Target }   
  get Duration()           { return this.system.Duration }   
  get Range()              { return this.system.Range }   
  get Damage()             { return this.system.Damage }   
  get DamageString()       { return this.system.DamageString }  
  get Specification()      { return this.system.Specification }
  get SpecificationBonus() { return this.system.SpecificationBonus }
  get advanced()           { return this.system.advanced }
  get advances()           { return this.system.advances }
  get ammunitionGroup()    { return this.system.ammunitionGroup }
  get ammunitionType()     { return this.system.ammunitionType }
  get armorType()          { return this.system.armorType }
  get availability()       { return this.system.availability }
  get career()             { return this.system.career }
  get careergroup()        { return this.system.careergroup }
  get cargoType()          { return this.system.cargoType }
  get carries()            { return this.system.carries }
  get characteristics()    { return this.system.characteristics }
  get class()              { return this.system.class }
  get cn()                 { return this.system.cn }
  get coinValue()          { return this.system.coinValue }
  get complete()           { return this.system.complete }
  get completion()         { return this.system.completion }
  get consumesAmmo()       { return this.system.consumesAmmo }
  get contraction()        { return this.system.contraction }
  get countEnc()           { return this.system.countEnc }
  get current()            { return this.system.current }
  get currentAmmo()        { return this.system.currentAmmo }
  get currentAP()          { return this.system.currentAP }
  get currentIng()         { return this.system.currentIng }
  get damage()             { return this.system.damage }
  get damageToItem()       { return this.system.damageToItem }
  get description()        { return this.system.description }
  get duration()           { return this.system.duration }
  get encumbrance()        { return this.system.encumbrance }
  get equipped()           { return this.system.equipped }
  get failingDecreases()   { return this.system.failingDecreases }
  get flaws()              { return this.system.flaws }
  get gmdescription()      { return this.system.gmdescription }
  get god()                { return this.system.god }
  get grouped()            { return this.system.grouped }
  get hide()               { return this.system.hide }
  get incomeSkill()        { return this.system.incomeSkill }
  get incubation()         { return this.system.incubation }
  get ingredients()        { return this.system.ingredients }
  get level()              { return this.system.level }
  get loaded()             { return this.system.loaded }
  get location()           { return this.system.location }
  get lore()               { return this.system.lore }
  get magicMissile()       { return this.system.magicMissile }
  get max()                { return this.system.max }
  get AP()                 { return this.system.AP }
  get APdamage()           { return this.system.APdamage }
  get memorized()          { return this.system.memorized }
  get modeOverride()       { return this.system.modeOverride }
  get modifier()           { return this.system.modifier }
  get modifiesSkills()     { return this.system.modifiesSkills }
  get modType()            { return this.system.modType }
  get mutationType()       { return this.system.mutationType }
  get negativePossible()   { return this.system.negativePossible }
  get offhand()            { return this.system.offhand }
  get origin()             { return this.system.origin }
  get overcast()           { return this.system.overcast }
  get penalty()            { return this.system.penalty }
  get permanent()          { return this.system.permanent }
  get price()              { return this.system.price }
  get qualities()          { return this.system.qualities }
  get quality()            { return this.system.quality }
  get quantity()           { return this.system.quantity }
  get range()              { return this.system.range }
  get reach()              { return this.system.reach }
  get rollable()           { return this.system.rollable }
  get skill()              { return this.system.skill }
  get skills()             { return this.system.skills }
  get SL()                 { return this.system.SL }
  get special()            { return this.system.special }
  get specification()      { return this.system.specification }
  get spellIngredient()    { return this.system.spellIngredient }
  get status()             { return this.system.status }
  get symptoms()           { return this.system.symptoms }
  get talents()            { return this.system.talents }
  get target()             { return this.system.target }
  get test()               { return this.system.test }
  get tests()              { return this.system.tests }
  get total()              { return this.system.total }
  get trappings()          { return this.system.trappings }
  get trappingType()       { return this.system.trappingType }
  get twohanded()          { return this.system.twohanded }
  get prayerType()         { return this.system.type }
  get unitPrice()          { return this.system.unitPrice }
  get weaponGroup()        { return this.system.weaponGroup || "basic" }
  get wearable()           { return this.system.wearable }
  get wind()               { return this.system.wind }
  get worn()               { return this.system.worn }
  get wounds()             { return this.system.wounds }
  //#endregion
}