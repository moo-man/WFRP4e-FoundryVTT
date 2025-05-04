

export class CorruptionMessageModel extends WarhammerMessageModel {
  static defineSchema() 
  {
      let schema = {};

      schema.strength = new foundry.data.fields.StringField({});
      schema.skill = new foundry.data.fields.StringField()
      schema.source = new foundry.data.fields.StringField()


      return schema;
  }

  static handleCorruptionCommand(strength, skill, source)
  {
    this.createCorruptionMessage(strength.toLowerCase(), {skill, source});
  }
  

  static createCorruptionMessage(strength, {skill, source=""}={}, chatData={})
  {
      renderTemplate("systems/wfrp4e/templates/chat/corruption.hbs", { strength, skill : skill?.capitalize(), source}).then(html => {
      ChatMessage.create(foundry.utils.mergeObject({ 
        type : "corruption", 
        content: html, 
        speaker : {
          alias  : game.i18n.localize("CORRUPTION.Exposure"),
        },
        flavor : source,
        system : {
          strength, 
          source,
          skill
        }}, chatData));
    })
  }

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      resist : this._onResist,
    });
  }

  static async _onResist(ev, target)
  {
    let strength = this.strength.toLowerCase();
    if (game.i18n.localize(strength) != game.i18n.localize("CORRUPTION.Moderate") && game.i18n.localize(strength) != game.i18n.localize("CORRUPTION.Minor") && game.i18n.localize(strength) != game.i18n.localize("CORRUPTION.Major"))
      return ui.notifications.error("ErrorCorruption", {localize : true})


    let actors = warhammer.utility.targetedOrAssignedActors();
    if (actors.length == 0)
      return ui.notifications.error("ErrorCharAssigned", {localize : true})


    actors.forEach(a => {
      a.corruptionDialog(strength, this.skill);
    })
  }

}