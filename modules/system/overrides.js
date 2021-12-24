import WFRP_Utility from "./utility-wfrp4e.js";

export default function () {

    /**
   * Apply data transformations when importing a Document from a Compendium pack
   * @param {Document|object} document    The source Document, or a plain data object
   * @return {Object}                     The processed data ready for world Document creation
   * @override - Retain ID
   */
  function fromCompendiumRetainID(document) {
    let data = document;
    if ( document instanceof foundry.abstract.Document ) {
      data = document.toObject();
      if ( !data.flags.core?.sourceId ) foundry.utils.setProperty(data, "flags.core.sourceId", document.uuid);
    }

    // Eliminate some fields that should never be preserved
    const deleteKeys = ["folder"];
    for ( let k of deleteKeys ) {
      delete data[k];
    }

    // Reset some fields to default values
    if ( "sort" in data ) data.sort = 0;
    if ( "permissions" in data ) data.permissions = {[game.user.id]: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER};
    return data;
  }


  // Replace collection functions with new function to retain IDs
  Actors.prototype.fromCompendium = fromCompendiumRetainID;
  Items.prototype.fromCompendium = fromCompendiumRetainID;
  Journal.prototype.fromCompendium = fromCompendiumRetainID;
  Scenes.prototype.fromCompendium = fromCompendiumRetainID;
  RollTables.prototype.fromCompendium = fromCompendiumRetainID;

  // Replace collection functions for journal and scene document classes because WFRP does not extend these
  // keep old functions
  let sceneToCompendium = CONFIG.Scene.documentClass.prototype.toCompendium
  let journalToCompendium = CONFIG.JournalEntry.documentClass.prototype.toCompendium
  let tableToCompendium = CONFIG.RollTable.documentClass.prototype.toCompendium

  // Call old functions, but tack on ID again after they finish
  CONFIG.JournalEntry.documentClass.prototype.toCompendium = function(pack)
  {
    let data = journalToCompendium.bind(this)(pack)
    data._id = this.id
    return data
  }
  
  CONFIG.Scene.documentClass.prototype.toCompendium = function(pack)
  {
    let data = sceneToCompendium.bind(this)(pack)
    data._id = this.id
    return data
  }

  CONFIG.RollTable.documentClass.prototype.toCompendium = function(pack)
  {
    let data = tableToCompendium.bind(this)(pack)
    data._id = this.id
    return data
  }


  // Since IDs are maintained in WFRP4e, we have to clean actor imports from their IDs
  function WFRP4eImportFromJson(json) {
    const data = JSON.parse(json);
    delete data._id
    if (data.token)
      delete data.token.actorId
    this.data.update(data, {recursive: false});
    return this.update(this.toJSON(), {diff: false, recursive: false});
  }

   // keep old functions
   CONFIG.Scene.documentClass.prototype.importFromJSON = WFRP4eImportFromJson;
   CONFIG.JournalEntry.documentClass.prototype.importFromJSON = WFRP4eImportFromJson;
   CONFIG.Actor.documentClass.prototype.importFromJSON = WFRP4eImportFromJson;
   CONFIG.Item.documentClass.prototype.importFromJSON = WFRP4eImportFromJson;
   CONFIG.RollTable.documentClass.prototype.importFromJSON = WFRP4eImportFromJson;


  // ***** FVTT functions with slight modification to include pseudo entities *****

  /**
   * Enrich HTML content by replacing or augmenting components of it
   * @param {string} content        The original HTML content (as a string)
   * @param {boolean} secrets       Include secret tags in the final HTML? If false secret blocks will be removed.
   * @param {boolean} entities      Replace dynamic entity links?
   * @param {boolean} links         Replace hyperlink content?
   * @param {boolean} rolls         Replace inline dice rolls?
   * @param {Object} rollData       The data object providing context for inline rolls
   * @return {string}               The enriched HTML content
   */
  TextEditor.enrichHTML = function (content, { secrets = false, documents = true, links = true, rolls = true, rollData = null } = {}) {

    // Create the HTML element
    const html = document.createElement("div");
    html.innerHTML = String(content);

    // Remove secret blocks
    if (!secrets) {
      let elements = html.querySelectorAll("section.secret");
      elements.forEach(e => e.parentNode.removeChild(e));
    }

    // Plan text content replacements
    let updateTextArray = true;
    let text = [];

    // Replace entity links
    if (documents) {
      if (updateTextArray) text = this._getTextNodes(html);
      const documentTypes = CONST.DOCUMENT_LINK_TYPES.concat("Compendium").concat(game.wfrp4e.config.PSEUDO_ENTITIES);
      const rgx = new RegExp(`@(${documentTypes.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`, 'g');
      updateTextArray = this._replaceTextContent(text, rgx, this._createContentLink);
    }

    // Replace hyperlinks
    if (links) {
      if (updateTextArray) text = this._getTextNodes(html);
      const rgx = /(https?:\/\/)(www\.)?([^\s<]+)/gi;
      updateTextArray = this._replaceTextContent(text, rgx, this._createHyperlink);
    }

    // Replace inline rolls
    if ( rolls ) {
      rollData = rollData instanceof Function ? rollData() : (rollData || {});
      if (updateTextArray) text = this._getTextNodes(html);
      const rgx = /\[\[(\/[a-zA-Z]+\s)?(.*?)([\]]{2,3})(?:{([^}]+)})?/gi;
      updateTextArray = this._replaceTextContent(text, rgx, (...args) => this._createInlineRoll(...args, rollData));
    }

    // Return the enriched HTML
    return html.innerHTML;
  };


  /**
   * Create a dynamic entity link from a regular expression match
   * @param {string} match          The full matched string
   * @param {string} type           The matched entity type or "Compendium"
   * @param {string} target         The requested match target (_id or name)
   * @param {string} name           A customized or over-ridden display name for the link
   * @return {HTMLAnchorElement}    An HTML element for the entity link
   * @private
   */
  TextEditor._createContentLink = function (match, type, target, name) {

    // Prepare replacement data
    const data = {
      cls: ["entity-link", "content-link"],
      icon: null,
      dataset: {},
      name: name
    };
    let broken = false;

    // Get a matched World entity
    if (CONST.DOCUMENT_TYPES.includes(type)) {

      const config = CONFIG[type];
      const collection = game.collections.get(type);
      const document = /^[a-zA-Z0-9]{16}$/.test(target) ? collection.get(target) : collection.getName(target);
      if (!document) broken = true;

      // Update link data
      data.name = data.name || (broken ? target : document.name);
      data.icon = config.sidebarIcon;
      data.dataset = { type, id: broken ? null : document.id };
    }

    // Get a matched PlaylistSound
    else if ( type === "PlaylistSound" ) {
      const [, playlistId, , soundId] = target.split(".");
      const playlist = game.playlists.get(playlistId);
      const sound = playlist?.sounds.get(soundId);
      if ( !playlist || !sound ) broken = true;

      data.name = data.name || (broken ? target : sound.name);
      data.icon = CONFIG.Playlist.sidebarIcon;
      data.dataset = {type, playlistId, soundId};
      const playing = Array.from(game.audio.playing.values()).find(s => s._sourceId === sound.uuid);
      if ( playing ) data.cls.push("playing");
    }

    // Get a matched Compendium document
    else if (type === "Compendium") {

      // Get the linked Document
      let [scope, packName, id] = target.split(".");
      const pack = game.packs.get(`${scope}.${packName}`);
      if ( pack ) {
        data.dataset = {pack: pack.collection};
        data.icon = CONFIG[pack.documentName].sidebarIcon;

        // If the pack is indexed, retrieve the data
        if (pack.index.size) {
          const index = pack.index.find(i => (i._id === id) || (i.name === id));
          if ( index ) {
            if ( !data.name ) data.name = index.name;
            data.dataset.id = index._id;
          }
          else broken = true;
        }

        // Otherwise assume the link may be valid, since the pack has not been indexed yet
        if ( !data.name ) data.name = data.dataset.lookup = id;
      }
      else broken = true;
    }

    else if (game.wfrp4e.config.PSEUDO_ENTITIES.includes(type)) {
      let linkHTML = WFRP_Utility._replaceCustomLink(match, type, target, name)
      let a = $(linkHTML)[0]
      a.draggable = true;
      return a;
    }

    // Flag a link as broken
    if (broken) {
      data.icon = "fas fa-unlink";
      data.cls.push("broken");
    }

    // Construct the formed link
    const a = document.createElement('a');
    a.classList.add(...data.cls);
    a.draggable = true;
    for (let [k, v] of Object.entries(data.dataset)) {
      a.dataset[k] = v;
    }
    a.innerHTML = `<i class="${data.icon}"></i> ${data.name}`;
    return a;
  }

  // Modify the initiative formula depending on whether the actor has ranks in the Combat Reflexes talent
  Combatant.prototype._getInitiativeFormula = function () {
    const actor = this.actor;
    let initiativeFormula = CONFIG.Combat.initiative.formula || game.system.data.initiative;

    if (!actor) return initiativeFormula;



    let args = { initiative: initiativeFormula }
    actor.runEffects("getInitiativeFormula", args)

    return args.initiative;
  };


  // Token Overrides to make WFRP conditions work better 

  Token.prototype.drawEffects = async function () {
    this.hud.effects.removeChildren().forEach(c => c.destroy());
    const tokenEffects = this.data.effects;
    const actorEffects = this.actor?.temporaryEffects || [];
    let overlay = {
      src: this.data.overlayEffect,
      tint: null
    };

    // Draw status effects
    if (tokenEffects.length || actorEffects.length) {
      const promises = [];
      let w = Math.round(canvas.dimensions.size / 2 / 5) * 2;
      let bg = this.hud.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);
      let i = 0;

      // Draw actor effects first
      for (let f of actorEffects) {
        if (!f.data.icon) continue;
        const tint = f.data.tint ? colorStringToHex(f.data.tint) : null;
        if (f.getFlag("core", "overlay")) {
          overlay = { src: f.data.icon, tint };
          continue;
        }
        promises.push(this._drawEffect(f.data.icon, i, bg, w, tint, getProperty(f, "data.flags.wfrp4e.value")));
        i++;
      }

      // Next draw token effects
      for (let f of tokenEffects) {
        promises.push(this._drawEffect(f, i, bg, w, null));
        i++;
      }
      await Promise.all(promises);
    }

    // Draw overlay effect
    return this._drawOverlay(overlay)
  }


  Token.prototype._drawEffect = async function (src, i, bg, w, tint, value) {
    let tex = await loadTexture(src);
    let icon = this.hud.effects.addChild(new PIXI.Sprite(tex));

    icon.width = icon.height = w;
    icon.x = Math.floor(i / 5) * w;
    icon.y = (i % 5) * w;

    if (tint) icon.tint = tint;
    bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
    this.hud.effects.addChild(icon);
    if (value) {
      let text = this.hud.effects.addChild(new PreciseText(value, game.wfrp4e.config.effectTextStyle))
      text.x = icon.x;
      text.y = icon.y;
      this.hud.effects.addChild(text);
    }
  }


  /**
* Handle toggling a token status effect icon
* @private
*/
  TokenHUD.prototype._onToggleEffect = function (event, { overlay = false } = {}) {
    event.preventDefault();
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
    const existing = this.actor.effects.find(e => e.getFlag("core", "statusId") === effect.id);
    if (!existing || Number.isNumeric(getProperty(existing, "data.flags.wfrp4e.value")))
      this.actor.addCondition(effect.id)
    else if (existing) // Not numeric, toggle if existing
      this.actor.removeCondition(effect.id)

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }

  Token.prototype.decrementCondition = async function (effect, { active, overlay = false } = {}) {
    this.actor.removeCondition(effect.id)

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }

}
