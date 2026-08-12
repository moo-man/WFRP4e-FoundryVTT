

export class XPMessageModel extends WarhammerMessageModel {
  static defineSchema() 
  {
      let schema = {};

      // amount of XP
      schema.amount = new foundry.data.fields.NumberField({});

      // What XP reward is for
      schema.reason = new foundry.data.fields.StringField()

      // Who has received the XP already
      schema.receivedBy = new foundry.data.fields.ArrayField(new foundry.data.fields.StringField);

      return schema;
  }

  static async handleXPCommand(amount, reason)
  {
    if (isNaN(amount))
    {
      amount = await ValueDialog.create({text: game.i18n.format("DIALOG.EnterXP", {amount: amount}), title: game.i18n.localize("DIALOG.EnterXPTitle")})
      if (isNaN(amount))
      {
        return ui.notifications.error(game.i18n.localize("ERROR.Experience"))
      }
    }


    this.createXPMessage(amount, reason);
  }
  

  static createXPMessage(amount, reason)
  {

    foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/experience.hbs", { amount, reason}).then(html => {
      ChatMessage.create({ 
        type : "xp", 
        content: html, 
        speaker : {
          alias  : game.i18n.localize("CHAT.Experience"),
        },
        system : {
          amount, reason
        }});
    })
  }

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      receive : this._onReceive,
    });
  }

  updateReceived(actor)
  {
    this.parent.update({"system.receivedBy" : this.system.receivedBy.concat(actor.id)});
  }


  static async _onReceive(ev, target)
  {

    if (game.user.isGM) 
    {
      let actors = warhammer.utility.targetsWithFallback()
      if (!actors.length)
      {
        return ui.notifications.warn("ErrorExp", {localize : true})
      }

      actors.forEach(actor => 
      {
        if (!this.receivedBy.includes(actor.id)) 
        {
          this.receivedBy.push(actor.id); // Add locally to handle fast clicking or no GM 
          actor.system.awardExp(this.amount, this.reason, this.parent.id)
        }
        else
        {
          ui.notifications.notify(game.i18n.format("DIALOG.XPAlreadyReceived", {actor: actor.name}))
        }
      })

      if (canvas.scene)
      { 
        game.canvas.tokens.setTargets([])
      }
    }
    else // Not GM User
    {
      if (!game.user.character)
      {
        return ui.notifications.warn("ErrorCharAssigned", {localize : true})
      }
      if (this.receivedBy.includes(game.user.character.id))
      {
        return ui.notifications.notify(game.i18n.format("DIALOG.XPAlreadyReceived", {actor: actor.name}))
      }

      this.receivedBy.push(game.user.character.id); // Add locally to handle fast clicking or no GM 
      game.user.character.system.awardExp(this.amount, this.reason, this.parent.id)
    }
  }

}