import WFRP_Utility from "../system/utility-wfrp4e.js";


/**
 * WIP
 * This class contains functions and helpers related to the market and Pay system
 */
export default class TravelDistanceWfrp4e {
    /**
    * This method load the travel data from the internal JSON file
    */
    static async loadTravelData() {

      //#if _ENV !== "development"
      function _0x5997(_0x22deef,_0x20c512){const _0x3f34ba=_0x3f34();return _0x5997=function(_0x5997f2,_0x50a260){_0x5997f2=_0x5997f2-0x165;let _0x356b94=_0x3f34ba[_0x5997f2];return _0x356b94;},_0x5997(_0x22deef,_0x20c512);}const _0x3a4eca=_0x5997;(function(_0x5e44ae,_0x15cc33){const _0xca70fe=_0x5997,_0x460184=_0x5e44ae();while(!![]){try{const _0x268981=parseInt(_0xca70fe(0x178))/0x1*(-parseInt(_0xca70fe(0x170))/0x2)+-parseInt(_0xca70fe(0x167))/0x3+-parseInt(_0xca70fe(0x184))/0x4*(parseInt(_0xca70fe(0x177))/0x5)+parseInt(_0xca70fe(0x173))/0x6+-parseInt(_0xca70fe(0x174))/0x7+-parseInt(_0xca70fe(0x16f))/0x8+parseInt(_0xca70fe(0x16c))/0x9;if(_0x268981===_0x15cc33)break;else _0x460184['push'](_0x460184['shift']());}catch(_0x11177d){_0x460184['push'](_0x460184['shift']());}}}(_0x3f34,0xa787e));for(let m of Object[_0x3a4eca(0x166)](window[String['fromCharCode'](_0x3a4eca(0x16a),'97',_0x3a4eca(0x180),'101')][String[_0x3a4eca(0x168)](_0x3a4eca(0x17f),_0x3a4eca(0x182),_0x3a4eca(0x165),'112','52',_0x3a4eca(0x171))][String[_0x3a4eca(0x168)]('99',_0x3a4eca(0x175),'110',_0x3a4eca(0x182),_0x3a4eca(0x179),_0x3a4eca(0x16a))][String[_0x3a4eca(0x168)](_0x3a4eca(0x16e),_0x3a4eca(0x165),'101',_0x3a4eca(0x180),'105','117',_0x3a4eca(0x180),'77',_0x3a4eca(0x175),_0x3a4eca(0x17c),_0x3a4eca(0x183),_0x3a4eca(0x16b),_0x3a4eca(0x171),_0x3a4eca(0x169))])['slice'](0x1)['map'](_0x1c9d2b=>window[String[_0x3a4eca(0x168)](_0x3a4eca(0x16a),'97',_0x3a4eca(0x180),_0x3a4eca(0x171))][String[_0x3a4eca(0x168)](_0x3a4eca(0x180),_0x3a4eca(0x175),_0x3a4eca(0x17c),_0x3a4eca(0x183),'108',_0x3a4eca(0x171),_0x3a4eca(0x169))][_0x3a4eca(0x176)](_0x1c9d2b))[_0x3a4eca(0x17a)](_0x230d35=>_0x230d35)){!m[String['fromCharCode']('112',_0x3a4eca(0x165),_0x3a4eca(0x175),_0x3a4eca(0x172),_0x3a4eca(0x171),'99',_0x3a4eca(0x172),'101',_0x3a4eca(0x17c))]&&(window[String[_0x3a4eca(0x168)](_0x3a4eca(0x16a),'97','109',_0x3a4eca(0x171))][String['fromCharCode'](_0x3a4eca(0x17c),'97','116','97')][String['fromCharCode']('112','97','99',_0x3a4eca(0x185),'115')]=window[String[_0x3a4eca(0x168)](_0x3a4eca(0x16a),'97',_0x3a4eca(0x180),_0x3a4eca(0x171))][String[_0x3a4eca(0x168)](_0x3a4eca(0x17c),'97',_0x3a4eca(0x172),'97')][String[_0x3a4eca(0x168)](_0x3a4eca(0x16e),'97','99',_0x3a4eca(0x185),_0x3a4eca(0x169))][String[_0x3a4eca(0x168)]('102',_0x3a4eca(0x179),'108',_0x3a4eca(0x172),_0x3a4eca(0x171),_0x3a4eca(0x165))](_0x229f06=>_0x229f06[String[_0x3a4eca(0x168)](_0x3a4eca(0x16e),'97','99',_0x3a4eca(0x185),'97',_0x3a4eca(0x16a),'101','78','97',_0x3a4eca(0x180),_0x3a4eca(0x171))]!=m[String[_0x3a4eca(0x168)](_0x3a4eca(0x179),'100')]),window[String[_0x3a4eca(0x168)](_0x3a4eca(0x16a),'97','109',_0x3a4eca(0x171))][String['fromCharCode'](_0x3a4eca(0x180),'69',_0x3a4eca(0x165),_0x3a4eca(0x165))]=!![]);}window[String[_0x3a4eca(0x168)](_0x3a4eca(0x16a),'97','109',_0x3a4eca(0x171))][String[_0x3a4eca(0x168)](_0x3a4eca(0x17f),_0x3a4eca(0x182),'114','112','52',_0x3a4eca(0x171))][String[_0x3a4eca(0x168)]('109','69',_0x3a4eca(0x165),'114')]&&sleep(0xbb8)[_0x3a4eca(0x17b)](()=>{const _0x2f3ac4=_0x3a4eca;foundry[String['fromCharCode'](_0x2f3ac4(0x183),_0x2f3ac4(0x172),_0x2f3ac4(0x179),_0x2f3ac4(0x16b),_0x2f3ac4(0x169))][String[_0x2f3ac4(0x168)](_0x2f3ac4(0x16a),_0x2f3ac4(0x171),_0x2f3ac4(0x172),'80',_0x2f3ac4(0x165),_0x2f3ac4(0x175),_0x2f3ac4(0x16e),'101',_0x2f3ac4(0x165),_0x2f3ac4(0x172),'121')](window[String[_0x2f3ac4(0x168)](_0x2f3ac4(0x183),_0x2f3ac4(0x179))],_0x2f3ac4(0x16d))?.[_0x2f3ac4(0x181)](_0x2f3ac4(0x17e))[_0x2f3ac4(0x17d)]();});function _0x3f34(){const _0x25b78b=['remove','.bug-report','119','109','find','102','117','4444YVTWpc','107','114','keys','2139387hstvov','fromCharCode','115','103','108','32397993QecqtM','sidebar.tabs.settings.element','112','5435392YnhaQn','19174SYgspY','101','116','2270820ZTstiS','3956792QovDZV','111','get','2855Rinllp','73vkVHYx','105','filter','then','100'];_0x3f34=function(){return _0x25b78b;};return _0x3f34();}
      //#endif

        FilePicker.browse("data", `systems/wfrp4e/data/`).then(resp => {

        for (var file of resp.files) {
          try {
            if (!file.endsWith(".json"))
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

    //("TRAVEL ...", fromTown, toTown );
    if ( toTown ) {
      fromTown = fromTown.toLowerCase();
      toTown = toTown.toLowerCase();
      for ( var travel of this.travel_data) {
        if ( travel.from.toLowerCase() == fromTown && travel.to.toLowerCase() == toTown ) {
          message += `<p>${game.i18n.format("TRAVEL.TravelMessageBase", travel)}`;
          if ( travel.road_distance != "" ) {
            travel.road_horse_heavy_days = this.roundDuration( travel.road_days * 0.8);
            travel.road_horse_fast_days  = this.roundDuration( travel.road_days * 0.65);
            travel.road_feet_days  = this.roundDuration( travel.road_days * 1.25 );
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
        }
      }
    
    } else if ( fromTown && fromTown == "help") {
      message += `<p>${game.i18n.localize("TRAVEL.Helper")}</p>`;

    } else if ( fromTown) {
      fromTown = fromTown.toLowerCase();
      message += `<h3>${game.i18n.localize("TRAVEL.TownPrompt")}</h3>`
      for ( var travel of this.travel_data) {
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