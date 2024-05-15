import { CumulativeVehicleModifiers } from "./accumulated";

export class ManannMoodModel extends CumulativeVehicleModifiers {

    static key = "mood";
    static initialSources = "initialMoodSources";
    static chatRollLabel = "Manann's Mood Rolls";
    static chatNoModifierLabel = "No Active Mood Modifiers";
}