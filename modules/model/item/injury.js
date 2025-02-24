import {LocationalItemModel} from "./components/locational";

let fields = foundry.data.fields;

export class InjuryModel extends LocationalItemModel
{

  static LOCALIZATION_PREFIXES = ["WH.Models.injury"];


  static defineSchema()
  {
    let schema = super.defineSchema();
    schema.penalty = new fields.SchemaField({
      value: new fields.StringField(),
    })
    schema.duration = new fields.SchemaField({
      value: new fields.StringField(),
      active: new fields.BooleanField(),
      permanent: new fields.BooleanField(),
    });
    return schema;
  }

  /**
   * Used to identify an Item as one being a child or instance of InjuryModel
   *
   * @final
   * @returns {boolean}
   */
  get isInjury() {
    return true;
  }

  chatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Location")}</b>: ${this.location.value}`);
    if (this.penalty.value)
      properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${this.penalty.value}`);
    return properties;
  }

  async increment() {
    if (this.duration.active)
    {
      return await this.parent.update({"system.duration.value" : Number(this.duration.value) + 1})
    }
  }

  async decrement() {
    if (isNaN(this.duration.value)) {
      return await this.start();
    }

    let update = {};
    let duration = Number(this.duration.value) - 1;

    if (duration == 0) {
      return await this.finish();
    } else {
      update["system.duration.value"] = duration;
    }

    return await this.parent.update(update);
  }

  async start() {
    try {
      let roll = await new Roll(this.duration.value, this.parent.actor).roll();
      roll.toMessage({speaker: {alias: this.parent.actor.name}, flavor: this.parent.name});

      return await this.parent.update({
        "system.duration.value": roll.total,
        "system.duration.active": true
      });
    } catch (error) {
      return ui.notifications.error(game.i18n.localize("ERROR.ParseInjury"));
    }
  }

  async finish() {
    let msg = game.i18n.format("CHAT.InjuryFinish", {injury: this.parent.name});

    ChatMessage.create(foundry.utils.mergeObject(this.getMessageData(msg), {whisper: ChatMessage.getWhisperRecipients("GM")}));

    await this.parent.delete();
  }

  getMessageData(content = "") {
    return {content, speaker: {alias: this.parent.name}, flavor: this.parent.actor.name};
  }
}