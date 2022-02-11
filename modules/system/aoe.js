/**
 * Shamelessly copied from dnd5e's spell template implementation
 * @extends {MeasuredTemplate}
 */
export default class AOETemplate extends MeasuredTemplate {

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
      user: game.user.id,
      distance: parseInt(aoeString),
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user.color
    };

    const cls = CONFIG.MeasuredTemplate.documentClass;
    const template = new cls(templateData, {parent: canvas.scene});

    // Return the template constructed from the item data
    return new this(template);
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
      this.updateAOETargets(this.data)
    };

    // Cancel the workflow (right-click)
    handlers.rc = event => {
      this.layer._onDragLeftCancel(event);
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
      const destination = canvas.grid.getSnappedPosition(this.data.x, this.data.y, 2);
      this.data.update(destination)

      // Create the template
      canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.data]);
    };

    // Activate listeners
    canvas.stage.on("mousemove", handlers.mm);
    canvas.stage.on("mousedown", handlers.lc);
    canvas.app.view.oncontextmenu = handlers.rc;
  }


  updateAOETargets(templateData)
  {
    let grid = canvas.scene.data.grid;
    let templateGridSize = templateData.distance/canvas.scene.data.gridDistance * grid

    let minx = templateData.x - templateGridSize
    let miny = templateData.y - templateGridSize

    let maxx = templateData.x + templateGridSize
    let maxy = templateData.y + templateGridSize

    let newTokenTargets = [];
    canvas.tokens.placeables.forEach(t => {
      if (t.data.x < maxx && t.data.x > minx && t.data.y < maxy && t.data.y > miny)
        newTokenTargets.push(t.id)
    })
    game.user.updateTokenTargets(newTokenTargets)
  }
}
