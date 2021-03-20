export default function() {
  /**
   * Set default values for new actors' tokens
   */
  Hooks.on("preCreateActor", (createData) => {

    // Set wounds, advantage, and display name visibility
    if (!createData.token)
      mergeObject(createData,
        {
          "token.bar1": { "attribute": "status.wounds" },                 // Default Bar 1 to Wounds
          "token.bar2": { "attribute": "status.advantage" },               // Default Bar 2 to Advantage
          "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display name to be on owner hover
          "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display bars to be on owner hover
          "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,         // Default disposition to neutral
          "token.name": createData.name                                       // Set token name to actor name
        })

    // Set custom default token
    if (!createData.img)
      createData.img = "systems/wfrp4e/tokens/unknown.png"

    // Default characters to HasVision = true and Link Data = true
    if (createData.type == "character") {
      createData.token.vision = true;
      createData.token.actorLink = true;
    }
    if (createData.type == "vehicle") {
      createData.img = "systems/wfrp4e/tokens/vehicle.png"
    }
  })


  // Treat the custom default token as a true default token
  // If you change the actor image from the default token, it will automatically set the same image to be the token image
  Hooks.on("preUpdateActor", (actor, updatedData) => {
    if (actor.data.token.img == "systems/wfrp4e/tokens/unknown.png" && updatedData.img) {
      updatedData["token.img"] = updatedData.img;
      actor.data.token.img = updatedData.img;
    }
    if (hasProperty(updatedData, "data.details.experience") && !hasProperty(updatedData, "data.details.experience.log"))
    {
      let actorData = duplicate(actor.data) // duplicate so we have old data during callback
      new Dialog({
        content : `<p>Reason for Exp change?</p><div class="form-group"><input name="reason" type="text" /></div>`,
        title : "Experience Change",
        buttons : {
          confirm : {
            label : "Confirm",
            callback : (dlg) => {
              let expLog = duplicate(actor.data.data.details.experience.log || []) 
              let newEntry = {reason : dlg.find('[name="reason"]').val()}
              if (hasProperty(updatedData, "data.details.experience.spent"))
              {
                newEntry.amount = updatedData.data.details.experience.spent - actorData.data.details.experience.spent 
                newEntry.spent = updatedData.data.details.experience.spent
                newEntry.total = actorData.data.details.experience.total
                newEntry.type = "spent"
              }
              if (hasProperty(updatedData, "data.details.experience.total"))
              {
                newEntry.amount = updatedData.data.details.experience.total - actorData.data.details.experience.total
                newEntry.spent = actorData.data.details.experience.spent
                newEntry.total = updatedData.data.details.experience.total
                newEntry.type = "total"
              }

              expLog.push(newEntry)
              actor.update({"data.details.experience.log" : expLog})
            }
          }
        },
        default: "confirm"
      }).render(true)
    }
  })
}