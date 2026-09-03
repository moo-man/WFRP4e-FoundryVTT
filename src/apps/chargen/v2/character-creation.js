import { AttributesStage } from "./stage-attributes";
import { CareerStage } from "./stage-career";
import { SkillsTalentsStage } from "./stage-skills-talents";
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
        this.addStage("career", CareerStage, {dependsOn: ["species"], title: "Career"});
        this.addStage("attributes", AttributesStage, {dependsOn: ["career"], title: "Attributes"});
        this.addStage("skills-talents", SkillsTalentsStage, {dependsOn: ["career", "species"], title: "Skills & Talents"});
        this.addStage("trappings", "a", {dependsOn: ["career"], title: "Trappings"});
        this.addStage("details", "a", {dependsOn: ["species"], title: "Details"});
    }

    _prepareStagesContext(context)
    {
        context.stages = this.stages;
        return context;
    }

    getArgsForStage(stageId)
    {
        if (stageId == "career")
        {
            return this.stageResults.species.items[0];
        }
        if (stageId == "attributes")
        {
            return {species: this.stageResults.species.items[0], career: this.stageResults.career.items[0]}
        }

        if (stageId == "skills-talents")
        {
            return {species: this.stageResults.species.items[0], career: this.stageResults.career.items[0]}
        }
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.buttons = [{ type: "submit", label: "Submit Stage" }];

        return context;
    }

}
    Hooks.on("ready", () => {
        new WFRP4eCharacterCreation().render({force: true});
    });





