if (args.test.result.hitloc.value != "head" && args.test.result.critical)
{
	warhammer.utility.sleep(200).then(() => {
		this.script.message("Can roll on the @Table[crithead]{Head Critical Hits} instead of the normal hit location")

	})
}