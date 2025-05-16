/**
 * This fully supports movement actions: walk, climb, crawl, fly, swim, blink and displace
 *
 * @todo Potentially in the future it could be worth considering extending the
 *      {@link foundry.data.regionBehaviors.ModifyMovementCostRegionBehaviorType} region behaviour to define a "biome"
 *      or "terrain type" (additional <select> input on top of sliders) and letting traits and talents "ignore" the terrain.
 */
export default class TokenRulerWFRP extends foundry.canvas.placeables.tokens.TokenRuler {
  static STYLES = {
    immobile: {color: 0x220000, alpha: 0.6},
    move: {color: 0x009900},
    stride: {color: 0xaaaa00},
    exceed: {color: 0x990000},
  };

  /** @override */
  static WAYPOINT_LABEL_TEMPLATE = "systems/wfrp4e/templates/hud/waypoint-label.hbs";

  /** @override */
  _getWaypointLabelContext(waypoint, state) {
    const context = super._getWaypointLabelContext(waypoint, state);
    if (!context) return;

    if (!this.token.actor) return context;

    const iterateStatuses = (id, label, icon, cssClass) => {
      if (!this.token.document.hasStatusEffect(id)) return;

      const status = CONFIG.statusEffects.find(s => s.id === id);
      if (!context.additional) {
        context.additional = {
          label: game.i18n.localize(label),
          imgs: [],
          icon,
          cssClass,
        };
      }

      context.additional.imgs.push(status.img);
    }

    const immobileStatuses = ["surprised", "entangled", "unconscious"];
    const reminderStatuses = ["prone", "engaged", "stunned"];

    for (const id of immobileStatuses)
      iterateStatuses(id, "TOKEN.MOVEMENT.Status.immobile", "fas fa-ban", "error");

    if (!context.additional)
      for (const id of reminderStatuses)
        iterateStatuses(id, "TOKEN.MOVEMENT.Status.restricted", "fas fa-triangle-exclamation", "warning");

    return context;
  }

  /** @override */
  _getGridHighlightStyle(waypoint, offset) {
    const style = super._getGridHighlightStyle(waypoint, offset);
    if (!this.token.actor) return style;
    if (["blink", "displace"].includes(waypoint.action)) return style;

    const movement = this.token.actor.system.movementDistance[waypoint.action] || 0;
    const maxMovement = typeof movement === "object" ? movement[1] : movement;

    const cost = waypoint.measurement.cost;

    if (cost === 0) return style;
    if (maxMovement <= 0) return this.constructor.STYLES.immobile;
    if (maxMovement < cost) return this.constructor.STYLES.exceed;

    // 2-step gradient
    let color = this.constructor.STYLES.move;
    if (Array.isArray(movement) && movement[0] < cost)
      color = this.constructor.STYLES.stride;

    return foundry.utils.mergeObject(style, color);
  }

  /** @override */
  _getSegmentStyle(waypoint) {
    const scale = canvas.dimensions.uiScale;
    if  (canvas.scene.grid.type != 0) {
	   return {width: 4 * scale, color: game.user.color, alpha: 1};
    } else {
      const movement = this.token.actor.system.movementDistance[waypoint.action] || 0;
      const maxMovement = typeof movement === "object" ? movement[1] : movement;
      const cost = waypoint.measurement.cost;

      // 2-step gradient, different color for immobile, blink and displace
      let color = this.constructor.STYLES.move.color;
      if (movement[0] < cost && cost <= maxMovement )
        color = this.constructor.STYLES.stride.color;
      else if (maxMovement < cost)
        color = this.constructor.STYLES.exceed.color;
      if  (maxMovement <= 0)
        color = this.constructor.STYLES.immobile.color;
      if (["blink", "displace"].includes(waypoint.action))
        color = 0x0000aa;
	  return {width: 4 * scale, color: color, alpha: 1};
      }
    }
}
