import AttackDialog5e from "./attack-dialog5e";
import CharacteristicDialog5e from "./characteristic-dialog5e";

export default class TraitDialog5e extends AttackDialog5e
{
    get item()
    {
      return this.data.trait
    }

    get trait() 
    {
      return this.item;
    }

    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/5e/default-fields.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
          template : "systems/wfrp4e/templates/dialog/type/5e/attack-dialog.hbs",
      },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static async setupData(trait, actor, context={}, options={})
    {
      let skill
      let characteristic = trait.system.rollable.characteristic;
      if (!characteristic)
      {
        characteristic = trait.system.rollable.attackType == "melee" ? "ws" : "bs";
      }
      if (trait.system.rollable.skill)
      {
        skill = actor.itemTags["skill"].find(sk => sk.name == trait.system.rollable.skill)
        if (!skill)
          {
            skill = {
              name : trait.system.rollable.skill,
              id : "unknown",
              system : {
                characteristic : {
                  value : ""
                }
              }
            }
          }
      }
      
      context.appendTitle = ` - ${trait.name}`;

      let dialogData

      if (skill)
      {
        dialogData = await super.setupData(skill, actor, context, options)
      }
      else 
      {
        dialogData = await CharacteristicDialog5e.setupData(characteristic, actor, context, options)
      }
      
      let data = dialogData.data;
      data.trait = trait;
      data.item = trait;
      data.hitloc = true;

      data.scripts = data.scripts.concat(data.trait?.getScripts("dialog").filter(s => !s.options.defending) || [])
      dialogData.fields.damage = trait.system.Damage;


      if (trait.system.rollable.attackType == "ranged") 
      {
        dialogData.fields.range = "normal"; // TODO
      }

      context.messageTemplate = "systems/wfrp4e/templates/chat/roll/5e/trait-test.hbs";

      return dialogData;
    }


    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
    }

    computeFields()
    {
        super.computeFields();
    }

    _computeDefending(attacker) 
    {
        super._computeDefending(attacker);
    }

    _computeTargets(target)
    {

    }
}