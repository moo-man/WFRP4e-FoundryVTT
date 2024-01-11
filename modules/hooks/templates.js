import AreaHelpers from "../system/area-helpers";

export default function() 
{
    Hooks.on("updateMeasuredTemplate", (template, data, options, user) => 
    {
        if (game.user.id == user && (data.x || data.y))
        {
            AreaHelpers.checkAreas(template.parent)
        }
    });

    Hooks.on("createMeasuredTemplate", (template, options, user) => 
    {
        if (game.user.id == user)
        {
            AreaHelpers.checkAreas(template.parent)
        }
    });


    Hooks.on("deleteMeasuredTemplate", (template, options, user) => 
    {
        if (game.user.id == user)
        {
            AreaHelpers.checkAreas(template.parent, [template])
        }
    });


}