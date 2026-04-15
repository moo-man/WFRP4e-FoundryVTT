return !args.actor?.has(game.i18n.localize("NAME.Swarm")) ||
    ![game.wfrp4e.config.actorSizeNums.tiny, game.wfrp4e.config.actorSizeNums.ltl]
      .includes(args.actor?.sizeNum)