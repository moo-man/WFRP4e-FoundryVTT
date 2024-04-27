import {BaseItemModel} from "./components/base";

let fields = foundry.data.fields;

/**
 * Represents an Item used by both Patrons and Characters/NPCs
 */
export class DiseaseModel extends BaseItemModel {

  static defineSchema() {
    let schema = super.defineSchema();
    schema.contraction = new fields.SchemaField({
      value: new fields.StringField(),
    });

    schema.incubation = new fields.SchemaField({
      value: new fields.StringField(),
      unit: new fields.StringField(),
    });

    schema.duration = new fields.SchemaField({
      value: new fields.StringField(),
      unit: new fields.StringField(),
      active: new fields.BooleanField(),
    });

    schema.symptoms = new fields.SchemaField({
      value: new fields.StringField(),
    });

    schema.diagnosed = new fields.BooleanField({initial: false});

    schema.permanent = new fields.SchemaField({
      value: new fields.StringField(),
    });

    return schema;
  }

  async expandData(htmlOptions) {
    let data = await super.expandData(htmlOptions);
    data.properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${this.contraction.value}`);
    data.properties.push(`<b>${game.i18n.localize("Incubation")}:</b> ${this.incubation.value} ${this.incubation.unit}`);
    data.properties.push(`<b>${game.i18n.localize("Duration")}:</b> ${this.duration.value} ${this.duration.unit}`);
    data.properties = data.properties.concat(this.parent.effects.map(i => i = "<a class ='symptom-tag'><i class='fas fa-user-injured'></i> " + i.name.trim() + "</a>").join(", "));

    if (this.permanent.value)
      data.properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${this.permanent.value}`);

    return data;
  }

  chatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${this.contraction.value}`);
    properties.push(`<b>${game.i18n.localize("Incubation")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${this.incubation.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Duration")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${this.duration.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Symptoms")}:</b> ${(this.symptoms.value.split(",").map(i => i = "<a class ='symptom-tag'><i class='fas fa-user-injured'></i> " + i.trim() + "</a>")).join(", ")}`);

    if (this.permanent.value)
      properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${this.permanent.value}`);

    return properties;
  }

  get show()
  {
    return this.diagnosed || game.user.isGM
  }

  shouldTransferEffect(effect)
  {
    return this.duration.active === true;
  }
}