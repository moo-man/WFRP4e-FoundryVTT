import { CumulativeVehicleModifiers } from "./accumulated";

export class ManannMoodModel extends CumulativeVehicleModifiers {

    static key = "mood";
    static initialSources = "initialMoodSources";
    static chatRollLabel = "Manann's Mood Rolls";
    static chatNoModifierLabel = "No Active Mood Modifiers";


    async rollEvents(key)
    {
        let modifier = this.value;
        if (key == "port-stay-events")
        {
            modifier = this.value > 0 ? 1 : -1;
        }

        let result = await game.wfrp4e.tables.formatChatRoll(key, {modifier, showRoll : true});

        if (result)
        {
            ChatMessage.create({content : result, speaker : {alias : this.parent.parent.parent.name}, flavor : "Manann's Mood - " + game.wfrp4e.tables.findTable(key).name});
        }

    }
}