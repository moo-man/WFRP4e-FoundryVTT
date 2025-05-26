import Advancement from "../../system/advancement";
import WFRP_Utility from "../../system/utility-wfrp4e";
import BaseWFRP4eActorSheet from "./base";

export default class StandardWFRP4eActorSheet extends BaseWFRP4eActorSheet
{

  static DEFAULT_OPTIONS = {
    position : {
      height: 750,
      width: 650
    },
    actions : {
      useDodge : this._onDodgeClick,
      useUnarmed : this._onUnarmedClick,
      useImprovised : this._onImprovisedClick,
      useStomp : this._onStompClick,
      removeMount : this._removeMount,
      dismount : this._dismount,
      showMount : this._showMount,
      randomize: this._randomize,
      editSpecies : this._onEditSpecies,
      stepAilment: {buttons: [0, 2], handler: this._onStepAilment},
    },
  }

  static TABS = {
    main: {
      id: "main",
      group: "primary",
      label: "Main",
    },
    skills: {
      id: "skills",
      group: "primary",
      label: "Skills",
    },
    talents: {
      id: "talents",
      group: "primary",
      label: "Talents",
    },
    combat: {
      id: "combat",
      group: "primary",
      label: "Combat",
    },
    effects: {
      id: "effects",
      group: "primary",
      label: "Effects",
    },
    religion: {
      id: "religion",
      group: "primary",
      label: "Religion",
    },
    magic: {
      id: "magic",
      group: "primary",
      label: "Magic",
    },
    trappings: {
      id: "trappings",
      group: "primary",
      label: "Trappings",
    },
    notes: {
      id: "notes",
      group: "primary",
      label: "Notes",
    }
  }

    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) {
      
    }

    _onDropActor(document, event)
    {
      let mount = fromUuidSync(document.uuid);
      if (event.target.classList.contains("mount-drop"))
      {
        if (game.wfrp4e.config.actorSizeNums[mount.system.details.size.value] < game.wfrp4e.config.actorSizeNums[this.actor.details.size.value])
          return ui.notifications.error(game.i18n.localize("MountError"))
  
        let mountData = {
          id: mount.id,
          mounted: true,
          isToken: false
        }
        if(this.actor.prototypeToken.actorLink && !mount.prototypeToken.actorLink)
          ui.notifications.warn(game.i18n.localize("WarnUnlinkedMount"))
  
        this.actor.update({ "system.status.mount": mountData })
      }
    }

    async _onDropCustom(data, event)
    {
      await super._onDropCustom(data, event);
      if (data.custom == "wounds")
      {
        this.actor.modifyWounds(data.wounds)
      }
    }

  _prepareSkillsContext(context) {
    context.skills = {
      basic: this.actor.itemTypes.skill.filter(i => i.system.advanced.value == "bsc" && i.system.grouped.value == "noSpec").sort(WFRP_Utility.nameSorter),
      advanced: this.actor.itemTypes.skill.filter(i => i.system.advanced.value == "adv" || i.system.grouped.value == "isSpec").sort(WFRP_Utility.nameSorter)
    }
  }

  // Consolidate talents
  _prepareTalentsContext(context) {
    let talents = context.items.talent;
    context.items.talent = [];
    talents.forEach(t => {
      if (!context.items.talent.find(existing => existing.name == t.name))
      {
        context.items.talent.push(t);
      }
    })
  }

    // Organize Spells
    _prepareMagicContext(context) {
      let spells = context.items.spell;
      context.items.spell = {petty : [], lore : []};
      spells.forEach(s => {
        if (s.system.lore.value == "petty")
        {
          context.items.spell.petty.push(s);
        }
        else 
        {
          context.items.spell.lore.push(s);
        }
      })
    }

    // Organize Prayers
    _prepareReligionContext(context) {
      let prayer = context.items.prayer;
      context.items.prayer = {blessing : [], miracle : []};
      prayer.forEach(p => {
        if (p.system.type.value == "blessing")
        {
          context.items.prayer.blessing.push(p);
        }
        else 
        {
          context.items.prayer.miracle.push(p);
        }
      })
    }


  //#region Trappings
  _prepareTrappingsContext(context) {
    context.inventory = this.prepareInventory();
  }
  
  _filterItemCategory(category, itemsInContainers) {
    itemsInContainers = itemsInContainers.concat(category.items.filter(i => !!i.system.location?.value))
    category.items = category.items.filter(i => !i.system.location?.value)//.sort((a, b) => a.sort - b.sort);
    category.show = category.items.length > 0
    return itemsInContainers
  }
  //#endregion

  
  _configureLimitedParts(options)
  {
      let limited = {
          header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/limited/limited-header.hbs', classes: ["sheet-header", "limited"] },
          notes: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/limited/limited-notes.hbs', classes: ["limited"]  },
      };
      Object.values(limited).forEach(p => p.templates ??= []);
      return limited;
  }


  _addEventListeners()
  {    
    super._addEventListeners();
    this.element.querySelectorAll("[data-action='editCharacteristic']").forEach(e => e.addEventListener("change", this.constructor._onEditCharacteristic.bind(this)));
    this.element.querySelector("[data-action='editSpecies']")?.addEventListener("change", this.constructor._onEditSpecies.bind(this));
    this.element.querySelectorAll("[data-action='addSkill']").forEach(e => e.addEventListener("change", this.constructor._onAddSkill.bind(this)));
  }

  static _onEditCharacteristic(ev)
  {
    let characteristic = ev.target.dataset.characteristic;
    let value = Number(ev.target.value);
    let characteristics = this.actor.system.characteristics.toObject();
    if (!(value == characteristics[characteristic].initial + characteristics[characteristic].advances)) 
    {
      characteristics[characteristic].initial = value;
      characteristics[characteristic].advances = 0
      characteristics[characteristic].modifier = 0
    }
    return this.actor.update({ "system.characteristics": characteristics })
  }

  
  static async _onEditSpecies(ev) {
    let split = ev.target.value.split("(")
    let species = split[0].trim()
    let subspecies
    if (split.length > 1) 
    {
        subspecies = split[1].split(")")[0].trim()
    }

    let speciesKey = warhammer.utility.findKey(species, game.wfrp4e.config.species) || species
    let subspeciesKey = ""
    if (subspecies) 
    {
        for (let sub in game.wfrp4e.config.subspecies[speciesKey]) {
            if (game.wfrp4e.config.subspecies[speciesKey][sub].name == subspecies) subspeciesKey = sub
        }
        if (!subspeciesKey) {
            subspeciesKey = subspecies
        }
    }
    let update = { "system.details.species.value": speciesKey, "system.details.species.subspecies": subspeciesKey }
    try 
    {
        let initialValues = await WFRP_Utility.speciesCharacteristics(speciesKey, true, subspeciesKey);
        let characteristics = this.actor.toObject().system.characteristics;
        for (let c in characteristics) {
            characteristics[c].initial = initialValues[c].value
        }

        if (this.actor.type != "character" && (await foundry.applications.api.DialogV2.confirm({ content: game.i18n.localize("SpecChar"), window : {title: game.i18n.localize("Species Characteristics") }})) )
        {
            mergeObject(update, {system: { characteristics, "details.move.value" : WFRP_Utility.speciesMovement(speciesKey) || 4 }})
        }
    } 
    catch(e) 
    { 
        warhammer.utility.log("Error applying species stats: " + e.stack)
    }
    await this.actor.update(update);

}

  static _onAddSkill(ev)
  {
    let nameInput = ev.target.parentElement.querySelector("input");
    let charInput = ev.target.parentElement.querySelector("select");

    if (nameInput.value && charInput.value)
    {
      let type = ev.target.parentElement.dataset.type;
      let item = {type : "skill", name : nameInput.value, system : {advanced : {value : type}, characteristic: {value : charInput.value}}};
      if (this.actor.itemTypes.skill.find(i => i.name == item.name))
      { 
        ui.notifications.error("ERROR.SkillAlreadyExists", {localize: true})
      }
      else 
      {
        this.actor.createEmbeddedDocuments("Item", [item]);
      }
    }
  }

  static _onUnarmedClick(ev) {
    ev.preventDefault();
    let unarmed = game.wfrp4e.config.systemItems.unarmed
    this.actor.setupWeapon(unarmed).then(setupData => {
      this.actor.weaponTest(setupData)
    })
  }
  static _onDodgeClick(ev) {
      this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true}).then(test => {
        test.roll();
      });
  }
  static _onImprovisedClick(ev) {
    ev.preventDefault();
    let improv = game.wfrp4e.config.systemItems.improv;
    this.actor.setupWeapon(improv).then(setupData => {
      this.actor.weaponTest(setupData)
    })
  }

  static _onStompClick(ev) {
    ev.preventDefault();
    let stomp = game.wfrp4e.config.systemItems.stomp;
    this.actor.setupTrait(stomp).then(setupData => {
      this.actor.traitTest(setupData)
    })
  }

  static _dismount(ev) {
    ev.stopPropagation();
    this.actor.update({ "system.status.mount.mounted": !this.actor.status.mount.mounted })
  }

  static _removeMount(ev) {
    ev.stopPropagation();
    let mountData = { id: "", mounted: false, isToken: false }
    this.actor.update({ "system.status.mount": mountData })
  }

  static _onContextMenushowMount(ev) {
    this.actor.mount.sheet.render(true)
  }

  static _randomize(ev)
  {
    let advancement = new Advancement(this.actor);

    try {
      switch (ev.target.dataset.type) {
        case "characteristics":
          advancement.advanceSpeciesCharacteristics()
          return
        case "skills": 
          advancement.advanceSpeciesSkills()
          return
        case "talents":
          advancement.advanceSpeciesTalents()
          return
      }
    }
    catch (error) {
      warhammer.utility.log("Could not randomize: " + error, true)
    }
  }

  static async _onStepAilment(ev)
  {
    ev.stopPropagation();
    ev.preventDefault();
    let document = (await this._getDocument(ev)) || this.document;

    if (!document) return;

    if (ev.button === 0) {
      document.system.decrement();
    } else {
      document.system.increment();
    }
  }

}
