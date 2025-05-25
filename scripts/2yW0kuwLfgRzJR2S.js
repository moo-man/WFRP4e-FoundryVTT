const duration = 3600 * (1 + Number(this.effect.sourceTest.result.SL));
this.effect.update({"duration.seconds": duration});