import { CumulativeVehicleModifiers } from "./accumulated";

export class ManannMoodModel extends CumulativeVehicleModifiers {

    static key = "mood";
    static initialSources = "initialMoodSources";
    static chatRollLabel = "VEHICLE.ManannsMoodRolls";
    static chatNoModifierLabel = "VEHICLE.NoManannsMoodModifiers";


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
            ChatMessage.create(ChatMessage.applyRollMode({content : result, speaker : {alias : this.parent.parent.parent.name}, flavor : game.i18n.localize("VEHICLE.ManannsMood") + " - " + game.wfrp4e.tables.findTable(key).name}, "gmroll"));
        }

    }
}