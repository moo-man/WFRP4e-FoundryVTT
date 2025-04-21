export default function () {

  // Modify the initiative formula depending on whether the actor has ranks in the Combat Reflexes talent
  Combatant.prototype._getInitiativeFormula = function () {
    const actor = this.actor;
    let initiativeFormula = CONFIG.Combat.initiative.formula || game.system.initiative;

    if (!actor) return initiativeFormula;



    let args = { initiative: initiativeFormula }
    actor.runScripts("getInitiativeFormula", args)

    return args.initiative;
  };

    /**
   * Draw the active effects and overlay effect icons which are present upon the Token
   */
     foundry.canvas.placeables.Token.prototype.drawEffects = async function()
     {
         const wasVisible = this.effects.visible;
         this.effects.visible = false;
         this.effects.removeChildren().forEach(c => c.destroy());
         this.effects.bg = this.effects.addChild(new PIXI.Graphics());
         this.effects.bg.visible = false;
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
             if ( !f.img ) continue;
             const tint = Color.from(f.tint ?? null);
             if ( f.getFlag("core", "overlay") ) {
               if ( overlay ) promises.push(this._drawEffect(overlay.src, overlay.tint));
               overlay = {src: f.img, tint};
               continue;
             }
             promises.push(this._drawEffect(f.img, tint,  f.system.condition.value));
           }
     
           // Next draw token effects
           for ( let f of tokenEffects ) promises.push(this._drawEffect(f, null));
           await Promise.all(promises);
         }
     
         // Draw overlay effect
         this.effects.overlay = await this._drawOverlay(overlay.src, overlay.tint);
         this.effects.bg.visible = true;
         this.effects.visible = wasVisible;
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
    foundry.canvas.placeables.Token.prototype._drawEffect = async function(src, tint, value) {
      if ( !src ) return;
      let tex = await foundry.canvas.loadTexture(src, {fallback: "icons/svg/hazard.svg"});
      let icon = new PIXI.Sprite(tex);
      if ( tint ) icon.tint = tint;

      // Add WFRPE Counter
      if(value)
      {
        let text = new foundry.canvas.containers.PreciseText(value, game.wfrp4e.config.effectTextStyle)
        text.x = icon.x + icon.width * 0.1;
        text.y = icon.y + icon.height * 0.05;
        text.scale.x = 20;
        text.scale.y = 20;
        icon.addChild(text)
      }
      
      return this.effects.addChild(icon);
    }
}