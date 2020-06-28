/**
 * Shamelessly copied from dnd5e's spell template implementation
 * @extends {MeasuredTemplate}
 */
class AOETemplate extends MeasuredTemplate {

  /**
   * A factory method to create an AOETemplate instance using provided string
   * @param {String} aoestring          string describing the area of effect (AoE(5 yards) or just 5 yards)
   * @return {AbilityTemplate|null}     The template object, or null if the item does not produce a template
   */
  static fromString(aoeString) 
  {
    if (aoeString.toLowerCase().includes(game.i18n.localize("AoE").toLowerCase()))
      aoeString = aoeString.substring(aoeString.indexOf("(")+1, aoeString.length-1)
    
    // Prepare template data
    const templateData = {
      t: "circle",
      user: game.user._id,
      distance: parseInt(aoeString),
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user.color
    };

    // Return the template constructed from the item data
    return new this(templateData);
  }

  /* -------------------------------------------- */

  /**
   * Creates a preview of the spell template
   * @param {Event} event   The initiating click event
   */
  drawPreview(event) {
    const initialLayer = canvas.activeLayer;
    this.draw();
    this.layer.activate();
    this.layer.preview.addChild(this);
    this.activatePreviewListeners(initialLayer);
  }

  /* -------------------------------------------- */

  /**
   * Activate listeners for the template preview
   * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
   */
  activatePreviewListeners(initialLayer) {
    const handlers = {};
    let moveTime = 0;

    // Update placement (mouse-move)
    handlers.mm = event => {
      event.stopPropagation();
      let now = Date.now(); // Apply a 20ms throttle
      if ( now - moveTime <= 20 ) return;
      const center = event.data.getLocalPosition(this.layer);
      const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
      this.data.x = snapped.x;
      this.data.y = snapped.y;
      this.refresh();
      moveTime = now;
    };

    // Cancel the workflow (right-click)
    handlers.rc = event => {
      this.layer.preview.removeChildren();
      canvas.stage.off("mousemove", handlers.mm);
      canvas.stage.off("mousedown", handlers.lc);
      canvas.app.view.oncontextmenu = null;
      canvas.app.view.onwheel = null;
      initialLayer.activate();
    };

    // Confirm the workflow (left-click)
    handlers.lc = event => {
      handlers.rc(event);

      // Confirm final snapped position
      const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2);
      this.data.x = destination.x;
      this.data.y = destination.y;

      // Create the template
      canvas.scene.createEmbeddedEntity("MeasuredTemplate", this.data);
    };

    // Activate listeners
    canvas.stage.on("mousemove", handlers.mm);
    canvas.stage.on("mousedown", handlers.lc);
    canvas.app.view.oncontextmenu = handlers.rc;
  }
}
