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
    if (dragData.type == "Actor") {
      let passengers = duplicate(this.actor.data.data.passengers);
      passengers.push({ id: dragData.id, count: 1 });
      this.actor.update({ "data.passengers": passengers })
    }
    else return super._onDrop(event);
  }

    /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.html";
    return "systems/wfrp4e/templates/actors/vehicle/vehicle-sheet.html";
  }
  


  getData() {
    let sheetData = super.getData();
    sheetData.data.roles.forEach(r => {
      if (r.actor) {
        r.img = game.actors.get(r.actor)?.data?.token?.img
      }
    })

    return sheetData;
  }

  _addEncumbranceData(sheetData)
  {
    sheetData.data.status.encumbrance.max = sheetData.data.status.carries.max
    sheetData.data.status.encumbrance.pct = sheetData.data.status.encumbrance.over / sheetData.data.status.encumbrance.max * 100
    sheetData.data.status.encumbrance.carryPct = sheetData.data.status.encumbrance.current / sheetData.data.status.carries.max * 100
    if (sheetData.data.status.encumbrance.pct + sheetData.data.status.encumbrance.carryPct > 100) {
      sheetData.data.status.encumbrance.penalty = Math.floor(((sheetData.data.status.encumbrance.pct + sheetData.data.status.encumbrance.pct) - 100) / 10)
      sheetData.data.status.encumbrance.message = `Handling Tests suffer a -${sheetData.data.status.encumbrance.penalty} SL penalty.`
      sheetData.data.status.encumbrance.overEncumbered = true;
    }
    else {
      sheetData.data.status.encumbrance.message = `Encumbrance below maximum: No Penalties`
      if (sheetData.data.status.encumbrance.pct + sheetData.data.status.encumbrance.carryPct == 100 && sheetData.data.status.encumbrance.carryPct)
        sheetData.data.status.encumbrance.carryPct -= 1
    }
    sheetData.data.status.encumbrance.total = sheetData.data.status.encumbrance.current + sheetData.data.status.encumbrance.over
    sheetData.data.status.encumbrance.modMsg = game.i18n.format("VEHICLE.ModEncumbranceTT", { amt: sheetData.data.status.encumbrance.over }),
    sheetData.data.status.encumbrance.carryMsg = game.i18n.format("VEHICLE.CarryEncumbranceTT", { amt: Math.round(sheetData.data.status.encumbrance.current * 10) / 10 })
  }

  async passengerSelect(dialogMessage = game.i18n.localize("DIALOG.ActorSelection")) {
    return new Promise((resolve, reject) => {
      renderTemplate("systems/wfrp4e/templates/dialog/vehicle-weapon.html", { dialogMessage, actors: this.actor.passengers.map(p => p.actor) }).then(dlg => {
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
    html.find(".role-skill").click(this._onRoleSkillClick.bind(this))
    html.find(".role-name").click(this._onRoleNameClick.bind(this))
    html.find('.vehicle-weapon-name').click(this._onVehicleWeaponClick.bind(this))

    // Do not proceed if sheet is not editable
    if (!this.options.editable) return;

    html.find(".passenger-qty-click").mousedown(this._onPassengerQtyClick.bind(this))
    html.find(".passenger-delete-click").click(this._onPassengerDeleteClick.bind(this))
    html.find(".role-edit").mousedown(this._onRoleEditClick.bind(this))
    html.find(".role-actor").change(this._onRoleActorChange.bind(this))
    html.find(".role-input").change(this._onRoleInputChange.bind(this))
    html.find(".role-delete").click(this._onRoleDelete.bind(this))
    html.find(".cargo .inventory-list .name").mousedown(this._onCargoClick.bind(this))

  }


  _onPassengerClick(ev) {
    ev.stopPropagation()
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    game.actors.get(this.actor.passengers[index].actor.id).sheet.render(true);
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
      let setupData
      let title
      if (testLabel) testLabel + " - " + test;

      if (!skill) {
        let char = game.wfrp4e.utility.findKey(test, game.wfrp4e.config.characteristics)
        if (!char)
          return ui.notifications.error(game.i18n.localize("VEHICLE.TestNotFound"))

        if (testLabel)
          title = testLabel + " - " + test

        let prefill = this.actor.getPrefillData("characteristic", char, { vehicle: this.actor.id, handling })
        let penalty = this.actor.status.encumbrance.penalty || 0
        if (handling)
          prefill.slBonus -= penalty
        let modify = { modifier: prefill.testModifier, slBonus: prefill.slBonus, successBonus: prefill.successBonus }
        setupData = await actor.setupCharacteristic(char, { title, vehicle: this.actor.id, handling, modify })
      }
      else {
        if (testLabel)
          title = testLabel + " - " + test

        let prefill = this.actor.getPrefillData("skill", skill, { vehicle: this.actor.id, handling })
        let penalty = this.actor.status.encumbrance.penalty || 0
        if (handling)
          prefill.slBonus -= penalty
        let modify = { modifier: prefill.testModifier, slBonus: prefill.slBonus, successBonus: prefill.successBonus }
        setupData = await actor.setupSkill(skill, { title, vehicle: this.actor.id, handling, modify })
      }
      actor.basicTest(setupData);
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
    let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
    let weapon = this.actor.items.get(itemId)

    let vehicleSpeaker
    if (this.isToken)
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

    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let passengers = duplicate(this.actor.data.data.passengers);
    passengers[index].count += 1 * multiplier;
    passengers[index].count = passengers[index].count < 0 ? 0 : passengers[index].count
    this.actor.update({ "data.passengers": passengers });
  }

  _onPassengerDeleteClick(ev) {
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let passengers = duplicate(this.actor.data.data.passengers);
    passengers.splice(index, 1)
    this.actor.update({ "data.passengers": passengers });
  }

  _onRoleActorChange(ev) {
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let roles = duplicate(this.actor.roles)
    roles[index].actor = ev.target.value
    this.actor.update({"data.roles" : roles})
  }

  async _onRoleEditClick(ev) {
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let roles = duplicate(this.actor.roles)
    let actor = this.actor
    new Dialog({
      content:
        `
        <div class="form-group">
        <label style="min-width: 110px;">${game.i18n.localize("VEHICLE.EnterRoleName")}</label>

          <input name="role-name" type="text" value="${roles[index].name}"/>
        </div>
        
        <div class="form-group">
        <label style="min-width: 110px;">${game.i18n.localize("VEHICLE.RoleTest")}</label>
          <input name="role-test" type="text" placeholder="Skill or Characteristic" value="${roles[index].test}"/>
        </div>
        <div class="form-group">
        <label style="min-width: 110px;">${game.i18n.localize("VEHICLE.RoleTestLabel")}</label>
          <input name="role-test-label" type="text" value="${roles[index].testLabel}"/>
        </div>

        <div class="form-group">
        <label style="min-width: 110px;">${game.i18n.localize("VEHICLE.Handling")}</label>
          <input name="handling" type="checkbox" ${roles[index].handling ? "checked" : ""}/>
        </div>
        `,
      title: game.i18n.localize("VEHICLE.EnterRoleName"),
      buttons: {
        enter: {
          label: game.i18n.localize("Confirm"),
          callback: dlg => {
            let newName = dlg.find('[name="role-name"]').val()
            let newTest = dlg.find('[name="role-test"]').val()
            let newTestLabel = dlg.find('[name="role-test-label"]').val()
            let handling = dlg.find('[name="handling"]').is(':checked');
            roles[index].name = newName;
            roles[index].test = newTest;
            roles[index].testLabel = newTestLabel
            roles[index].handling = handling
            actor.update({ "data.roles": roles })
          }
        }
      },
      default: "enter"
    }).render(true)
  }

  _onRoleInputChange(ev) {
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let roles = duplicate(this.actor.roles)
    roles[index].test = ev.target.value
    this.actor.update({ "data.roles": roles })
  }

  _onRoleDelete(ev) {
    let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
    let roles = duplicate(this.actor.roles)
    roles.splice(index, 1)
    this.actor.update({ "data.roles": roles })
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
}

// Register NPC Sheet
Actors.registerSheet("wfrp4e", ActorSheetWfrp4eVehicle,
  {
    types: ["vehicle"],
    makeDefault: true
  });