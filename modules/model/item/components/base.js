let fields = foundry.data.fields;

 export class BaseItemModel extends foundry.abstract.DataModel 
 {
 
    //  allowedConditions = [];  // What condition effects can exist on the item
    //  allowedEffectApplications = Object.keys(game.wfrp4e.config.effectApplications);
    //  effectApplicationOptions = {};
 
 
     get id () 
     {
         return this.parent.id;
     }
 
     static defineSchema() 
     {
        return {
            description : new fields.SchemaField({
                value: new fields.StringField()
            }),
            gmdescription : new fields.SchemaField({
                value: new fields.StringField()
            }),
        } 
     }
 
     allowCreation()
     {
         if (this.parent.actor)
         {
             return this.parent.actor.system.itemIsAllowed(this.parent);
         }
         else 
         {
             return true;
         }
     }
 

     // *** Creation ***
     async preCreateData(data, options, user)
     {
        let preCreateData = {};
        if (!data.img || data.img == "icons/svg/item-bag.svg")
            preCreateData.img = "systems/wfrp4e/icons/blank.png";

        return preCreateData;
     }

     createChecks(data, options, user)
     {
         
     }

     // *** Updates *** 
     async preUpdateChecks(data, options, user)
     {

     }
 
     updateChecks(data, options, user)
     {
        
     }


     // *** Deletions ***
     async preDeleteChecks(options, user)
     {

     }

     deleteChecks(options, user)
     {

     }




 
    /**
      * @abstract
      */
     computeBase() 
     {

     }
 
    /**
      * @abstract
      */
     computeDerived() 
     {

     }

     /**
      * @abstract
      */
     computeOwned()
     {
     }

     getOtherEffects()
     {
         return [];
     }

    get skillToUse() {
        return this.getSkillToUse(this.parent.actor)
    }

    get isMagical() {
        return false;
    }

    // These effects don't need to be posted to chat via a test to be applied
    get testIndependentEffects()
    {
        return this.parent.targetEffects.concat(this.parent.areaEffects).filter(e => e.testIndependent);
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
        data.description.value = await TextEditor.enrichHTML(data.description.value, htmlOptions);
        data.manualScripts = this.parent.manualScripts;
        data.independentEffects = this.testIndependentEffects
        return data;
      }

    /**
     * @abstract
     */
    chatData()
    {
        
    }
 
    //  computeOwnerDerived() 
    //  {
         
    //  }
 
    //  computeOwnerBase() 
    //  {

    //  }
 
     /**
      * 
      */
    //  effectIsApplicable(effect)
    //  {
    //      return !effect.disabled;
    //  }
 
     // If an item effect is disabled it should still transfer to the actor, so that it's visibly disabled
     shouldTransferEffect(effect)
     {
         return true;
     }
 
 }