
export default class ActorSettings extends WHFormApplication
{
  static DEFAULT_OPTIONS = {
    id: "actor-settings",
    tag: "form",
    classes : ["warhammer", "standard-form"],
    window: {
      contentClasses : ["standard-form"],
      title: "Actor Settings"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
      handler : this.submit
    }
}

get title() 
{
    return `Actor Settings: ${this.document.name}`;
}

constructor(document, options)
{
    super(options);
    this.document = document;
}

  /** @override */
  static PARTS = {
    form: {
      classes: ["standard-form"],
      template: "systems/wfrp4e/templates/apps/actor-settings.hbs",
      scrollable: [""]
    }
  };

    async _prepareContext(options) 
    {
        let context = await super._prepareContext(options)
        context.tables =  game.wfrp4e.config.hitLocationTables

        context.fields = this.document.system.schema.fields;
        context.source = this.document._source;

        context.displays = {}

        if (this.document.type == "character")
        {
            context.displays.size = true;
            context.displays.movement = true;
            context.displays.wounds = true;
            context.displays.critwounds = true;
            context.displays.corruption = true;
            context.displays.encumbrance = true;
            context.displays.hitloc = true;
            context.displays.equipPoints = true;
            context.displays.mainHand = true;
        }
        if (this.document.type == "npc")
        {
            context.displays.size = true;
            context.displays.movement = true;
            context.displays.wounds = true;
            context.displays.critwounds = true;
            context.displays.encumbrance = true;
            context.displays.hitloc = true;
            context.displays.equipPoints = true;
            context.displays.mainHand = true;
        }
        if (this.document.type == "creature")
        {
            context.displays.size = true;
            context.displays.movement = true;
            context.displays.wounds = true;
            context.displays.critwounds = true;
            context.displays.encumbrance = true;
            context.displays.hitloc = true;
            context.displays.equipPoints = true;
        }
        if (this.document.type == "vehicle")
        {
            context.displays.vehicle = true;
            context.displays.critwounds = true;
            context.displays.hitloc = true;
        }

        return context;
    }

    static async submit(event, form, formData) 
    {
        return this.document.update(formData.object)
    }

}