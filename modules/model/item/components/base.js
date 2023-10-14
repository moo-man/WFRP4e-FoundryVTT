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
 
     preCreateData()//data) 
     {
         return {};
     }
 
     preUpdateChecks(data)
     {
         return data;
     }
 
     updateChecks()
     {
         if (this.parent.actor)
         {
             this.parent.actor.update(this.parent.actor.system.updateChecks({}, {}));
         }
 
         return {};
     }
 
     createChecks()
     {
         
     }
 
 
     computeBase() 
     {
         // for(let field in this)
         // {
         //     if (typeof this[field].compute == "function")
         //     {
         //         this[field].compute();
         //     }
         // }
     }
 
     computeDerived() 
     {
         // Abstract
     }
 
     computeOwnerDerived() 
     {
         
     }
 
     // computeOwnerBase() 
     // {
     //     // Abstract
     // }
 
     // computeOwnerDerived() 
     // {
     //     // Abstract
     // }
 
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
 
 
     summaryData()
     {

     }
 }