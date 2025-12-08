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
     foundry.canvas.placeables.Token.prototype._drawEffects = async function()
     {
        this.effects.renderable = false;

        // Clear Effects Container
        this.effects.removeChildren().forEach(c => c.destroy());
        this.effects.bg = this.effects.addChild(new PIXI.Graphics());
        this.effects.bg.zIndex = -1;
        this.effects.overlay = null;
    
        // Categorize effects
        const activeEffects = this.actor?.temporaryEffects || [];
        const overlayEffect = activeEffects.findLast(e => e.img && e.getFlag("core", "overlay"));
    
        // Draw effects
        const promises = [];
        for ( const [i, effect] of activeEffects.entries() ) {
          if ( !effect.img ) continue;
          const promise = effect === overlayEffect
            ? this._drawOverlay(effect.img, effect.tint)
            : this._drawEffect(effect.img, effect.tint, effect.system.condition.value);
          promises.push(promise.then(e => {
            if ( e ) e.zIndex = i;
          }));
        }
        await Promise.allSettled(promises);
    
        this.effects.sortChildren();
        this.effects.renderable = true;
        this.renderFlags.set({refreshEffects: true});
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
      const tex = await foundry.canvas.loadTexture(src, {fallback: "icons/svg/hazard.svg"});
      const icon = new PIXI.Sprite(tex);
      icon.tint = tint ?? 0xFFFFFF;
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