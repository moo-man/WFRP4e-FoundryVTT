/**
 * Abstract class that interfaces with the Item class
 */
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
            description : fields.SchemaField({
                value: new fields.StringField()
            }),
            gmdescription : fields.SchemaField({
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

     async createChecks()
     {
         
     }

     // *** Updates *** 
     async preUpdateChecks(data)
     {
         return data;
     }
 
     async updateChecks()
     {
         if (this.parent.actor)
         {
             this.parent.actor.update(this.parent.actor.system.updateChecks({}, {}));
         }
 
         return {};
     }


     // *** Deletions ***
     async preDeleteChecks()
     {

     }

     async deleteChecks() 
     {

     }




 
     computeBase() 
     {

     }
 
     computeDerived() 
     {

     }
 
     computeOwnerDerived() 
     {
         
     }
 
     computeOwnerBase() 
     {

     }
 
     /**
      * 
      */
    //  effectIsApplicable(effect)
    //  {
    //      return !effect.disabled;
    //  }
 
    //  // If an item effect is disabled it should still transfer to the actor, so that it's visibly disabled
    //  shouldTransferEffect(effect)
    //  {
    //      return true;
    //  }
 
 }