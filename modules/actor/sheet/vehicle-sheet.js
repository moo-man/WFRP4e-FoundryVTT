import VehicleCrew from "../../apps/vehicle-crew.js";
import VehicleCumulativeModifiersConfig from "../../apps/vehicle-modifiers.js";
import VehicleMoveConfig from "../../apps/vehicle-move.js";
import ActorSheetWfrp4e from "./actor-sheet.js";

/**
 * Provides the specific interaction handlers for Vehicle Sheets.
 *
 */
export default class ActorSheetWfrp4eVehicle extends ActorSheetWfrp4e {
  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options,
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
      this.actor.update({ "system.passengers.list": this.actor.system.passengers.add(fromUuidSync(dragData.uuid)) })
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
    sheetData.system.crew.forEach(c => c.rolesDisplay = c.roles.map(i => i.name).join(", "))
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
      enrichment["system.details.gmnotes.value"] = await TextEditor.enrichHTML(this.actor.system.details.gmdescription.value, {async: true})

      return expandObject(enrichment)
  }


  _addEncumbranceData(sheetData)
  {
    sheetData.system.status.encumbrance.max = sheetData.system.status.carries.max
    sheetData.system.status.encumbrance.pct = sheetData.system.status.encumbrance.over / sheetData.system.status.encumbrance.max * 100
    sheetData.system.status.encumbrance.carryPct = sheetData.system.status.encumbrance.current / sheetData.system.status.carries.max * 100
    if (sheetData.system.status.encumbrance.pct + sheetData.system.status.encumbrance.carryPct > 100) {
      sheetData.system.status.encumbrance.penalty = Math.floor(((sheetData.system.status.encumbrance.carryPct + sheetData.system.status.encumbrance.pct) - 100) / 10)
      sheetData.system.status.encumbrance.message = `Handling Tests suffer a -${sheetData.system.status.encumbrance.penalty} SL penalty.`
      sheetData.system.status.encumbrance.overEncumbered = true;
    }
    else {
      sheetData.system.status.encumbrance.message = `Encumbrance below maximum: No Penalties`
      if (sheetData.system.status.encumbrance.pct + sheetData.system.status.encumbrance.carryPct == 100 && sheetData.system.status.encumbrance.carryPct)
        sheetData.system.status.encumbrance.carryPct -= 1
    }
    sheetData.system.status.encumbrance.total = sheetData.system.status.encumbrance.current + sheetData.system.status.encumbrance.over
    sheetData.system.status.encumbrance.modMsg = game.i18n.format("VEHICLE.ModEncumbranceTT", { amt: sheetData.system.status.encumbrance.over }),
    sheetData.system.status.encumbrance.carryMsg = game.i18n.format("VEHICLE.CarryEncumbranceTT", { amt: Math.round(sheetData.system.status.encumbrance.current * 10) / 10 })
  }

  async passengerSelect(dialogMessage = game.i18n.localize("DIALOG.ActorSelection")) {
    return new Promise((resolve, reject) => {
      renderTemplate("systems/wfrp4e/templates/dialog/vehicle-weapon.hbs", { dialogMessage, actors: this.actor.passengers.map(p => p.actor) }).then(dlg => {
        new Dialog({
          content: dlg,
          title: game.i18n.localize("DIALOG.ActorSelection"),
          buttons: {
            select: {
              label: game.i18n.localize("Select"),
              callback: (dlg) => {
                let actorId = dlg.find("[name='actor']").val();
                if (actorId)
                  resolve(game.actors.get(actorId))
                reject()
              }
            }
          }
        }).render(true)
      })
    })
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

  }


  _onPassengerClick(ev) {
    ev.stopPropagation()
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    game.actors.get(this.actor.system.passengers.list[index].actor.id).sheet.render(true);
  }

  async _onRoleSkillClick(ev) {
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let roles = duplicate(this.actor.roles)
    if (ev.button == 0) {
      let { actor, test, testLabel, handling } = roles[index];
      actor = game.actors.get(actor);
      if (!actor)
        return ui.notifications.error(game.i18n.localize("VEHICLE.NoActor"))
      if (!actor.isOwner)
        return ui.notifications.error(game.i18n.localize("VEHICLE.TestNotPermitted"))

      let skill = actor.getItemTypes("skill").find(s => s.name == test)
      let testObject;
      let title
      if (testLabel) testLabel + " - " + test;

      let fields = {slBonus : -1 * (handling ? this.actor.status.encumbrance.penalty || 0 : 0)};
      if (!skill)
      {
        let char = game.wfrp4e.utility.findKey(test, game.wfrp4e.config.characteristics)

        if (!char)
          return ui.notifications.error(game.i18n.localize("VEHICLE.TestNotFound"))

        if (testLabel)
          title = testLabel + " - " + test

        testObject = await actor.setupCharacteristic(char, { title, vehicle: this.actor.id, handling, fields, initialTooltip : "Vehicle Encumbrance"})
      }
      else
      {
        if (testLabel)
          title = testLabel + " - " + test

        testObject = await actor.setupSkill(skill, { title, vehicle: this.actor.id, handling, fields, initialTooltip : "Vehicle Encumbrance"})
      }
      await testObject.roll();
    }
  }

  _onRoleNameClick(ev) {
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let roles = duplicate(this.actor.roles)

    let actor = game.actors.get(roles[index].actor);
    if (!actor)
      return ui.notifications.error(game.i18n.localize("VEHICLE.NoActor"))
    else
      actor.sheet.render(true)
  }

  async _onVehicleWeaponClick(ev) {
    event.preventDefault();
    let itemId = $(event.currentTarget).parents(".item").attr("data-id");
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


    if (!game.user.isGM && game.user.character) {
      if (this.actor.passengers.find(p => p.actor._id == game.user.character.id)) {
        game.user.character.setupWeapon(weapon, { vehicle: vehicleSpeaker, ammo: this.actor.getItemTypes("ammunition") }).then(setupData => {
          game.user.character.weaponTest(setupData);
        })
      }
    }
    else {
      let actor = await this.passengerSelect(game.i18n.localize("DIALOG.VehicleActorSelect"))
      if (!actor.isOwner)
        return ui.notifications.error(game.i18n.localize("VEHICLE.CantUseActor"))

      actor.setupWeapon(weapon, { vehicle: vehicleSpeaker, ammo: this.actor.getItemTypes("ammunition") }).then(setupData => {
        actor.weaponTest(setupData);
      })
    }
  }

  _onPassengerQtyClick(ev) {
    let multiplier = ev.button == 0 ? 1 : -1;
    multiplier = ev.ctrlKey ? multiplier * 10 : multiplier;
    let id = this._getId(ev);
    this.actor.update({ "system.passengers.list": this.system.passengers.count(id,1 * multiplier ) });
  }

  _onPassengerDeleteClick(ev) {
    let id = this._getId(ev);
    this.actor.update({ "system.passengers.list": this.system.passengers.remove(id) });
  }

  _onCargoClick(ev) {
    if (ev.button != 2) return;
    new Dialog({
      title: game.i18n.localize("SHEET.SplitTitle"),
      content: `<p>${game.i18n.localize("SHEET.SplitPrompt")}</p><div class="form-group"><input name="split-amt" type="text" /></div>`,
      buttons: {
        split: {
          label: "Split",
          callback: (dlg) => {
            let amt = Number(dlg.find('[name="split-amt"]').val());
            if (isNaN(amt)) return
            this.splitItem(this._getItemId(ev), amt);
          }
        }
      }
    }).render(true);
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
    this.actor.system.status.morale.dialog(this.actor);
  }

  async _onRollMood(ev) {
    this.actor.system.status.mood.dialog(this.actor);
  }
  
  async _onDeleteMorale(ev) {
    let index = this._getIndex(ev);
    let confirm = await Dialog.confirm({title : "Confirm", content : "<p>Delete this entry?</p>"})
    if (confirm)
    {
      this.actor.update({"system.status.morale.log" : this.actor.system.status.morale.deleteLog(index)})
    }
  }

  async _onDeleteMood(ev) {
    let index = this._getIndex(ev);
    let confirm = await Dialog.confirm({title : "Confirm", content : "<p>Delete this entry?</p>"})
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
}