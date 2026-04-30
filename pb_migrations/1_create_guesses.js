/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "guesses",
    createRule: "",   // anyone can POST
    listRule:   "",   // readable for server-side aggregate (PocketBase not publicly exposed)
    viewRule:   "",
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "mode",        type: "text",   required: true },
      { name: "date",        type: "text",   required: true },
      { name: "card_id",     type: "text",   required: true },
      { name: "guess_count", type: "number", required: true },
      { name: "solved",      type: "bool" },
    ],
  })
  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("guesses")
  app.delete(collection)
})
