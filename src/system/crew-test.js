export default class CrewTest 
{
    constructor(item) {
        this.item = item;
        this.messageId = foundry.utils.randomID()
        this.roles = this.initializeRoles()

    }

    static fromData(data)
    {
        let test = new this(fromUuidSync(data.uuid));
        test.messageId = data.messageId;
        test.roles = data.roles;
        return test;
    }

    toData()
    {
        return {
            uuid : this.item.uuid,
            messageId : this.messageId,
            roles : this.roles
        }
    }

    initializeRoles()
    {
        let roles = {}
        let actor = this.item.actor

        for(let role of this.item.system.roles.value.split(",").map(i => i.trim()))
        {
            let roleItem = actor.itemTypes.vehicleRole.find(i => i.name == role);

            if (roleItem)
            {
                roles[roleItem.id] = {
                    name : role,
                    messageId : null
                }
            }
            else 
            {
                // Won't be found
                roles[foundry.utils.randomID()] = {
                    name : role,
                    unknown : true
                }
            }
        }
        return roles;
    }


    updateRole(roleId, message)
    {
        if (this.roles[roleId])
        {
            this.roles[roleId].messageId = message._id
        }
        this.renderChatPrompt()
    }

    get totalSL()
    {
        if (Object.values(this.roles).some(i => !i.messageId))
        {
            return "???"
        }

        let tests = Object.values(this.roles).map(i => game.messages.get(i.messageId)?.system.test).filter(i => i)

        let SL = tests.reduce((SL, test) => SL + test.result.crewTestSL, 0);

        return SL;
    }
    

    renderChatPrompt()
    {
        let actor = this.item.actor
        if (!actor)
        {
            throw Error("Must be owned by an Actor to prompt a Crew Test")
        }

                
        let crew = actor.system.crew;
        let html = ""
        for(let id in this.roles)
        {
            let roleHTML = "";
            let roleData = this.roles[id];
            let role = roleData.name;
            let roleItem = actor.items.get(id)
            let crewWithRole = crew.filter(c => c.roles.find(i => i.name == role))
            if (roleItem)
            {

                let isVital = roleItem.system.isVitalFor(this.item);
                roleHTML += `<strong>${role}</strong>`
                if (isVital)
                {roleHTML
                    roleHTML = `<em>${roleHTML}</em>`;
                }
                
                if (crewWithRole.length > 0)
                {
                    roleHTML = `<p>${roleHTML}: ${crewWithRole.map(c => c.actor.name).join(", ")}</p>`
                }
                else 
                {
                    roleHTML = `<p>${roleHTML}: ${game.i18n.localize("CHAT.NoCrewWithRole")}</p>`
                }
                roleHTML += `<a class="chat-button" data-action="crewTest" data-vital="${isVital}" data-uuid="${roleItem.uuid}">${roleItem.system.test} ${roleData.messageId ? '<i class="fa-solid fa-check"></i>' : ""}</a>`
            }
            else 
            {
                roleHTML += `${game.i18n.format("CHAT.RoleNotFound", {role})}`
            }
            html += roleHTML + "<hr>";
        }

        html += `<h3 style='border: none'>${game.i18n.localize("CHAT.TotalSL")}: <span class='sl-total'>${this.totalSL}</span></h3>`


        let chatData = {
            _id : this.messageId,
            content : `
                <h3>${this.item.name}</h3>
                ${html}
            `,
            speaker : {
                alias : actor?.name,
            },
            flavor : game.i18n.localize("CHAT.CrewTest"),
            flags : {
                wfrp4e : {
                    crewTestData : this.toData()
                }
            }
        }


        if (this.message)
        {
            this.message.update(chatData)
        }
        else 
        {
            ChatMessage.create(chatData, {keepId: true})
        }
    }

    get message()
    {
        return game.messages.get(this.messageId);
    }
}