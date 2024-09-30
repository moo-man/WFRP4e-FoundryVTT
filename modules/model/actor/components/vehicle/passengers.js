import WFRP_Utility from "../../../../system/utility-wfrp4e";

let fields = foundry.data.fields;

export class VehiclePassengersModel extends ListModel {

    static listSchema = new fields.SchemaField({
        id : new fields.StringField(),
        count : new fields.NumberField({min : 0}),
        roleIds : new fields.ArrayField(new fields.DocumentIdField())
    })

    compute(roles)
    {
        this.list.forEach(passenger => {
            let actor = game.actors.get(passenger?.id);
            if (actor)
            {
                passenger.actor = actor,
                passenger.linked = actor.prototypeToken.actorLink,
                passenger.img = warhammer.utility.replacePopoutPath(actor.prototypeToken.texture.src),
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

    async choose(roles=[], filter)
    {
        if (typeof roles == "string")
        {
            roles = [roles]
        }
        let passengers = this.list.filter(i => i.actor?.isOwner);
        if (roles.length)
        {
            passengers = passengers.filter(passenger => passenger.roles.some(role => roles.includes(role.name)))
        }
        if (filter)
        {
            passengers = passengers.filter(filter);
        }
        
        if (passengers.length == 0)
        {
            ui.notifications.error("ERROR.NoAvailableActors", {localize: true})
            return
        }

        if (passengers.length == 1)
        {
            return passengers[0].actor;    
        }

        return (await ItemDialog.create(passengers.map(i => i.actor), 1, game.i18n.localize("DIALOG.ChooseActor")))[0]

    }

    has(actor)
    {
        return this.list.find(i => i.id == actor.id);
    }

    get (id)
    {
        return this.list.find(i => i.id == id);
    }

    add(actor)
    {
        return {[this.schema.fields.list.fieldPath] : this.list.concat({id : actor.id, count : 1})};
    }

    remove(id)
    {
        return {[this.schema.fields.list.fieldPath] : this.list.filter(i => i.id != id)};
    }

    edit(id, data)
    {
        let list = foundry.utils.deepClone(this.list);
        let passenger = list.find(i => i.id == id);
        if (passenger)
        {
            foundry.utils.mergeObject(passenger, data);
        }
        return {[this.schema.fields.list.fieldPath] : list};
    }

    count(id, value=1)
    {
        let list = foundry.utils.deepClone(this.list);
        let passenger = list.find(i => i.id == id);
        passenger.count += value;
        return {[this.schema.fields.list.fieldPath] : list}
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
        return {[this.schema.fields.list.fieldPath] : list}
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
        return {[this.schema.fields.list.fieldPath] : list}
    }

}