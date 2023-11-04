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

    async updateChecks(data, options, user)
    {
        let update = await super.updateChecks(data, options, user);

        if (data.system?.location?.value) {
            let allContainers = this.parent.actor?.getItemTypes("container")
            if (this.formsLoop(item, allContainers))
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
        if (this.actor) 
        {
            // Reset the location of items inside
            let items = this.packsInside.concat(this.carrying).map(i => i.toObject());
            for (let item of items) 
            {
                item.system.location.value = "";
            }

            await this.actor.update({items, [`flags.wfrp4e.sheetCollapsed.-=${this.parent.id}`]: null })
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

}