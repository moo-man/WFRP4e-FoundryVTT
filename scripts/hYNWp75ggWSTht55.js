if (args.test.result.hitloc.value != "head" && args.test.result.critical)
{
	game.wfrp4e.utility.sleep(200).then(() => {
		this.script.scriptMessage("Can roll on the @Table[crithead]{Head Critical Hits} instead of the normal hit location")

	})
}