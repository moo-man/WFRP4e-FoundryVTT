import ActorSettings from "../../../../modules/apps/actor-settings";
import MarketWFRP4e from "../../../../modules/apps/market-wfrp4e";
import ActiveEffectWFRP4e from "../../../../modules/system/effect-wfrp4e";
import WFRP_Utility from "../../../../modules/system/utility-wfrp4e";

export default class BaseWFRP4eActorSheet extends WarhammerActorSheetV2
{

  static DEFAULT_OPTIONS = {
    classes: ["wfrp4e"],
    window : {
      controls : [
        {
          icon : 'fa-solid fa-gear',
          label : "Actor Settings",
          action : "configureActor"
        },
        {
          action: "configurePrototypeToken",
          icon: "fa-solid fa-user-circle",
          label: "TOKEN.TitlePrototype",
          ownership: "OWNER"
        },
        {
          action: "showPortraitArtwork",
          icon: "fa-solid fa-image",
          label: "SIDEBAR.CharArt",
          ownership: "OWNER"
        },
        {
          action: "showTokenArtwork",
          icon: "fa-solid fa-image",
          label: "SIDEBAR.TokenArt",
          ownership: "OWNER"
        }
      ]
    },
    actions : {
      rollTest : this._onRollTest,
      toggleSummary : this._toggleSummary,
      toggleSummaryAlt : {buttons: [2], handler : this._toggleSummary}, // TODO secondary actions
      toggleExtendedTests : this._toggleExtendedTests,
      removeAttacker : this._onRemoveAttacker,
      itemPropertyDropdown : this._onItemPropertyDropdown,
      combatDropdown : this._onCombatDropdown,
      clickCondition : {buttons : [0, 2], handler : this._onClickCondition},
      removeFromContainer : this._onRemoveItemFromContainer,
      convertCurrency : this._onConvertCurrency,
      consolidateCurrency : this._onConsolidateCurrency,
      collapseSection : this._onCollapseSection,
      containerSort : this._onContainerSort,
      createItem : this._onCreateItem,
      configureActor : this._onConfigureActor,
      useAspect : this._onUseAspect,
      toggleQuality : this._onToggleQuality
    },
    defaultTab : "main"
  }

  _prepareTabs(options) {
    let tabs = super._prepareTabs(options);

    if (!this.actor.hasSpells) {
      delete tabs.magic;
    }

    if (!this.actor.hasPrayers) {
      delete tabs.religion;
    }

    return tabs;
  }

  async _prepareContext(options)
  {
    let context = await super._prepareContext(options);
    let aspects = {
      talents : {}, 
      effects : {}, 
      combat : {},
      magic: {}
    }
    this.actor.itemTags.aspect?.forEach(item => {
        if (aspects[item.system.placement][item.system.pluralLabel])
        {
          aspects[item.system.placement][item.system.pluralLabel].push(item);
        }
        else 
        {
          aspects[item.system.placement][item.system.pluralLabel] = [item];
        }
    })
    context.items.aspect = aspects
    context.showExtendedTests = this.showExtendedTests;
    return context;
  }


  _setupContextMenus()
  {
      // return  
      return [
        WarhammerContextMenu.create(this, this.element, ".list-row:not(.nocontext)", this._getListContextOptions()), 
        WarhammerContextMenu.create(this, this.element, ".context-menu", this._getListContextOptions(), {eventName : "click"}),
        WarhammerContextMenu.create(this, this.element, ".context-menu-alt", this._getListContextOptions())
      ];
  }

  _getListContextOptions()
  { 
    return [
      {
        name: "Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => !!li.data("uuid") || !!li.parents("[data-uuid]"),
        callback: async li => {
          let uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);
          document.sheet.render(true);
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-times"></i>',
        condition: li => {
          let uuid = li.data("uuid") || li.parents("[data-uuid]")?.data("uuid")
          if (uuid)
          {
            let doc = fromUuidSync(uuid);
            if (doc?.documentName == "ActiveEffect")
            {
              return doc.parent.uuid == this.document.uuid; // If an effect's parent is not this document, don't show the delete option
            }
            else if (doc)
            {
              return true;
            }
            return false;
          }
          else return false;
        },
        callback: async li => 
        {
          let uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);
          document.delete();
        }
      },
      {
        name: "Post to Chat",
        icon: '<i class="fas fa-comment"></i>',
        condition: li => {
          let uuid = li.data("uuid") || li.parents("[data-uuid]")?.data("uuid")
          if (uuid)
          {
            let doc = fromUuidSync(uuid);
            return doc?.documentName == "Item"; // Can only post Items to chat
          }
          else return false;
        },
        callback: async li => 
        {
          let uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);
          document.postItem();
        }
      },
      {
        name: "Duplicate",
        icon: '<i class="fa-solid fa-copy"></i>',
        condition: li => {
          let uuid = li.data("uuid") || li.parents("[data-uuid]")?.data("uuid")
          if (uuid)
          {
            let doc = fromUuidSync(uuid);
            return doc?.documentName == "Item" && doc.system.isPhysical; // Can only duplicate physical items
          }
          else return false;
        },
        callback: async li => 
        {
            let uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
            const document = await fromUuid(uuid);
            this.actor.createEmbeddedDocuments("Item", [document.toObject()]);
        }
      },
    ];
  }

  async _onDropItem(data, ev)
  {
      let containerDropElement = this._getParent(ev.target, ".container-drop")
      if (containerDropElement)
      {
        let document = await fromUuid(data.uuid);
        let container = await fromUuid(containerDropElement.dataset.uuid);

        //
        if (container.id == document.system.location.value)
        {
          return super._onDropItem(data, ev);
        }
        if (container)
        {
          document.update({"system.location.value" : container.id})
        }
      }
      else 
      {
        return super._onDropItem(data, ev);
      }
  }

  // From Income results - drag money value over to add
  _onDropIncome(data)
  {
    this.document.updateEmbeddedDocuments("Item", MarketWFRP4e.addMoneyTo(this.document, data.amount));
  }

  //#region Effects

  _prepareEffectsContext(context) {
    super._prepareEffectsContext(context);
    
    context.effects.passive = this._consolidateEffects(context.effects.passive)
    context.effects.temporary = this._consolidateEffects(context.effects.temporary)
    context.effects.disabled = this._consolidateEffects(context.effects.disabled)
    context.effects.system = game.wfrp4e.utility.getSystemEffects(this.actor.type == "vehicle");

  }


  _getConditionData(context) {
    try {
      let conditions = foundry.utils.duplicate(game.wfrp4e.config.statusEffects).map(e => new ActiveEffectWFRP4e(e));
      let currentConditions = this.actor.effects.filter(e => e.isCondition);
      delete conditions.splice(conditions.length - 1, 1)

      for (let condition of conditions) {
        let owned = currentConditions.find(e => e.conditionId == condition.conditionId)
        if (owned) {
          condition.existing = true
          condition.system.condition.value = owned.conditionValue;
        }
        else if (condition.isNumberedCondition) {
          condition.system.condition.value = 0
        }
      }
      return conditions;
    }
    catch (e)
    {
      ui.notifications.error("Error Adding Condition Data: " + e);
    }
  }

  _consolidateEffects(effects) {
    let consolidated = []
    for (let effect of effects) {
      let existing = consolidated.find(e => e.name == effect.name)
      if (!existing)
        consolidated.push(effect)
    }
    for (let effect of consolidated) {
      let count = effects.filter(e => e.name == effect.name).length
      effect.count = count
    }
    return consolidated
  }

  //#endregion

  _addEventListeners()
  {
    super._addEventListeners();
    this.element.querySelectorAll('.symptom-tag').forEach(el => el.addEventListener("click", WFRP_Utility.handleSymptomClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.condition-chat').forEach(el => el.addEventListener("click", WFRP_Utility.handleConditionClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.property-chat').forEach(el => el.addEventListener("click", WFRP_Utility.handlePropertyClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.table-click').forEach(el => el.addEventListener("click", WFRP_Utility.handleTableClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.pay-link').forEach(el => el.addEventListener("click", WFRP_Utility.handlePayClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.credit-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleCreditClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.corruption-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.fear-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleFearClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.terror-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleTerrorClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.exp-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleExpClick.bind(WFRP_Utility)))

    this.element.querySelector(".system-effects")?.addEventListener("change", (ev) => {
      let key = ev.target.value;
      this.actor.addSystemEffect(key)
    });

    this.element.querySelectorAll(".rollable").forEach(element => {
      element.addEventListener("mouseenter", ev => {
        let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img") ;
        if (img)
        {
          this._icon = img.src;
          img.src = "systems/wfrp4e/ui/buttons/d10.webp";
        }
      })
      element.addEventListener("mouseleave", ev => {
        let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img") ;
        if (img)
        {
          img.src = this._icon;
        }
      })
    });
  }


  async _handleEnrichment() {
    let enrichment = {}
    enrichment["system.details.biography.value"] = await TextEditor.enrichHTML(this.actor.system.details.biography.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })
    enrichment["system.details.gmnotes.value"] = await TextEditor.enrichHTML(this.actor.system.details.gmnotes.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })

    return expandObject(enrichment)
  }

    /**
     * Prevent effects from stacking up each form submission
   * @override
   */
    async _processSubmitData(event, form, submitData) {
      let diffData = foundry.utils.diffObject(this.document.toObject(false), submitData)
      await this.document.update(diffData);
    }
  

  //#region Action Handlers
  static async _onCreateEffect(ev)
    {
        let type = ev.target.dataset.category;
        let effectData = { name: localize("WH.NewEffect"), img: "icons/svg/aura.svg" };
        if (type == "temporary")
        {
            effectData["duration.rounds"] = 1;
        }
        else if (type == "disabled")
        {
            effectData.disabled = true;
        }

        // If Item effect, use item name for effect name
        if (this.object.documentName == "Item")
        {
            effectData.name = this.object.name;
            effectData.img = this.object.img;
        }
        this.object.createEmbeddedDocuments("ActiveEffect", [effectData]).then(effects => effects[0].sheet.render(true));
    }

    static async _onCreateItem(ev) 
    {
        let type = this._getParent(ev.target, "[data-type]").dataset.type;
        let category = this._getParent(ev.target, "[data-type]").dataset.category;
        let itemData = {type, name : `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`}

        if (type == "trapping")
        {
          itemData["system.trappingType.value"] = category;
        }
        else if (type == "spell" && category == "petty")
        {
          itemData["system.lore.value"] = category;
        }
        else if (type == "prayer")
        {
          itemData["system.type.value"] = category;
        }

        this.document.createEmbeddedDocuments("Item", [itemData]).then(item => item[0].sheet.render(true));
    }

    static async _onConfigureActor(ev)
    {
      new ActorSettings(this.actor).render(true);
    }

    static async _onUseAspect(ev)
    {
      let document = await this._getDocumentAsync(ev);
      if (document && document.system.usable)
      {
        document.system.use();
      }
    }

    static async _onToggleQuality(ev)
    {
      let document = await this._getDocumentAsync(ev);
      let index = this._getIndex(ev);

      let inactive = Object.values(document.system.properties.inactiveQualities);
  
      // Find clicked quality
      let toggled = inactive[index];
  
      // Find currently active
      let qualities = foundry.utils.deepClone(document.system.qualities.value);
  
      // Disable all qualities of clicked group
      qualities.filter(i => i.group == toggled.group).forEach(i => i.active = false)
  
      // Enabled clicked quality
      qualities.find(i => i.name == toggled.key).active = true;
  
      document.update({"system.qualities.value" : qualities})
    }

    static async _onRollTest(ev)
    {
      let test;
      let document = await this._getDocumentAsync(ev);
      let options = {fields : {}};
      let target = this._getParent(ev.target, "[data-action='rollTest']")
      if (target)
      {
        options.fields.modifier = Number(target.dataset.modifier) || 0;
      }
      switch (target.dataset.type)
      {
        case "characteristic": 
          test = await this.document.setupCharacteristic(ev.target.dataset.characteristic, options)
          break;
        case "skill":
          test = await this.document.setupSkill(document.name, options)
          break;
        case "extendedTest":
          test = await this.document.setupExtendedTest(document, options);
          break;
        case "trait":
          test = await this.document.setupTrait(document, options);
          break;
        case "weapon":
          test = await this.document.setupWeapon(document, options);
          break;
        case "spell":
          test = await this.castOrChannelPrompt(document, options);
          break;
        case "prayer":
          test = await this.actor.setupPrayer(document, options);
          break;
      }

      test?.roll();
    }

    castOrChannelPrompt(spell, options = {}) {
      // Do not show the dialog for Petty spells, just cast it.
      if (spell.system.lore.value == "petty" || spell.system.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))
      {
        return this.actor.setupCast(spell, options)
      }
      else {
          return Dialog.wait({
            title: game.i18n.localize("DIALOG.CastOrChannel"),
            content: `<div class="cast-channel-dialog selection"> 
                      <p>${game.i18n.localize("DIALOG.CastChannel")}</p> 
                      </div>`,
            buttons: {
              cast: {
                label: game.i18n.localize("Cast"),
                callback: btn => {
                  return this.actor.setupCast(spell, options);
                }
              },
              channel: {
                label: game.i18n.localize("Channel"),
                callback: async btn => {
                  return this.actor.setupChannell(spell, options);
                  // TODO: move this elsewhere
                  // await test.roll();
                  // if (test.context.channelUntilSuccess) {
                  //   await warhammer.utility.sleep(200);
                  //   do {
                  //     if (test.item.cn.SL >= test.item.cn.value) {
                  //       break;
                  //     }
                  //     if (test.result.minormis || test.result.majormis || test.result.catastrophicmis) {
                  //       break;
                  //     }
                  //     test.context.messageId = null; // Clear message so new message is made
                  //     await test.roll();
                  //     await warhammer.utility.sleep(200);
                  //   } while (true);
                  // }
                }
              }
            },
            default: 'cast'
          });
      }
    }

    static async _toggleExtendedTests(ev)
    {
      this.showExtendedTests = !this.showExtendedTests;
      this.render(true);
    }

    static _onRemoveAttacker(ev) {
      this.actor.update({ "flags.-=oppose": null })
    }

    static _onClickCondition(ev) {
      let conditionKey = this._getParent(ev.target, ".condition")?.dataset.key
      let existing = this.actor.hasCondition(conditionKey)
      
      if (!existing?.isNumberedCondition && ev.button == 0)
      {
        this.actor.removeCondition(conditionKey);
      }
      
      ev.button == 0 ? this.actor.addCondition(conditionKey) : this.actor.removeCondition(conditionKey) 
    }

    static async _onRemoveItemFromContainer(ev)
    {
      let item = await this._getDocumentAsync(ev);
      return item.update({ "system.location.value": "" })
    }


    static async _toggleSummary(ev)
    {
      let item = await this._getDocumentAsync(ev);
      if (item)
      {
        let expandData = await item.system.expandData({secrets: this.actor.isOwner});
        this._toggleDropdown(ev, expandData.description.value);
      }
    }

    async _toggleDropdown(ev, content, parentSelector=".list-row")
    {
      let dropdownElement = this._getParent(ev.target, parentSelector).querySelector(".dropdown-content");
      if (dropdownElement.classList.contains("collapsed"))
      {
        dropdownElement.innerHTML = content;
        dropdownElement.style.height = `${dropdownElement.scrollHeight}px`;
        dropdownElement.classList.replace("collapsed", "expanded");
        // Fit content can't be animated, but we would like it be flexible height, so wait until animation finishes then add fit-content
        // sleep(500).then(() => dropdownElement.style.height = `fit-content`);
        
      }
      else if (dropdownElement.classList.contains("expanded"))
      {
        // dropdownElement.style.height = `${dropdownElement.scrollHeight}px`;
        dropdownElement.style.height = `0px`;
        dropdownElement.classList.replace("expanded", "collapsed");
      }
    }

    static async _onItemPropertyDropdown(ev) {
      let item = await this._getDocumentAsync(ev);
      let type = ev.target.dataset.type;
      let properties = Object.values(item.system.properties[type])
      if (type == "qualities")
      {
        properties = properties.concat(Object.values(item.system.properties.unusedQualities), Object.values(item.system.properties.inactiveQualities));
      }
      let propData = properties.find(p => p.display == ev.target.text);
      let key = propData.key;
      let value = propData.value;
      let propertyDescriptions = foundry.utils.mergeObject(foundry.utils.deepClone(game.wfrp4e.config.qualityDescriptions), game.wfrp4e.config.flawDescriptions);
      if (key)
      {
        let description = propertyDescriptions[key]?.replace("(Rating)", value) || `Description for ${ev.target.text} was not found`;
        
        this._toggleDropdown(ev, description)
      }
    }

    static async _onCombatDropdown(ev) {
      let property = ev.target.dataset.property;
      let item = await this._getDocumentAsync(ev);
      let description = "";

      switch(property)
      {
        case "group":
          description = game.wfrp4e.config.weaponGroupDescriptions[item.system.weaponGroup.value];
          break;
        case "reach":
          description = game.wfrp4e.config.reachDescription[item.system.reach.value];
          break;
        case "special":
          description = item.system.properties.special;
          break;
        case "specialAmmmo":
          description = item.system.properties.specialAmmo;
          break;
        case "range":
            if (!game.settings.get("wfrp4e", "mooRangeBands"))
            {

              description =
              `<a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Point Blank"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Short Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Short Range"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Normal")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Normal"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Long Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Long Range"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Extreme")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Extreme"]]}</a><br>
                `
                
            }
            //@HOUSE
            else {
              game.wfrp4e.utility.logHomebrew("mooRangeBands")
              description =
              `<a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Short Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Short Range")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Normal")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Normal")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Long Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Long Range")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Extreme")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Extreme")}`].modifier}</a><br>
                `
            }
          break;
      }
        
      this._toggleDropdown(ev, description)
    }

    static _onConvertCurrency(ev) 
    {

      ev.preventDefault();
      let type = this._getParent(ev.target, "a").dataset.type;
      let money = this.actor.itemTypes.money;
      let itemData = MarketWFRP4e.convertMoney(money, type);
      return this.actor.updateEmbeddedDocuments("Item", itemData)
    }

    static _onConsolidateCurrency(ev) 
    {
      ev.preventDefault();
      let money = this.actor.itemTypes.money;
      let newMoney = MarketWFRP4e.consolidateMoney(money.map(i => i.toObject()));
      return this.actor.updateEmbeddedDocuments("Item", newMoney)
    }

    static _onCollapseSection(ev)
    {
      let section = this._getParent(ev.target, "a").dataset.section;
      let collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[section]
  
      this.actor.setFlag("wfrp4e", `sheetCollapsed.${section}`, !collapsed);
    }
    
    static async _onContainerSort(ev)
    {
      let direction = this._getParent(ev.target, "a").dataset.direction

      let container = await this._getDocumentAsync(ev);

      // All Containers on the same level as the sorted container
      let containers = this.actor.itemTags.container.sort((a, b) => a.sort - b.sort).filter(i => i.system.location.value == container.system.location.value);

      // Index of the sorted container
      let index = containers.findIndex(i => i.id == container.id);

      if ((index == 0 && direction == "up") || (index == containers.length - 1 && direction == "down"))
        {
          return;
        }

        // Index of the target container
        let targetIndex = direction == "up" ? index - 1 : index + 1;
        let target = containers[targetIndex];

        // Remove sorted container
        containers = containers.filter(i => i.id != container.id);

      let sorted = SortingHelpers.performIntegerSort(container, {target, siblings: containers});
      this.actor.updateEmbeddedDocuments("Item", sorted.map(s => 
      {
          return foundry.utils.mergeObject({
              _id : s.target.id,
          }, s.update);
      }));
  
    }

    //#endregion
}
