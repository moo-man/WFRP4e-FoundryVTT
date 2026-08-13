import { SpeciesStage } from "./stage-species";

export class WFRP4eCharacterCreation extends StagedCharacterCreation
{

    static DEFAULT_OPTIONS = 
        {
            tag: "form",
            classes : ["wfrp4e"],
            position : {

            },
        };
    
    static PARTS = {
        stages : {template : "systems/wfrp4e/templates/apps/chargen/v2/stages.hbs"},
        active : {template : "systems/wfrp4e/templates/apps/chargen/v2/active.hbs", classes:["active-stage"]},
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    _setupStages()
    {
        this.addStage("species", SpeciesStage, {dependsOn: [], title: "Species"});
        this.addStage("career", "a", {dependsOn: ["species"], title: "Career"});
        this.addStage("attributes", "a", {dependsOn: ["career"], title: "Attributes"});
        this.addStage("skills-talents", "a", {dependsOn: ["career"], title: "Skills & Talents"});
        this.addStage("trappings", "a", {dependsOn: ["career"], title: "Trappings"});
        this.addStage("details", "a", {dependsOn: ["species"], title: "Details"});
    }

    _prepareStagesContext(context)
    {
        context.stages = this.stages;
        return context;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
    }

}
    Hooks.on("ready", () => {
        new WFRP4eCharacterCreation().render({force: true});
    });





