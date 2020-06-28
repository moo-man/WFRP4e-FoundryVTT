/**
 * Searches each message and adds drag and drop functionality and hides certain things from players
 */

Hooks.on("renderChatMessage", async (app, html, msg) => {
  
  // Hide test data from players (35 vs 50) so they don't know the enemy stats
  if (game.settings.get("wfrp4e", "hideTestData") && !game.user.isGM && html.find(".chat-card").attr("data-hide") === "true")
  {
    html.find(".hide-option").remove();
  }
  // Hide chat card edit buttons from non-gms
  if (!game.user.isGM)
  {
    html.find(".chat-button-gm").remove();
    html.find(".unopposed-button").remove();
    //hide tooltip contextuamneu if not their roll
    if(msg.message.speaker.actor && game.actors.get(msg.message.speaker.actor).permission != 3)
      html.find(".chat-button-player").remove();
  }
  else
  {
    html.find(".chat-button-player").remove();
  }

  // Do not display "Blind" chat cards to non-gm
  if (html.hasClass("blind") && !game.user.isGM)
  {
    html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
    html.html("").css("display", "none");
  }

  // Add drag and drop functonality to posted items
  let postedItem = html.find(".post-item")[0]
  if (postedItem)
  {
    postedItem.setAttribute("draggable", true);

    postedItem.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData("text/plain", app.data.flags.transfer);
    })
  }

  // Add drag and drop to character generation results
  let woundsHealed = html.find(".wounds-healed-drag")[0]
  if (woundsHealed)
  {
    woundsHealed.setAttribute("draggable", true);
    woundsHealed.addEventListener('dragstart', ev => {
      let dataTransfer = {
        woundsHealed : app.data.flags.data.postData.woundsHealed
      }
      ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
    })
  }

  // Add drag and drop to character generation results
  let generation = html.find(".char-gen")[0]
  if (generation)
  {
    generation.setAttribute("draggable", true);
    generation.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData("text/plain", app.data.flags.transfer);
    })
  }

  // Add drag and drop to skills in chat
  html.find(".skill-drag").each(function() {
  let skill = $(this)[0]
  skill.setAttribute("draggable", true)
  skill.addEventListener('dragstart', ev => {
      let dataTransfer = {
        name : ev.target.text,
        lookupType : "skill"
      }
      ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
    })
  })

  // Add drag and drop to talents in chat
  html.find(".talent-drag").each(function() {
    let talent = $(this)[0]
    talent.setAttribute("draggable", true)
    talent.addEventListener('dragstart', ev => {
        let dataTransfer = {
          name : ev.target.text,
          lookupType : "talent"
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    })


  // Add drag and drop to exp markers in character generation
  html.find(".exp-drag").each(function() {
    let exp = $(this)[0]
    exp.setAttribute("draggable", true)
    exp.addEventListener('dragstart', ev => {
        let dataTransfer = {
          exp : parseInt($(exp).attr("data-exp"))
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    })

    // Add drag and drop to money from income rolls
    html.find(".money-drag").each(function() {
      let amount = $(this)[0]
      amount.setAttribute("draggable", true)
      amount.addEventListener('dragstart', ev => {
          let dataTransfer = {
            money : $(amount).attr("data-amt")
          }
          ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
        })
      })

})