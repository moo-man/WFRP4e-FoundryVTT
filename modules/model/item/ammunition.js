import { PhysicalItemModel } from "./components/physical";
import PropertiesMixin from "./components/properties";
let fields = foundry.data.fields;

export class AmmunitionModel extends PropertiesMixin(PhysicalItemModel)
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.ammunitionType = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.range = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.damage = new fields.SchemaField({
            value: new fields.StringField(),
            dice: new fields.StringField({ initial: "" })
        });
        schema.ammunitionType = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.special = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }

  /**
   * Used to identify an Item as one being a child or instance of AmmunitionModel
   *
   * @final
   * @returns {boolean}
   */
  get isAmmunition() {
    return true;
  }

      // Ammunition Expansion Data
  async expandData(htmlOptions) {
    let data = await super.expandData(htmlOptions);
    let properties = [];
    properties.push(game.wfrp4e.config.ammunitionGroups[this.ammunitionType.value])

    if (this.range.value)
      properties.push(`${game.i18n.localize("Range")}: ${this.range.value}`);

    if (this.damage.value) {
      let damage = this.damage.value
      if (this.damage.dice)
        damage += " + " + this.damage.dice
      properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
    }

    let itemProperties = this.Qualities.concat(this.Flaws)
    for (let prop of itemProperties)
      properties.push("<a class ='item-property'>" + prop + "</a>")

    if (this.special.value)
      properties.push(`${game.i18n.localize("Special")}: ` + this.special.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  chatData() {
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc || 0} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss || 0} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp || 0} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
    ]

    properties.push(`<b>${game.i18n.localize("ITEM.AmmunitionType")}:</b> ${game.wfrp4e.config.ammunitionGroups[this.ammunitionType.value]}`)

    if (this.range.value)
      properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);

    if (this.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);

    // Make qualities and flaws clickable
    if (this.qualities.value.length)
      properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${this.OriginalQualities.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);

    if (this.flaws.value.length)
      properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${this.OriginalFlaws.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);


    properties = properties.filter(p => p != game.i18n.localize("Special"));
    if (this.special.value)
      properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + this.special.value);

    properties = properties.filter(p => !!p);
    return properties;
  }

  // Ammo effects should never transfer to actors, they always append to the weapon's effects
  shouldTransferEffect(effect)
  {
    return false;
  }
}