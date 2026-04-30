onBootstrap((e) => {
  try {
    $app.findCollectionByNameOrId("guesses")
    // collection already exists, nothing to do
  } catch {
    const collection = new Collection({
      name: "guesses",
      type: "base",
      createRule: "",   // anyone can POST
      listRule: "",
      viewRule: "",
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
    $app.save(collection)
  }
  e.next()
})
