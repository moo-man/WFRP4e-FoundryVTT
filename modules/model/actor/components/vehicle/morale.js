import { CumulativeVehicleModifiers } from "./accumulated";

export class MoraleModel extends CumulativeVehicleModifiers {

    static key = "morale";
    static initialSources = "initialMoraleSources";
    static chatRollLabel = "Morale Rolls";
    static chatNoModifierLabel = "No Active Morale Modifiers";
    static starting = 75;
}