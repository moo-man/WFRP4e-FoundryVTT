
import ActorSheetWfrp4e from "./actor-sheet.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import MarketWfrp4e from "../../apps/market-wfrp4e.js";
import WFRP_Audio from "../../system/audio-wfrp4e.js";

/**
 * Provides the specific interaction handlers for NPC Sheets.
 *
 * ActorSheetWfrp4eNPC is assigned to NPC type actors, and the specific interactions
 * npc type actors need are defined here, specifically for careers. NPCs have the unique
 * functionality with careers where clicking "complete" automatically advances characteristics,
 * skills, and talents from that career.
 * 
 */
export default class ActorSheetWfrp4eVehicle extends ActorSheetWfrp4e
{
  static get defaultOptions()
  {
    const options = super.defaultOptions;
    mergeObject(options,
    {
      classes: options.classes.concat(["wfrp4e", "actor", "vehicle-sheet"]),
      width: 610,
      height: 740,
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}, {dragSelector: ".actor-list .actor", dropSelector: null}]
    });
    return options;
  }

  async _onDrop(event) 
  {
    let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (dragData.type == "Actor")
    {
      let passengers = duplicate(this.actor.data.data.passengers);
      passengers.push({id : dragData.id, count : 1});
      this.actor.update({"data.passengers" : passengers})
    }
    else return super._onDrop(event);
  }


  getData()
  {
    let data = super.getData();
    data.availabilities =  game.wfrp4e.config.availability;
    data.data.roles.forEach(r => {
      if (r.actor)
      {
        r.img = game.actors.get(r.actor)?.data?.token?.img
      }
    })
    return data;
  }
  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template()
  {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.html";
    return "systems/wfrp4e/templates/actors/vehicle/vehicle-sheet.html";
  }



  async passengerSelect(dialogMessage = game.i18n.localize("DIALOG.ActorSelection"))
  {
    return new Promise((resolve, reject) => {
        renderTemplate("systems/wfrp4e/templates/dialog/vehicle-weapon.html", {dialogMessage, actors: this.actor.data.passengers.map(p => p.actor)}).then(dlg => {
        new Dialog({
          content: dlg,
          title : game.i18n.localize("DIALOG.ActorSelection"),
          buttons : {
            select : {
              label : game.i18n.localize("Select"),
              callback : (dlg) => {
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
  activateListeners(html)
  {
    super.activateListeners(html);


    html.find(".passenger .name").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      game.actors.get(this.actor.data.data.passengers[index].id).sheet.render(true);
    })

    
    html.find(".role-skill").click(async ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let roles = duplicate(this.actor.data.data.roles)
      if (ev.button == 0)
      {
        let {actor, test, testLabel, handling}= roles[index];
        actor = game.actors.get(actor);
        if (!actor)
          return ui.notifications.error(game.i18n.localize("VEHICLE.NoActor"))
        if (!actor.owner)
          return ui.notifications.error(game.i18n.localize("VEHICLE.TestNotPermitted"))

        let skill = actor.data.skills.find(s => s.name == test)
        let setupData
        let title
        if (testLabel) testLabel + " - " + test;

        if (!skill)
        {
          let char = game.wfrp4e.utility.findKey(test, game.wfrp4e.config.characteristics)
          if (!char)
            return ui.notifications.error(game.i18n.localize("VEHICLE.TestNotFound"))
          
          if (testLabel)
            title = testLabel +  " - " + test

          let prefill = this.actor.getPrefillData("characteristic", char, {vehicle : this.actor.id, handling})
          let penalty = this.actor.data.encumbrance.penalty || 0
          if (handling)
            prefill.slBonus -= penalty
          let modify = {modifier : prefill.testModifier, slBonus : prefill.slBonus, successBonus : prefill.successBonus}
          setupData = await actor.setupCharacteristic(char, {title, vehicle : this.actor.id, handling, modify})
        }
        else 
        {
          if (testLabel)
            title = testLabel +  " - " + test

          let prefill = this.actor.getPrefillData("skill", skill, {vehicle : this.actor.id, handling})
          let penalty = this.actor.data.encumbrance.penalty || 0
          if (handling)
            prefill.slBonus -= penalty
          let modify = {modifier : prefill.testModifier, slBonus : prefill.slBonus, successBonus : prefill.successBonus}
          setupData = await actor.setupSkill(skill, {title, vehicle : this.actor.id, handling, modify})
        }
        actor.basicTest(setupData);
      }
    })

    html.find(".role-name").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let roles = duplicate(this.actor.data.data.roles)

      let actor= game.actors.get(roles[index].actor);
      if (!actor)
        return ui.notifications.error(game.i18n.localize("VEHICLE.NoActor"))
      else 
        actor.sheet.render(true)

    })


    // Weapon tests
    html.find('.vehicle-weapon-name').click(async event => {
      event.preventDefault();
      let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
      let weapon = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))

      if (!game.user.isGM && game.user.character)
      {
        if (this.actor.data.passengers.find(p => p.actor._id == game.user.character.id))
        {
          game.user.character.setupWeapon(weapon, {vehicle :this.actor.id, ammo : this.actor.data.inventory.ammunition.items}).then(setupData => {
            game.user.character.weaponTest(setupData);
          })
        }
      }
      else
      {
        let actor = await this.passengerSelect(game.i18n.localize("DIALOG.VehicleActorSelect"))
        if (!actor.owner)
          return ui.notifications.error(game.i18n.localize("VEHICLE.CantUseActor"))

        actor.setupWeapon(weapon, {vehicle :this.actor.id, ammo : this.actor.data.inventory.ammunition.items}).then(setupData => {
          actor.weaponTest(setupData);
        })
      }
    })

    // Do not proceed if sheet is not editable
    if (!this.options.editable) return;


    html.find(".passenger-qty-click").mousedown(ev => {
      let multiplier = ev.button == 0 ? 1 : -1;
      multiplier = ev.ctrlKey ? multiplier * 10 : multiplier;

      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let passengers = duplicate(this.actor.data.data.passengers);
      passengers[index].count += 1 * multiplier;
      passengers[index].count = passengers[index].count < 0 ? 0 : passengers[index].count
      this.actor.update({"data.passengers" : passengers});
    })

    html.find(".passenger-delete-click").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let passengers = duplicate(this.actor.data.data.passengers);
      passengers.splice(index, 1)
      this.actor.update({"data.passengers" : passengers});
    })
    
    html.find(".role-edit").mousedown(async ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let roles = duplicate(this.actor.data.data.roles)
        let actor = this.actor
        new Dialog({
          content : 
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
          title : game.i18n.localize("VEHICLE.EnterRoleName"),
          buttons : {
            enter : {
              label : game.i18n.localize("Confirm"),
              callback : dlg => {
                let newName = dlg.find('[name="role-name"]').val()
                let newTest = dlg.find('[name="role-test"]').val()
                let newTestLabel = dlg.find('[name="role-test-label"]').val()
                let handling = dlg.find('[name="handling"]').is(':checked');
                roles[index].name = newName;
                roles[index].test = newTest;
                roles[index].testLabel = newTestLabel
                roles[index].handling = handling
                 actor.update({"data.roles" : roles})
              }
            }
          },
          default: "enter"
        }).render(true)
      })

    
    html.find(".role-input").change(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let roles = duplicate(this.actor.data.data.roles)
      roles[index].test = ev.target.value
      this.actor.update({"data.roles" : roles})
    })

    html.find(".role-actor").change(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let roles = duplicate(this.actor.data.data.roles)
      roles[index].actor = ev.target.value
      this.actor.update({"data.roles" : roles})
    })

    html.find(".role-delete").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let roles = duplicate(this.actor.data.data.roles)
      roles.splice(index, 1)
      this.actor.update({"data.roles" : roles})
    })
  
    html.find(".cargo .inventory-list .name").mousedown(ev => {
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
    })

  }
}

// Register NPC Sheet
Actors.registerSheet("wfrp4e", ActorSheetWfrp4eVehicle,
{
  types: ["vehicle"],
  makeDefault: true
});