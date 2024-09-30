import VehicleCrew from "../../apps/vehicle-crew.js";
import VehicleCumulativeModifiersConfig from "../../apps/vehicle-modifiers.js";
import VehicleMoveConfig from "../../apps/vehicle-move.js";
import ActorSheetWFRP4e from "./actor-sheet.js";

/**
 * Provides the specific interaction handlers for Vehicle Sheets.
 *
 */
export default class ActorSheetWFRP4eVehicle extends ActorSheetWFRP4e {
  static get defaultOptions() {
    const options = super.defaultOptions;
    foundry.utils.mergeObject(options,
      {
        classes: options.classes.concat(["wfrp4e", "actor", "vehicle-sheet"]),
        width: 610,
        height: 740,
        dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }, { dragSelector: ".actor-list .actor", dropSelector: null }]
      });
    return options;
  }

  async _onDrop(event) {
    let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));

    if (dragData?.type == "Actor")
    {
      if (dragData.uuid.includes("Compendium"))
      {
        return ui.notification.error("Cannot use Compendium Actors with Vehicles")
      }
      this.actor.update(this.actor.system.passengers.add(fromUuidSync(dragData.uuid)))
    }
    else return super._onDrop(event);
  }

    /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.hbs";
    return "systems/wfrp4e/templates/actors/vehicle/vehicle-sheet.hbs";
  }



  async getData() {
    let sheetData = await super.getData();
    sheetData.system.crew = foundry.utils.deepClone(sheetData.system.crew)
    sheetData.system.crew.forEach(c => c.rolesDisplay = c.roles.map(i => `<a class="role-click" data-role-id="${i.id}">${i.name}</a>`).join(", "))
    // sheetData.system.roles.forEach(r => {
    //   if (r.actor) {
    //     r.img = game.actors.get(r.actor)?.prototypeToken.texture.src
      // }
    // })

    return sheetData;
  }

  async _handleEnrichment()
  {
      let enrichment = {}
      enrichment["system.details.description.value"] = await TextEditor.enrichHTML(this.actor.system.details.description.value, {async: true})
      enrichment["system.details.gmdescription.value"] = await TextEditor.enrichHTML(this.actor.system.details.gmdescription.value, {async: true})

      return foundry.utils.expandObject(enrichment)
  }


  _addEncumbranceData(sheetData)
  {
    sheetData.system.status.encumbrance.max = sheetData.system.status.carries.max
    sheetData.system.status.encumbrance.pct = sheetData.system.status.encumbrance.over / sheetData.system.status.encumbrance.max * 100
    sheetData.system.status.encumbrance.carryPct = sheetData.system.status.encumbrance.current / sheetData.system.status.carries.max * 100
    if (sheetData.system.status.encumbrance.pct + sheetData.system.status.encumbrance.carryPct > 100) {
      sheetData.system.status.encumbrance.penalty = Math.floor(((sheetData.system.status.encumbrance.carryPct + sheetData.system.status.encumbrance.pct) - 100) / 10)
      sheetData.system.status.encumbrance.message = game.i18n.format("VEHICLE.HandlingPenalty", { penalty: sheetData.system.status.encumbrance.penalty })
      sheetData.system.status.encumbrance.overEncumbered = true;
    }
    else {
      sheetData.system.status.encumbrance.message = game.i18n.localize("VEHICLE.HandlingNoPenalty")
      if (sheetData.system.status.encumbrance.pct + sheetData.system.status.encumbrance.carryPct == 100 && sheetData.system.status.encumbrance.carryPct)
        sheetData.system.status.encumbrance.carryPct -= 1
    }
    sheetData.system.status.encumbrance.total = sheetData.system.status.encumbrance.current + sheetData.system.status.encumbrance.over
    sheetData.system.status.encumbrance.modMsg = game.i18n.format("VEHICLE.ModEncumbranceTT", { amt: sheetData.system.status.encumbrance.over }),
    sheetData.system.status.encumbrance.carryMsg = game.i18n.format("VEHICLE.CarryEncumbranceTT", { amt: Math.round(sheetData.system.status.encumbrance.current * 10) / 10 })
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".passenger .name").click(this._onPassengerClick.bind(this))
    html.find('.vehicle-weapon-name').click(this._onVehicleWeaponClick.bind(this))

    // Do not proceed if sheet is not editable
    if (!this.options.editable) return;

    html.find(".passenger-qty-click").mousedown(this._onPassengerQtyClick.bind(this))
    html.find(".passenger-delete-click").click(this._onPassengerDeleteClick.bind(this))
    html.find(".cargo .inventory-list .name").mousedown(this._onCargoClick.bind(this))
    html.find(".configure-move").click(this._onConfigureMove.bind(this))
    html.find(".configure-crew").click(this._onConfigureCrew.bind(this))
    html.find(".configure-morale").click(this._onConfigureMorale.bind(this))
    html.find(".configure-mood").click(this._onConfigureMood.bind(this))
    html.find(".roll-morale").click(this._onRollMorale.bind(this))
    html.find(".roll-mood").click(this._onRollMood.bind(this))
    html.find(".morale-delete").click(this._onDeleteMorale.bind(this))
    html.find(".mood-delete").click(this._onDeleteMood.bind(this))
    html.find(".crew-test").click(this._onRollCrewTest.bind(this))
    html.find(".crew-tests-collapse").click(this._onCrewTestsCollapse.bind(this))
    html.find('.ch-roll').click(this._onCharClick.bind(this))
    html.find('.role-click').click(this._onRoleClick.bind(this))
    html.find('.mood-events').click(this._onMoodEventsClick.bind(this))
    html.find('.sell-cargo').click(this._onSellCargo.bind(this))
  }


  _onPassengerClick(ev) {
    ev.stopPropagation()
    let id = this._getId(ev)
    this.actor.system.passengers.get(id)?.actor.sheet.render(true);
  }

  async _onRoleClick(ev) {
    let id = this._getId(ev)
    let actor = this.actor.system.passengers.get(id)?.actor;
    let role = this.actor.items.get(ev.currentTarget.dataset.roleId);
    if (role && actor)
    {
      role.system.roll(actor);
    }
  }

  _onMoodEventsClick(ev)
  {
    this.actor.system.status.mood.rollEvents(ev.currentTarget.dataset.key)  
  }

  _onSellCargo(ev)
  {
    let itemId = this._getId(ev)
    let item = this.actor.items.get(itemId);
    if (item?.type == "cargo")
    {
      game.wfrp4e.trade.attemptSell(item);
    }
  }

  async _onVehicleWeaponClick(ev) {
    ev.preventDefault();
    let itemId = this._getId(ev)
    let weapon = this.actor.items.get(itemId)

    let vehicleSpeaker
    if (this.actor.isToken)
    vehicleSpeaker = {
      token: this.actor.token.id,
      scene: this.actor.token.parent.id
    }
  else
    vehicleSpeaker = {
      actor: this.actor.id
    }


    let actor = await this.actor.system.passengers.choose();

    let test = await actor.setupWeapon(weapon, { vehicle: vehicleSpeaker, ammo: this.actor.itemTags["ammunition"] });
    test.roll();
  }

  _onPassengerQtyClick(ev) {
    let multiplier = ev.button == 0 ? 1 : -1;
    multiplier = ev.ctrlKey ? multiplier * 10 : multiplier;
    let id = this._getId(ev);
    this.actor.update(this.actor.system.passengers.count(id,1 * multiplier ));
  }

  _onPassengerDeleteClick(ev) {
    let id = this._getId(ev);
    this.actor.update(this.actor.system.passengers.remove(id));
  }

  _onCargoClick(ev) {
    if (ev.button != 2) return;
    new Dialog({
      title: game.i18n.localize("SHEET.SplitTitle"),
      content: `<p>${game.i18n.localize("SHEET.SplitPrompt")}</p><div class="form-group"><input name="split-amt" type="text" /></div>`,
      buttons: {
        split: {
          label: game.i18n.localize("Split"),
          callback: (dlg) => {
            let amt = Number(dlg.find('[name="split-amt"]').val());
            if (isNaN(amt)) return
            this.splitItem(this._getId(ev), amt);
          }
        },
      },
      default: "split"
    }).render(true);
  }

  async _onExtendedTestSelect(ev) {
    let itemId = this._getId(ev)
    let item = this.actor.items.get(itemId)
    let actor = await this.actor.system.passengers.choose();
    
    actor.setupExtendedTest(item)
  }

  _onConfigureMove(ev)
  {
    new VehicleMoveConfig(this.actor).render(true);
  }

  _onConfigureMorale(ev)
  {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "morale"}).render(true);
  }

  _onConfigureMood(ev)
  {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "mood"}).render(true);
  }

  _onConfigureCrew(ev)
  {
    new VehicleCrew(this.actor).render(true);
  }

  async _onRollMorale(ev) {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "morale", roll: true}).render(true);
  }

  async _onRollMood(ev) {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "mood", roll: true}).render(true);
  }
  
  async _onDeleteMorale(ev) {
    let index = this._getIndex(ev);
    let confirm = await Dialog.confirm({title : game.i18n.localize("Confirm"), content : "<p>" + game.i18n.localize('VEHICLE.Delete') + "</p>"})
    if (confirm)
    {
      this.actor.update({"system.status.morale.log" : this.actor.system.status.morale.deleteLog(index)})
    }
  }

  async _onDeleteMood(ev) {
    let index = this._getIndex(ev);
    let confirm = await Dialog.confirm({title : game.i18n.localize("Confirm"), content : "<p>" + game.i18n.localize('VEHICLE.Delete') + "</p>"})
    if (confirm)
    {
      this.actor.update({"system.status.mood.log" : this.actor.system.status.mood.deleteLog(index)})
    }
  }
  async _onRollCrewTest(ev)
  {
    let id = this._getId(ev);
    let test = this.actor.items.get(id);
    if (test)
    {
      test.system.roll();
    }
  }

  _onCrewTestsCollapse(ev)
  {
    let tests = $(ev.currentTarget.parentElement).siblings(".crew-tests");
    if (tests[0].style.display == "none")
      {
        tests.slideDown(200)
        ev.currentTarget.children[0].classList.remove("fa-chevron-down")
        ev.currentTarget.children[0].classList.add("fa-chevron-up")
    }
    else 
    {
      tests.slideUp(200);
      ev.currentTarget.children[0].classList.remove("fa-chevron-up")
      ev.currentTarget.children[0].classList.add("fa-chevron-down")
    }
  }
}