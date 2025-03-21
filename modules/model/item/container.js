import { PhysicalItemModel } from "./components/physical";
import {EquippableItemModel} from "./components/equippable.js";
let fields = foundry.data.fields;

/**
 *
 * @extends EquippableItemModel
 */
export class ContainerModel extends EquippableItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.container"];
    
    static defineSchema() {
        let schema = super.defineSchema();
        schema.wearable = new fields.SchemaField({
            value: new fields.BooleanField()
        });
        schema.carries = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.countEnc = new fields.SchemaField({
            value: new fields.BooleanField()
        });

        return schema;
    }

    static get compendiumBrowserFilters() {
      return new Map([
        ...Array.from(super.compendiumBrowserFilters),
        ["wearable", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.wearable.value.label",
          type: "boolean",
          config: {
            keyPath: "system.wearable.value"
          }
        }],
        ["carries", {
          label: this.LOCALIZATION_PREFIXES + ".FIELDS.carries.value.label",
          type: "range",
          config: {
            keyPath: "system.carries.value"
          }
        }],
      ]);
    }

  /**
   * Used to identify an Item as one being a child or instance of ContainerModel
   *
   * @final
   * @returns {boolean}
   */
  get isContainer() {
    return true;
  }

    get worn() {
      console.warn("[DEPRECATION] `container.worn` is deprecated, please use `container.equipped` instead");
      return this.equipped;
    }

    get weighsLessEquipped() {
      return true;
    }

    async _preUpdate(data, options, user) {
      await super._preUpdate(data, options, user);
      if (getProperty(data, "system.location.value") == this.parent.id)
      {
        delete foundry.utils.setProperty(data, "system.location.value", null)
      }
  }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);

        if (data.system?.location?.value) 
        {
            let allContainers = this.parent.actor?.itemTags["container"]
            if (this.formsLoop(this.parent, allContainers))
            {
              ui.notifications.error("Loop formed - Resetting Container Location")
              this.parent.update({"system.location.value" : ""});
            }
        }
    }


    async _preDelete(options, user) {
        await super._preDelete(options, user)

        // When deleting a container, remove the flag that determines whether it's collapsed in the sheet
        if (this.parent.actor) 
        {
            // Reset the location of items inside
            let items = (this.packsInside || []).concat(this.carrying || []).map(i => i.toObject());
            for (let item of items) 
            {
                item.system.location.value = "";
            }

            await this.parent.actor.update({items, [`flags.wfrp4e.sheetCollapsed.-=${this.parent.id}`]: null })
        }
    }


    formsLoop(container, containerList, stack = []) {
      if (!container.location.value)
        return false
      else if (stack.includes(container.id))
        return true
      else {
        stack.push(container.id)
        return this.formsLoop(containerList.find(c => c.id == container.location.value), containerList, stack)
      }
    }


    computeOwned()
    {
      if (!this.countEnc.value)
      {
        this.encumbrance.value = 0;
      }
    }

    computeEncumbrance() 
    {
      let enc = super.computeEncumbrance();
      if (!this.countEnc.value)
      {
        enc = 0;
      }
      return enc;
    }


    chatData() {
      let properties = [
        `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc || 0} GC, ${this.price.ss || 0} SS, ${this.price.bp || 0} BP`,
        `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
        `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
      ]
  
      properties.push(`<b>${game.i18n.localize("Wearable")}</b>: ${(this.wearable.value ? game.i18n.localize("Yes") : game.i18n.localize("No"))}`);
      properties.push(`<b>${game.i18n.localize("ITEM.CountOwnerEnc")}</b>: ${(this.countEnc.value ? game.i18n.localize("Yes") : game.i18n.localize("No"))}`);
      return properties;
    }

    static migrateData(data)
    {
      super.migrateData(data);
      if (data.worn?.value) {
        data.equipped = {value: data.worn.value};
      }
    }
}