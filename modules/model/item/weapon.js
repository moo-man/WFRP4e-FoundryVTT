import { PropertiesItemModel } from "./components/properties";

let fields = foundry.data.fields;

export class WeaponModel extends PropertiesItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.damage = new fields.EmbeddedDataField(DamageModel);
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        schema.ammo = new fields.EmbeddedDataField(DocumentReferenceModel);
        schema.ammoCost = new fields.NumberField();
        schema.attackType = new fields.StringField();
        schema.category = new fields.StringField();
        schema.spec = new fields.StringField();
        schema.range = new fields.StringField();
        schema.mag = new fields.SchemaField({
            value : new fields.NumberField({min: 0, integer: true, initial : 1}),
            current : new fields.NumberField({min: 0, integer : true, initial: 0})
        });
        schema.mods = new fields.EmbeddedDataField(ModListModel);
        return schema;
    }


    preUpdateChecks(data)
    {
        super.preUpdateChecks(data);
    }

    updateChecks(updateData)
    {
        let data = super.updateChecks();
        return data;
    }

    computeBase() 
    {
        super.computeBase();
     
    }

    computeOwnerDerived(actor) 
    {
    
    }


    getSkill(actor)
    {

    }

    get ammoList()
    {
       
    }

    // Might be renamed, means "uses own quantity for ammo"
    get selfAmmo()
    {
    }

    /**
     * 
     * @param {Boolean} trackAmmo Whether or not to check the quantity of the ammo item linked to the weapon
     * @returns 
     */
    reload(trackAmmo=true) 
    {
    
    }

    useAmmo(amount = 1)
    {

      
    }

    hasAmmo()
    {
      
    }


    _applyAmmoMods() 
    {

    }

    get isMelee()
    {
    }

    get isRanged()
    {
    }
}