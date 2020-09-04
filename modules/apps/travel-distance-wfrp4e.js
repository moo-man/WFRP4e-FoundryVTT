import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP4E from "../system/config-wfrp4e.js"

/**
 * WIP
 * This class contains functions and helpers related to the market and Pay system
 */
export default class TravelDistanceWfrp4e {


    /**
    * This method load the travel data from the internal JSON file
    */
    static async loadTravelData() {
        FilePicker.browse("data", `systems/wfrp4e/modules/apps`).then(resp => {

        for (var file of resp.files) {
          try {
            if (!file.includes(".json"))
              continue
            let filename = file.substring(file.lastIndexOf("/") + 1, file.indexOf(".json"));

            fetch(file).then(r => r.json()).then(async records => {
                this.travel_data = records;
            })
          }
          catch (error) {
            console.error("Error reading " + file + ": " + error)
          }
        }
    });
  }

  /**
   * Returns a human-readable danger level for the road
  */
  static dangerToString( dangerLevel )
  {
    //console.log("DANGER !!!", dangerLevel);
    if ( dangerLevel == "") return game.i18n.localize("TRAVEL.DangerVeryLow");
    if ( dangerLevel == '!') return game.i18n.localize("TRAVEL.DangerLow");
    if ( dangerLevel == '!!') return game.i18n.localize("TRAVEL.DangerMedium");
    if ( dangerLevel == '!!!') return game.i18n.localize("TRAVEL.DangerHigh");
    return game.i18n.localize("TRAVEL.DangerVeryHigh");
  }

  /**
   * Returns either a decimal value or x.5 value
   * @param {Number} duration 
   * @returns new duration
   */
  static roundDuration( duration ) 
  {
    let trunc = Math.trunc(duration);
    let frac = duration - trunc;
    let adjust = 0;
    if ( frac > 0.75) adjust = 1;
    else if ( frac >= 0.25) adjust = 0.5;
    return trunc + adjust;
  }

    /**
    * This method either display the distances between 2 towns (ie when toTown is set) or display a list of destinations
    * @param {string} fromTown
    * @param {string} toTown
    * @returns 
    */
   static displayTravelDistance( fromTown, toTown ) {
    
    let message = "";

    //console.log("TRAVEL ...", fromTown, toTown );
    if ( toTown ) {
      fromTown = fromTown.toLowerCase();
      toTown = toTown.toLowerCase();
      for ( var travel of this.travel_data) {
        //console.log("    ", travel);
        if ( travel.from.toLowerCase() == fromTown && travel.to.toLowerCase() == toTown ) {
          message += `<p>${game.i18n.format("TRAVEL.TravelMessageBase", travel)}`;
          if ( travel.road_distance != "" ) {
            travel.road_horse_days = this.roundDuration( travel.road_days * 0.9);
            travel.road_feet_days  = this.roundDuration( travel.road_days * 1.2 );
            travel.road_danger_string = this.dangerToString( travel.road_danger );
            travel.road_danger_feet_string = this.dangerToString( travel.road_danger + "!" ); // Increase danger level by feet
            message += `${game.i18n.format("TRAVEL.TravelMessageRoad", travel)}`;                    
          }
          if ( travel.river_distance != "" ) {
            travel.river_danger_string = this.dangerToString( travel.river_danger );
            message += `${game.i18n.format("TRAVEL.TravelMessageRiver", travel)}`;                    
          }
          if ( travel.sea_distance != "" ) {
            travel.sea_danger_string = this.dangerToString( travel.sea_danger );
            message += `${game.i18n.format("TRAVEL.TravelMessageSea", travel)}`;                    
          }
          message += "</p>";
          //console.log("  Destination : ", travel.to );
        }
      }
    
    } else if ( fromTown && fromTown == "help") {
      message += `<p>${game.i18n.localize("TRAVEL.Helper")}</p>`;

    } else if ( fromTown) {
      fromTown = fromTown.toLowerCase();
      message += `<h3>${game.i18n.localize("TRAVEL.TownPrompt")}</h3>`
      for ( var travel of this.travel_data) {
        //console.log("    ", travel);
        if ( travel.from.toLowerCase() == fromTown ) {
          message += `<div><a class = "travel-click" data-fromtown="${travel.from}" data-totown = "${travel.to}"><i class="fas fa-list"></i> ${travel.to}</a></div>`
        }
      }
    } else {
      message += `<h3>${game.i18n.localize("TRAVEL.TownOriginPrompt")}</h3>`
      let uniqTown = {}
      for ( var travel of this.travel_data) {
        if ( uniqTown[travel.from] == undefined ) {
          uniqTown[travel.from] = 1; // Already added in the list
          message += `<div><a class = "travel-click" data-fromtown="${travel.from}"><i class="fas fa-list"></i> ${travel.from}</a></div>`
        }
      }
    }
    ChatMessage.create( WFRP_Utility.chatDataSetup( message ) );      
   }

   /**
    * 
    */
   static handleTravelClick( event ) {
    let fromTown = $(event.currentTarget).attr("data-fromtown");
    let toTown = $(event.currentTarget).attr("data-totown");
    TravelDistanceWfrp4e.displayTravelDistance( fromTown, toTown);
   }

}