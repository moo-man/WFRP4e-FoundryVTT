import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {

  Hooks.on("preCreateScene", (document, data, options) => {
    if (data._id)
      options.keepId = WFRP_Utility._keepID(data._id, document)
  })
}
