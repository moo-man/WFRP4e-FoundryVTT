import VehicleCrew from "../../apps/vehicle-crew";
import VehicleCumulativeModifiersConfig from "../../apps/vehicle-modifiers";
import VehicleMoveConfig from "../../apps/vehicle-move";
import { StandardActorModel } from "../../model/actor/standard";
import WFRP_Audio from "../../system/audio-wfrp4e";
import WFRP_Utility from "../../system/utility-wfrp4e";
import BaseWFRP4eActorSheet from "./base";
import StandardWFRP4eActorSheet from "./standard-sheet";

export default class ActorSheetWFRP4eVehicle extends BaseWFRP4eActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["vehicle"],
        position : {
          height: 750
        },
        actions: {
          configureMove : this._onConfigureMove,
          rollCharacteristic : this._onRollCharacteristic,
          configureCrew : this._onConfigureCrew,
          rollMorale : this._onRollMorale,
          configureMorale : this._onConfigureMorale,
          rollMood : this._onRollMood,
          configureMood : this._onConfigureMood,
          passengerQty : {buttons: [0, 2], handler : this._onPassengerQtyClick},
          rollExtendedTest : this._onExtendedTestSelect,
          rollCrewTest : this._onRollCrewTest,
          passengerClick : this._onPassengerClick,
          roleClick : this._onRoleClick,
          moodEventClick : this._onMoodEventsClick,
          rollTest : this._onRollTest,
          sellCargo : this._onSellCargo
        },
        window : {
          resizable : true
        },
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/vehicle/vehicle-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/actor-tabs.hbs' },
        main: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/vehicle/vehicle-main.hbs'},
        cargo: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/vehicle/vehicle-cargo.hbs' },
        effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/vehicle/vehicle-effects.hbs' },
        description: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/vehicle/vehicle-description.hbs' },
      }

      static TABS = {
        main: {
          id: "main",
          group: "primary",
          label: "Main",
        },
        cargo: {
          id: "cargo",
          group: "primary",
          label: "Cargo",
        },
        effects: {
          id: "effects",
          group: "primary",
          label: "Effects",
        },
        description: {
          id: "description",
          group: "primary",
          label: "Description",
        }
      }

  async _handleEnrichment() 
  {
    let enrichment = {}
    enrichment["system.details.description.value"] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.details.description.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })
    enrichment["system.details.gmdescription.value"] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.details.gmdescription.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })

    return foundry.utils.expandObject(enrichment)
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context.system.crew = foundry.utils.deepClone(context.system.crew)
    context.system.crew.forEach(c => c.rolesDisplay = c.roles.map(i => `<a data-action="roleClick" data-role-id="${i.id}">${i.name}</a>`).join(", "))
    context.portStayEvents = game.wfrp4e.tables.findTable("port-stay-events");
    context.shipboardEvents = game.wfrp4e.tables.findTable("shipboard-events");
    this._addEncumbranceData(context)
    return context;
  }


  _addEncumbranceData(context) 
  {
    context.system.status.encumbrance.max = context.system.status.carries.max
    context.system.status.encumbrance.pct = context.system.status.encumbrance.over / context.system.status.encumbrance.max * 100
    context.system.status.encumbrance.carryPct = context.system.status.encumbrance.current / context.system.status.carries.max * 100
    if (context.system.status.encumbrance.pct + context.system.status.encumbrance.carryPct > 100) {
      context.system.status.encumbrance.penalty = Math.floor(((context.system.status.encumbrance.carryPct + context.system.status.encumbrance.pct) - 100) / 10)
      context.system.status.encumbrance.message = game.i18n.format("VEHICLE.HandlingPenalty", { penalty: context.system.status.encumbrance.penalty })
      context.system.status.encumbrance.overEncumbered = true;
    }
    else {
      context.system.status.encumbrance.message = game.i18n.localize("VEHICLE.HandlingNoPenalty")
      if (context.system.status.encumbrance.pct + context.system.status.encumbrance.carryPct == 100 && context.system.status.encumbrance.carryPct)
        context.system.status.encumbrance.carryPct -= 1
    }
    context.system.status.encumbrance.total = context.system.status.encumbrance.current + context.system.status.encumbrance.over
    context.system.status.encumbrance.modMsg = game.i18n.format("VEHICLE.ModEncumbranceTT", { amt: context.system.status.encumbrance.over }),
      context.system.status.encumbrance.carryMsg = game.i18n.format("VEHICLE.CarryEncumbranceTT", { amt: Math.round(context.system.status.encumbrance.current * 10) / 10 })
  }

  async _onDropActor(data, event) {
    let document = await Actor.implementation.fromDropData(data);
    if (document?.system instanceof StandardActorModel) {
      if (document.pack) {
        return ui.notification.error("Cannot use Compendium Actors with Vehicles")
      }
    }
    this.actor.update(this.actor.system.passengers.add(document))
  }

  static _onPassengerClick(ev) {
    let id = this._getId(ev)
    this.actor.system.passengers.get(id)?.actor?.sheet.render(true);
  }

  static async _onRollCharacteristic(ev)
  {
    let test = await this.actor.setupCharacteristic("t");
    test.roll();
  }

  static async _onRollTest(ev, target) 
  {
    let type = target.dataset.type;

    if (type == "weapon") {
      let weapon = this._getDocument(ev)

      let vehicleSpeaker
      if (this.actor.isToken)
        vehicleSpeaker = 
      {
          token: this.actor.token.id,
          scene: this.actor.token.parent.id
        }
      else
        vehicleSpeaker =
        {
          actor: this.actor.id
        }


      let actor = await this.actor.system.passengers.choose();

      let test = await actor.setupWeapon(weapon, { vehicle: vehicleSpeaker, ammo: this.actor.itemTags["ammunition"] });
      test.roll();
    }
    else {
      return super._onRollTest(ev, target);
    }
  }

  static _onSellCargo(ev)
  {
    let item = this._getDocument(ev)
    if (item?.type == "cargo")
    {
      game.wfrp4e.trade.attemptSell(item);
    }
  }

  static _onPassengerQtyClick(ev) {
    let multiplier = ev.button == 0 ? 1 : -1;
    multiplier = ev.ctrlKey ? multiplier * 10 : multiplier;
    let id = this._getId(ev);
    this.actor.update(this.actor.system.passengers.count(id,1 * multiplier ));
  }

  static _onRoleClick(ev, target) {
    let id = this._getId(ev)
    let actor = this.actor.system.passengers.get(id)?.actor;
    let role = this.actor.items.get(target.dataset.roleId);
    if (role && actor)
    {
      role.system.roll(actor);
    }
  }

  static _onConfigureMove(ev) {
    new VehicleMoveConfig(this.actor).render(true);
  }

  static _onConfigureCrew(ev)
  {
    new VehicleCrew(this.actor).render(true);
  }

  static async _onRollMorale(ev) 
  {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "morale", roll: true}).render(true);
  }

  static async _onRollMood(ev) 
  {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "mood", roll: true}).render(true);
  }

  static _onConfigureMorale(ev)
  {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "morale"}).render(true);
  }

  static _onConfigureMood(ev)
  {
    new VehicleCumulativeModifiersConfig(this.actor, {key : "mood"}).render(true);
  }

  static _onMoodEventsClick(ev, target)
  {
    this.actor.system.status.mood.rollEvents(target.dataset.key)  
  }

  //#region Trappings
  _prepareCargoContext(context) {
    context.inventory = this.prepareInventory();
  }

  static async _onExtendedTestSelect(ev) {
    let item = this._getDocument(ev)
    let actor = await this.actor.system.passengers.choose();    
    actor.setupExtendedTest(item)
  }

  static async _onRollCrewTest(ev)
  {
    let test = this._getDocument(ev)
    if (test)
    {
      test.system.roll();
    }
  }
}