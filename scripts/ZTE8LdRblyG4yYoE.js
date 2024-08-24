if (args.test.result.castOutcome == "success")
{
    // Wait till after chat card is posted
    warhammer.utility.sleep(500).then(() => {
        game.wfrp4e.utility.postTerror(1, this.effect.name)
        game.wfrp4e.utility.postTerror(2, this.effect.name)
    })
}