import AreaHelpers from "../system/area-helpers";

export default function() 
{
    Hooks.on("updateMeasuredTemplate", (template, data, options, user) => 
    {
        if (game.user.isUniqueGM && (data.x || data.y) && !data.flags?.wfrp4e?.preventRecursive)
        {
            AreaHelpers.checkAreas(template.parent);
        }
    });

    Hooks.on("createMeasuredTemplate", (template, options, user) => 
    {
        if (game.user.isUniqueGM)
        {
            AreaHelpers.checkAreas(template.parent);
            if (template.getFlag("wfrp4e", "instantaneous"))
            {
                // Perhaps a kludge of a solution, but it will be fine for now
                game.wfrp4e.utility.sleep(1000).then(() => {
                    game.wfrp4e.utility.log("Removing instantaneous effect after template placement");
                    template.setFlag("wfrp4e", "effectUuid", null)
                })
            }
        }
    });


    Hooks.on("deleteMeasuredTemplate", (template, options, user) => 
    {
        if (game.user.isUniqueGM)
        {
            AreaHelpers.checkAreas(template.parent);
        }
    });


}