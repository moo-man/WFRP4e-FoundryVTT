export default class HiddenMeasuredTemplate extends CONFIG.MeasuredTemplate.objectClass {

    async _draw() {
      await super._draw();
      if (this.document.getFlag("wfrp4e", "auraToken")) {
          this.controlIcon.alpha = 0;
      }
    }
  
    highlightGrid() {
      super.highlightGrid();
      if (this.document.getFlag("wfrp4e", "auraToken")) {
        game.canvas.grid.getHighlightLayer(this.highlightId).alpha = 0;
      }
    }  
    
    _applyRenderFlags(flags) {
      super._applyRenderFlags(flags);    
      if (flags.refreshState ) {
        if (this.document.getFlag("wfrp4e", "auraToken")) {
          game.canvas.grid.getHighlightLayer(this.highlightId).alpha = 0;
        }
      }
    }
  
    constructor(...args) {
      super(...args);
    }
  }
  