import WFRP_Utility from "./utility-wfrp4e.js";

export default function () {


  // Convert functions that move data between world and compendium to retain ID
  Actors.prototype.fromCompendium = keepID(Actors.prototype.fromCompendium);
  Items.prototype.fromCompendium = keepID(Items.prototype.fromCompendium);
  Journal.prototype.fromCompendium = keepID(Journal.prototype.fromCompendium);
  Scenes.prototype.fromCompendium = keepID(Scenes.prototype.fromCompendium);
  RollTables.prototype.fromCompendium = keepID(RollTables.prototype.fromCompendium);

  Actor.implementation.prototype.toCompendium = keepID(Actor.implementation.prototype.toCompendium);
  Item.implementation.prototype.toCompendium = keepID(Item.implementation.prototype.toCompendium);
  JournalEntry.implementation.prototype.toCompendium = keepID(JournalEntry.implementation.prototype.toCompendium);
  Scene.implementation.prototype.toCompendium = keepID(Scene.implementation.prototype.toCompendium);
  RollTable.implementation.prototype.toCompendium = keepID(RollTable.implementation.prototype.toCompendium);



  function keepID(orig)
  {
    return function(...args)
    {
      try {
        args[1].keepId = true;
      }
      catch(e)
      {
        console.error("Error setting keepId: " + e);
      }
      return orig.bind(this)(...args);
    }
  }

  // Modify the initiative formula depending on whether the actor has ranks in the Combat Reflexes talent
  Combatant.prototype._getInitiativeFormula = function () {
    const actor = this.actor;
    let initiativeFormula = CONFIG.Combat.initiative.formula || game.system.initiative;

    if (!actor) return initiativeFormula;



    let args = { initiative: initiativeFormula }
    actor.runEffects("getInitiativeFormula", args)

    return args.initiative;
  };

    /**
   * Draw the active effects and overlay effect icons which are present upon the Token
   */
     Token.prototype.drawEffects = async function() {
      this.effects.removeChildren().forEach(c => c.destroy());
      this.effects.bg = this.effects.addChild(new PIXI.Graphics());
      this.effects.overlay = null;
  
      // Categorize new effects
      const tokenEffects = this.document.effects;
      const actorEffects = this.actor?.temporaryEffects || [];
      let overlay = {
        src: this.document.overlayEffect,
        tint: null
      };
  
      // Draw status effects
      if ( tokenEffects.length || actorEffects.length ) {
        const promises = [];
  
        // Draw actor effects first
        for ( let f of actorEffects ) {
          if ( !f.icon ) continue;
          const tint = Color.from(f.tint ?? null);
          if ( f.getFlag("core", "overlay") ) {
            overlay = {src: f.icon, tint};
            continue;
          }
          promises.push(this._drawEffect(f.icon, tint, getProperty(f, "flags.wfrp4e.value")));
        }
  
        // Next draw token effects
        for ( let f of tokenEffects ) promises.push(this._drawEffect(f, null));
        await Promise.all(promises);
      }
  
      // Draw overlay effect
      this.effects.overlay = await this._drawOverlay(overlay.src, overlay.tint);
      this._refreshEffects();
    }

    
    /* -------------------------------------------- */

    /**
     * Draw a status effect icon
     * @param {string} src
     * @param {number|null} tint
     * @returns {Promise<PIXI.Sprite|undefined>}
     * @protected
     */
    Token.prototype._drawEffect = async function(src, tint, value) {
      if ( !src ) return;
      let tex = await loadTexture(src, {fallback: "icons/svg/hazard.svg"});
      let icon = new PIXI.Sprite(tex);
      if ( tint ) icon.tint = tint;

      // Add WFRPE Counter
      if(value)
      {
        let text = new PreciseText(value, game.wfrp4e.config.effectTextStyle)
        text.x = icon.x + icon.width * 0.1;
        text.y = icon.y + icon.height * 0.05;
        text.scale.x = 20;
        text.scale.y = 20;
        icon.addChild(text)
      }
      
      return this.effects.addChild(icon);
    }


//   /**
// * Handle toggling a token status effect icon
// * @private
// */
  TokenHUD.prototype._onToggleEffect = function (event, { overlay = false } = {}) {
    event.preventDefault();
    event.stopPropagation();
    let img = event.currentTarget;
    const effect = (img.dataset.statusId && this.object.actor) ?
      CONFIG.statusEffects.find(e => e.id === img.dataset.statusId) :
      img.getAttribute("src");

    if (event.button == 0)
      return this.object.incrementCondition(effect)
    if (event.button == 2)
      return this.object.decrementCondition(effect)
    //return this.object.toggleEffect(effect, {overlay});
  }


  Token.prototype.incrementCondition = async function (effect, { active, overlay = false } = {}) {
    const existing = this.actor.actorEffects.find(e => e.conditionKey === effect.id);
    if (!existing || Number.isNumeric(getProperty(existing, "flags.wfrp4e.value")))
      await this.actor.addCondition(effect.id)
    else if (existing) // Not numeric, toggle if existing
      await this.actor.removeCondition(effect.id)

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }

  Token.prototype.decrementCondition = async function (effect, { active, overlay = false } = {}) {
    await this.actor.removeCondition(effect.id)

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }
  
  /**
   * Handle JournalEntry document drop data
   * @param {DragEvent} event   The drag drop event
   * @param {object} data       The dropped data transfer data
   * @protected
   */
  NotesLayer.prototype._onDropData = async function(event, data) {
    let entry;
    const coords = this._canvasCoordinatesFromDrop(event);
    if ( !coords ) return false;
    const noteData = {x: coords[0], y: coords[1]};
    if ( data.type === "JournalEntry" ) entry = await JournalEntry.implementation.fromDropData(data);
    if ( data.type === "JournalEntryPage" ) {
      const page = await JournalEntryPage.implementation.fromDropData(data);
      entry = page.parent;
      noteData.pageId = page.id;
      noteData.flags = {anchor : data.anchor }
    }
    if ( entry?.compendium ) {
      const journalData = game.journal.fromCompendium(entry);
      entry = await JournalEntry.implementation.create(journalData);
    }
    noteData.entryId = entry?.id;
    return this._createPreview(noteData, {top: event.clientY - 20, left: event.clientX + 40});
  }

 let _NoteConfigSubmitData = NoteConfig.prototype._getSubmitData
  
  NoteConfig.prototype._getSubmitData = function(updateData={})
  {
    let data = _NoteConfigSubmitData.bind(this)(updateData)

    data["flags.anchor"] = this.object.flags.anchor
    return data
  } 
}
  