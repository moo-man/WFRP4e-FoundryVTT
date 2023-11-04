import { PhysicalItemModel } from "./physical";
let fields = foundry.data.fields;

export class PropertiesItemModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.qualities = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });
        schema.flaws = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });
        return schema;
    }


    computeBase() 
    {
        super.computeBase();

        // will probably cause issues with super class calculating encumbrance too
        if (this.encumbrance && this.quantity) {
            if (this.properties?.qualities?.lightweight && this.encumbrance.value >= 1 )
              this.encumbrance.value -= 1
            if (this.properties?.flaws?.bulky )
              this.encumbrance.value += 1
    
            this.encumbrance.value = (this.encumbrance.value * this.quantity.value)
            if (this.encumbrance.value % 1 != 0)
              this.encumbrance.value = this.encumbrance.value.toFixed(2)
          }
    
          if (this.isEquipped && this.type != "weapon") {
            this.encumbrance.value = this.encumbrance.value - 1;
            this.encumbrance.value = this.encumbrance.value < 0 ? 0 : this.encumbrance.value;
          }
    }
   
}