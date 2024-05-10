import WFRP_Utility from "../../../../system/utility-wfrp4e";

let fields = foundry.data.fields;

export class VehiclePassengersModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.list = new fields.ArrayField(new fields.SchemaField({
            id : new fields.StringField(),
            count : new fields.NumberField(),
            roleIds : new fields.ArrayField(new fields.DocumentIdField())
        }));
        return schema;
    }

    compute(roles)
    {
        this.list.forEach(passenger => {
            let actor = game.actors.get(passenger?.id);
            if (actor)
            {
                passenger.actor = actor,
                passenger.linked = actor.prototypeToken.actorLink,
                passenger.img = WFRP_Utility.replacePopoutPath(actor.prototypeToken.texture.src),
                passenger.enc = game.wfrp4e.config.actorSizeEncumbrance[actor.details.size.value] * passenger.count
                passenger.roles = passenger.roleIds.map(id => roles.find(r => r.id == id)).filter(i => i);
            }
            else 
            {
                passenger.notFound = true;
                passenger.img = "systems/wfrp4e/tokens/unknown.png"
            }
        })
        roles.forEach(r => r.system.assignments = this.list.filter(passenger => passenger.roleIds.includes(r.id)));
    }

    add(actor)
    {
        return this.list.concat({id : actor.id, count : 1});
    }

    remove(id)
    {
        return this.list.filter(i => i.id == id);
    }

    edit(id, data)
    {
        let list = foundry.utils.deepClone(this.list);
        let passenger = list.find(i => i.id == id);
        if (passenger)
        {
            mergeData(passenger, data);
        }
        return list;
    }

    count(id, value=1)
    {
        let list = foundry.utils.deepClone(this.list);
        let passenger = list.find(i => i.id == id);
        passenger.count += value;
        return list
    }

    addRole(id, role)
    {
        if (role instanceof Item)
        {
            role = role.id;
        }

        let list = foundry.utils.deepClone(this.list);
        let passenger = list.find(i => i.id == id);
        if (!passenger.roleIds.includes(role));
        {
            passenger.roleIds.push(role);
        }
        return list
    }

    removeRole(id, role)
    {
        if (role instanceof Item)
        {
            role = role.id;
        }

        let list = foundry.utils.deepClone(this.list);
        let passenger = list.find(i => i.id == id);
        passenger.roleIds = passenger.roleIds.filter(i => i != role)
        return list
    }

}