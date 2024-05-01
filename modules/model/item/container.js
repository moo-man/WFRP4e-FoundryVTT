import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class ContainerModel extends PhysicalItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.worn = new fields.SchemaField({
            value: new fields.BooleanField()
        });
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

    get isEquipped() {
      return this.worn.value
    }

    async preUpdateChecks(data, options, user) {
      await super.preUpdateChecks(data);
      if (getProperty(data, "system.location.value") == this.parent.id)
      {
        delete setProperty(data, "system.location.value", null)
      }
  }

    updateChecks(data, options, user)
    {
        let update = super.updateChecks(data, options, user) || {};

        if (data.system?.location?.value) {
            let allContainers = this.parent.actor?.getItemTypes("container")
            if (this.formsLoop(this.parent, allContainers))
            {
              ui.notifications.error("Loop formed - Resetting Container Location")
              update["system.location.value"] = "";
            }
          }

          return update
    }


    async preDeleteChecks() {
        await super.preDeleteChecks()

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

    toggleEquip()
    {
        return this.parent.update({"system.worn.value" : !this.isEquipped})
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

    shouldTransferEffect(effect)
    {
        return super.shouldTransferEffect(effect) && (!effect.applicationData.equipTransfer || this.isEquipped)
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

}