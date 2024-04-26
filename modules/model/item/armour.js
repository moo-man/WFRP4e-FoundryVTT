import { PhysicalItemModel } from "./components/physical";
import PropertiesMixin from "./components/properties";
let fields = foundry.data.fields;

export class ArmourModel extends PropertiesMixin(PhysicalItemModel) {
  static defineSchema() {
    let schema = super.defineSchema();
    schema.worn = new fields.SchemaField({
      value: new fields.BooleanField()
    });
    schema.armorType = new fields.SchemaField({ // TODO migrate this to the "correct" spelling
      value: new fields.StringField()
    });
    schema.penalty = new fields.SchemaField({
      value: new fields.StringField()
    });
    schema.special = new fields.SchemaField({
      value: new fields.StringField()
    });

    schema.AP = new fields.SchemaField({
      head: new fields.NumberField({ initial: 0 }),
      lArm: new fields.NumberField({ initial: 0 }),
      rArm: new fields.NumberField({ initial: 0 }),
      lLeg: new fields.NumberField({ initial: 0 }),
      rLeg: new fields.NumberField({ initial: 0 }),
      body: new fields.NumberField({ initial: 0 }),
    });
    schema.APdamage = new fields.SchemaField({
      head: new fields.NumberField({ initial: 0 }),
      lArm: new fields.NumberField({ initial: 0 }),
      rArm: new fields.NumberField({ initial: 0 }),
      lLeg: new fields.NumberField({ initial: 0 }),
      rLeg: new fields.NumberField({ initial: 0 }),
      body: new fields.NumberField({ initial: 0 }),
    });
    return schema;
  }

  get isEquipped() {
    return this.worn.value
  }

  get protects() {
    let protects = {}
    for (let loc in this.AP) {
      if (this.AP[loc] > 0)
        protects[loc] = true
      else
        protects[loc] = false
    }
    return protects
  }

  get currentAP() {
    let currentAP = foundry.utils.deepClone(this.AP)
    for (let loc in currentAP) {
        currentAP[loc] -= this.properties.qualities.durable  // If durable, subtract its value from APDamage
                          ? Math.max(0, (this.APdamage[loc] - (this.properties.qualities.durable?.value || 0)))
                          : this.APdamage[loc]
    }
    return currentAP
  }

  async preCreateData(data, options, user) {
    let preCreateData = await super.preCreateData(data, options, user);

    if (this.parent.isOwned && this.parent.actor.type != "character" && this.parent.actor.type != "vehicle") {
      foundry.utils.setProperty(preCreateData, "system.worn.value", true); // TODO: migrate this into a unified equipped property
    }

    return preCreateData;
  }

  computeBase() {
    super.computeBase();
    this.damaged = {
      "head": false,
      "lArm": false,
      "rArm": false,
      "lLeg": false,
      "rLeg": false,
      "body": false
    }
  }

  shouldTransferEffect(effect)
  {
      return super.shouldTransferEffect(effect) && (!effect.applicationData.equipTransfer || this.isEquipped)
  }

  toggleEquip()
  {
      return this.parent.update({"system.worn.value" : !this.isEquipped})
  }

    /** 
   * Helper method to apply damage to an item
   * 
   * @param {number} value Damage the item by this amount
   * @param {Array} location Array of locations to damage
   */
    damageItem(value = 1, location=["head", "lArm", "rArm", "lLeg", "rLeg", "body"])
    {
        let update = {};
        for(let loc of location)
        {
          update[`system.APdamage.${loc}`] = Math.clamped(this.APdamage[loc] + value, 0, this.AP[loc])
        }
        return this.parent.update(update);
    }
  
  // Armour Expansion Data
  async expandData(htmlOptions) {
    let data = await super.expandData(htmlOptions);
    let properties = [];
    properties.push(game.wfrp4e.config.armorTypes[this.armorType.value]);
    let itemProperties = this.Qualities.concat(this.Flaws)
    for (let prop of itemProperties)
      properties.push("<a class ='item-property'>" + prop + "</a>")
    properties.push(this.penalty.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  chatData() {
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc || 0} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss || 0} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp || 0} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
    ]

    if (this.armorType.value)
      properties.push(`<b>${game.i18n.localize("ITEM.ArmourType")}</b>: ${game.wfrp4e.config.armorTypes[this.armorType.value]}`);
    if (this.penalty.value)
      properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${this.penalty.value}`);


    for (let loc in game.wfrp4e.config.locations)
      if (this.AP[loc])
        properties.push(`<b>${game.wfrp4e.config.locations[loc]} AP</b>: ${this.currentAP[loc]}/${this.AP[loc]}`);



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

  
  static migrateData(data)
  {
    super.migrateData(data);
    if (data.currentAP)
    {
        data.AP = data.maxAP;
        data.APdamage = data.currentAP;

        for(let loc in data.currentAP)
        {
          if(data.currentAP[loc] == -1)
            data.APdamage[loc] = 0
          else {
            data.APdamage[loc] = data.maxAP[loc] - data.currentAP[loc]
          }
        }
    }
  }

}