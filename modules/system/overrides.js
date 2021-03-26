import WFRP_Utility from "./utility-wfrp4e.js";

export default function() {

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
  TextEditor.enrichHTML = function(content, {secrets=false, entities=true, links=true, rolls=true, rollData=null}={}){

    // Create the HTML element
    const html = document.createElement("div");
    html.innerHTML = String(content);

    // Remove secret blocks
    if ( !secrets ) {
      let elements = html.querySelectorAll("section.secret");
      elements.forEach(e => e.parentNode.removeChild(e));
    }

    // Plan text content replacements
    let updateTextArray = true;
    let text = [];

    // Replace entity links
    if ( entities ) {
      if ( updateTextArray ) text = this._getTextNodes(html);
      const entityTypes = CONST.ENTITY_LINK_TYPES.concat("Compendium").concat(game.wfrp4e.config.PSEUDO_ENTITIES);
      const rgx = new RegExp(`@(${entityTypes.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`, 'g');
      updateTextArray = this._replaceTextContent(text, rgx, this._createEntityLink);
    }

    // Replace hyperlinks
    if ( links ) {
      if ( updateTextArray ) text = this._getTextNodes(html);
      const rgx = /(https?:\/\/)(www\.)?([^\s<]+)/gi;
      updateTextArray = this._replaceTextContent(text, rgx, this._createHyperlink);
    }

    // Replace inline rolls
    if ( rolls ) {
      if (updateTextArray) text = this._getTextNodes(html);
      const rgx = /\[\[(\/[a-zA-Z]+\s)?(.*?)([\]]{2,3})/gi;
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
  TextEditor._createEntityLink = function(match, type, target, name) {

    // Prepare replacement data
    const data = {
      cls: ["entity-link"],
      icon: null,
      dataset: {},
      name: name
    };
    let broken = false;

    // Get a matched World entity
    if (CONST.ENTITY_TYPES.includes(type)) {
      const config = CONFIG[type];

      // Get the linked Entity
      const collection = config.entityClass.collection;
      const entity = /^[a-zA-Z0-9]{16}$/.test(target) ? collection.get(target) : collection.getName(target);
      if (!entity) broken = true;

      // Update link data
      data.name = data.name || (broken ? target : entity.name);
      data.icon = config.sidebarIcon;
      data.dataset = {entity: type, id: broken ? null : entity.id};
    }

    // Get a matched Compendium entity
    else if (type === "Compendium") {

      // Get the linked Entity
      let [scope, packName, id] = target.split(".");
      const pack = game.packs.get(`${scope}.${packName}`);
      if ( pack ) {
        if (pack.index.length) {
          const entry = pack.index.find(i => (i._id === id) || (i.name === id));
          if (!entry) broken = true;
          else id = entry._id;
          data.name = data.name || entry.name || id;
        }

        // Update link data
        const config = CONFIG[pack.metadata.entity];
        data.icon = config.sidebarIcon;
        data.dataset = {pack: pack.collection, id: id};
      }
      else broken = true;
    }
    else if (game.wfrp4e.config.PSEUDO_ENTITIES.includes(type))
    {
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
    Combat.prototype._getInitiativeFormula = function (combatant) {
      const actor = combatant.actor;
      let initiativeFormula = CONFIG.Combat.initiative.formula || game.system.data.initiative;

      if (!actor) return initiativeFormula;



      let args = {initiative : initiativeFormula}
      actor.runEffects("getInitiativeFormula", args)

      return args.initiative;
    };


    // Token Overrides to make WFRP conditions work better 
    
    Token.prototype.drawEffects = async function() {
      this.effects.removeChildren().forEach(c => c.destroy());
      const tokenEffects = this.data.effects;
      const actorEffects = this.actor?.temporaryEffects || [];
      let overlay = {
        src: this.data.overlayEffect,
        tint: null
      };
  
      // Draw status effects
      if ( tokenEffects.length || actorEffects.length ) {
        const promises = [];
        let w = Math.round(canvas.dimensions.size / 2 / 5) * 2;
        let bg = this.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);
        let i = 0;
  
        // Draw actor effects first
        for ( let f of actorEffects ) {
          if ( !f.data.icon ) continue;
          const tint = f.data.tint ? colorStringToHex(f.data.tint) : null;
          if ( f.getFlag("core", "overlay") ) {
            overlay = {src: f.data.icon, tint};
            continue;
          }
          promises.push(this._drawEffect(f.data.icon, i, bg, w, tint, getProperty(f, "data.flags.wfrp4e.value")));
          i++;
        }
  
        // Next draw token effects
        for ( let f of tokenEffects ) {
          promises.push(this._drawEffect(f, i, bg, w, null));
          i++;
        }
        await Promise.all(promises);
      }
  
      // Draw overlay effect
      return this._drawOverlay(overlay)
    }


    Token.prototype._drawEffect = async function(src, i, bg, w, tint, value) {
      let tex = await loadTexture(src);
      let icon = this.effects.addChild(new PIXI.Sprite(tex));

      icon.width = icon.height = w;
      icon.x = Math.floor(i / 5) * w;
      icon.y = (i % 5) * w;
 
      if ( tint ) icon.tint = tint;
      bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
      this.effects.addChild(icon);
      if (value)
      {
        let text = this.effects.addChild(new PreciseText(value,game.wfrp4e.config.effectTextStyle))
        text.x = icon.x;
        text.y = icon.y;
        this.effects.addChild(text);
      }
    }


      /**
   * Handle toggling a token status effect icon
   * @private
   */
  TokenHUD.prototype._onToggleEffect = function(event, {overlay=false}={}) {
    event.preventDefault();
    let img = event.currentTarget;
    const effect = ( img.dataset.statusId && this.object.actor ) ?
      CONFIG.statusEffects.find(e => e.id === img.dataset.statusId) :
      img.getAttribute("src");
    if (event.button == 0)
      return this.object.incrementCondition(effect)
    if (event.button == 2)
      return this.object.decrementCondition(effect)
    //return this.object.toggleEffect(effect, {overlay});
  }


  Token.prototype.incrementCondition = async function(effect, {active, overlay=false}={}) {
    const existing = this.actor.effects.find(e => e.getFlag("core", "statusId") === effect.id);
    if (!existing || Number.isNumeric(getProperty(existing, "data.flags.wfrp4e.value")))
      this.actor.addCondition(effect.id)
    else if (existing) // Not numeric, toggle if existing
      this.actor.removeCondition(effect.id)

    // Update the Token HUD
    if ( this.hasActiveHUD ) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }

    Token.prototype.decrementCondition = async function(effect, {active, overlay=false}={}) {
      this.actor.removeCondition(effect.id)
  
      // Update the Token HUD
      if ( this.hasActiveHUD ) canvas.tokens.hud.refreshStatusIcons();
      return active;
    }


}
