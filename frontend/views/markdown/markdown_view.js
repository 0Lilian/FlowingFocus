const markdown_view = (function () {

    // Create the MarkdownView class
    class MarkdownView extends View {

        generateContent () {

            return new Promise((resolve, reject) => {

                try {

                    // Clone the clutter_free body.
                    let cloned_clutter_free_body = View.getViewById("clutter-free-view").body.cloneNode(true)

                    // Apply fixers.
                    for (const fixer of markdown_fixers) {
                        cloned_clutter_free_body = fixer.fix(cloned_clutter_free_body)
                    }

                    // Convert the cloned body in markdown.
                    const turndownService = new TurndownService({
                        headingStyle: 'atx',
                        hr: '---',
                        bulletListMarker: '-',
                        codeBlockStyle: 'fenced',
                        emDelimiter: '*',
                        preformattedCode: true,
                    });

                    // Apply extractors.
                    for (const extractor of markdown_extractors) {
                        turndownService = extractor.applyRuleTo(turndownService)
                    }

                    this.body.innerHTML = "<pre>" + turndownService.turndown(cloned_clutter_free_body.innerHTML)+ "</pre>";

                    // Resolve the promise.
                    resolve()
                }
                catch (error) {
                    reject("An error occured while generating content of view " + view.id + ". Error : " + error)
                }
            })
        }
    }

    // Instanciate the MarkdownView class and return the instance
    return new MarkdownView(id="markdown-view",
                            display_name="Markdown",
                            icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h16V5H4zm3 10.5H5v-7h2l2 2 2-2h2v7h-2v-4l-2 2-2-2v4zm11-3h2l-3 3-3-3h2v-4h2v4z"/></svg>`,
                            hotkey="CTRL+3",
                            dependencies = ["clutter-free-view", ],
                            use_iframe_isolation = true,
                            require_css_reset = true)
})();
views.push(markdown_view)
