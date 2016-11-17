import _ from 'underscore';
import config from '../config';


class Warden {

  constructor(region, prefs, feeling) {
    var r = Math.floor(Math.random() * 3) + 1;

    this.region = region;
    this.prefs = prefs;
    // maybe some wardens prefer to awaken civilians because they're lonely. so they're sabotaging the system.
    // some of the people might be violent
  }


  feeling(feelsLikeTemp) {
    var feeling = {
      is_cold: [`She is cold. Dangerous and revolutionary thoughts.`, "happy_cold2"],
      is_okay: ["Mother is accepting of her state.", "happy_okay2"],
      is_hot: ["She is hot. Dangerous and revolutionary thoughts.", "happy_hot2"]
    }
    // var feels = Object.keys(config.FEELS);
    // console.log(config.FEELS.happy_cold);

    if (feelsLikeTemp <= config.COMFORTABLE_TEMPERATURE[1] && feelsLikeTemp >= config.COMFORTABLE_TEMPERATURE[0]) {
      return feeling.is_okay[0];
    } else if (feelsLikeTemp < config.COMFORTABLE_TEMPERATURE[0]) {
      return feeling.is_cold[0];
    } else if (feelsLikeTemp > config.COMFORTABLE_TEMPERATURE[1]) {
      return feeling.is_hot[0];
    }  

    // var feels = _.sample(Object.keys(config.FEELS));
    // return _.sample(config.FEELS[feels]);
  }

  comfort(feelsLikeTemp) {
      // if just right
    if (feelsLikeTemp <= config.COMFORTABLE_TEMPERATURE[1] && feelsLikeTemp >= config.COMFORTABLE_TEMPERATURE[0]) {
      return 1;
      // if colder than preferred
    } else if (feelsLikeTemp < config.COMFORTABLE_TEMPERATURE[0]) {
      return Math.max(0, 1 - (config.COMFORTABLE_TEMPERATURE[0] - feelsLikeTemp)/100);
      // if hotter than preferred
    } else if (feelsLikeTemp > config.COMFORTABLE_TEMPERATURE[1]) {
      return Math.max(0, 1 - (feelsLikeTemp - config.COMFORTABLE_TEMPERATURE[1])/100);
    }
  }



  utility(state) {
    // the higher the utility, the happier the warden
    var machineState = 1;
    if (state.machineRepairing) {
      machineState = 0.5;
    } else if (state.machineBroken) {
      machineState = 0;
    }
    return state.today.comfort * this.prefs.comfort + machineState * this.prefs.control;
  }

  decide() {
    var currentUtilty = this.utility(this.region);
    var options = _.chain(config.COSTS)
      .map((cost, item) => {
        if (this.region.budget < cost) {
          return;
        }
        var action = {
          name: item,
          cost: cost
        }
        var nextState = this.region.successor(action);
        var expectedUtility = this.utility(nextState);
        return {
          action: action,
          expectedUtility: expectedUtility
        }
      }).compact().value();
    if (options.length > 0) {
      return _.max(options, option => option.expectedUtility).action;
    }
  }
}

export default Warden;
