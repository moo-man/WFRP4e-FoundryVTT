let fields = foundry.data.fields;

 export class BaseItemModel extends BaseWarhammerItemModel 
 {

     static defineSchema() 
     {
        return {
            description : new fields.SchemaField({
                value: new fields.HTMLField()
            }),
            gmdescription : new fields.SchemaField({
                value: new fields.HTMLField()
            }),
        } 
     }

     get tags()
     {
        return new Set().add(this.parent.type);
     }

     /** @override */
     static get compendiumBrowserFilters() {
       return new Map([
         ["description", {
           label: "Description",
           type: "text",
           config: {
             keyPath: "system.description.value",
           }
         }]
       ]);
     }

     static _deriveSource(uuid) {
       const source = super._deriveSource(uuid);

       if (game.wfrp4e.config.premiumModules[source.slug])
         source.value = game.wfrp4e.config.premiumModules[source.slug];

       return source;
     }

     async _preCreate(data, options, user)
     {
        await super._preCreate(data, options, user);

        if (!data.img || data.img == "icons/svg/item-bag.svg")
        {
            this.parent.updateSource({img : "systems/wfrp4e/icons/blank.png"});
        }
     }

    get skillToUse() {
        return this.getSkillToUse(this.parent.actor)
    }

    get isMagical() {
        return false;
    }

  /**
   * Sometimes a weapon isn't being used by its owning actor (namely: vehicles)
   * So the simple getter BaseItemModel#skillToUse isn't sufficient, we need to provide
   * an actor to use their skills instead
   * 
   * @abstract
   * @param {Object} actor Actor whose skills are being used
   */
    getSkillToUse(actor)
    {
        
    }


    async expandData(htmlOptions) {
        htmlOptions.async = true;
        const data = this.parent.toObject().system;
        data.properties = [];
        data.other = [];
        data.description.value = data.description.value || "";
        data.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.description.value, htmlOptions);
        data.manualScripts = this.parent.manualScripts;
        data.independentEffects = this.parent.testIndependentEffects
        return data;
      }

    /**
     * @abstract
     */
    chatData()
    {
        
    } 
 }