

export class PsychMessageModel extends WarhammerMessageModel {
  static defineSchema() 
  {
      let schema = {};

      schema.type = new foundry.data.fields.StringField({choices : ["fear", "terror"]});

      schema.rating = new foundry.data.fields.NumberField({})

      schema.source  = new foundry.data.fields.StringField({})

      return schema;
  }

  static handleFearCommand(rating, source)
  {
    this.createFearMessage(rating, source);
  }

  static createFearMessage(rating, source)
  {

    if (isNaN(rating))
    {
      rating = 0
    }
    
    let title = `${game.i18n.localize("CHAT.Fear")} ${rating}`;

    if (source)
    {
        title += ` - ${source}`
    }

    foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/fear.hbs", { title}).then(html => {
      ChatMessage.create({ 
        type : "psych", 
        content: html, 
        speaker : {
          alias  : game.i18n.localize("CHAT.Fear"),
        },
        system : {
          type : "fear",
          rating,
          source
        }});
    })
  }

  static handleTerrorCommand(rating, source)
  {
    this.createTerrorMessage(rating, source);
  }

  static createTerrorMessage(rating, source)
  {

    if (isNaN(rating))
    {
      rating = 0
    }
    
    let title = `${game.i18n.localize("CHAT.Terror")} ${rating}`;

    if (source)
    {
        title += ` - ${source}`
    }

    foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/fear.hbs", { title}).then(html => {
      ChatMessage.create({ 
        type : "psych", 
        content: html, 
        speaker : {
          alias  : game.i18n.localize("CHAT.Terror"),
        },
        system : {
          type : "terror",
          rating,
          source
        }});
    })
  }

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      apply : this._onApply,
    });
  }


  static async _onApply(ev, target)
  {

    if (game.user.isGM) 
    {
      let actors = warhammer.utility.targetsWithFallback()
      if (!actors.length)
      {
        return ui.notifications.warn("ErrorTarget", {localize : true})
      }
      actors.forEach(actor => 
      {
        if (this.type == "fear")
        {
          actor.applyFear(this.rating, this.source)
        }
        else if (this.type == "terror")
        {
          actor.applyTerror(this.rating, this.source)
        }
      })

      if (canvas.scene) 
      {
        game.canvas.tokens.setTargets([])
      }
    }
    else 
    {
      if (!game.user.character)
      {
        return ui.notifications.warn("ErrorCharAssigned", {localize : true})
      }
      if (this.type == "fear")
      {
        game.user.character.applyFear(this.rating, this.source)
      }
      else if (this.type == "terror")
      {
        game.user.character.applyTerror(this.rating, this.source)
      }
    }
  }


  static _onFearButtonClicked(event) {


    if (game.user.isGM) 
    {
      if (!targets.length)
        return ui.notifications.warn("ErrorTarget", {localize : true})
      targets.forEach(t => {
        t.actor.applyFear(value, name)
        if (canvas.scene) {
          game.canvas.tokens.setTargets([])
        }
      })
    }
    else 
    {
      if (!game.user.character)
        return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
      game.user.character.applyFear(value, name)
    }
  }

  static _onTerrorButtonClicked(event) {
    let value = parseInt($(event.currentTarget).attr("data-value"));
    let name = parseInt($(event.currentTarget).attr("data-name"));
    
    let targets = canvas.tokens.controlled.concat(Array.from(game.user.targets).filter(i => !canvas.tokens.controlled.includes(i)))
    if (canvas.scene) {
      game.canvas.tokens.setTargets([])
    }

    if (game.user.isGM) {
      if (!targets.length)
        return ui.notifications.warn(game.i18n.localize("ErrorTarget"))
      targets.forEach(t => {
        t.actor.applyTerror(value, name)
      })
    }
    else {
      if (!game.user.character)
        return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
      game.user.character.applyTerror(value, name)
    }
  }

}