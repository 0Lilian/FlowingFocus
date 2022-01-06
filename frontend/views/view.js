class View extends Component {

    constructor (display_name,
                 slug,
                 icon,
                 hotkey,
                 dependencies = [],
                 use_iframe_isolation = true,
                 require_css_reset = true) {

        super(display_name,
              slug,
              icon,
              hotkey,
              dependencies);

        this.use_iframe_isolation = use_iframe_isolation;
        this.require_css_reset = require_css_reset;

        this.body = document.createElement("body")
        this.iframe;
        this.iframe_window;
        this.iframe_document;
    }

    static displayDefaultView () {

        Settings.get("default-view", function (value) {
            const default_view = View.getById(value)

            if (default_view !== null) {
                if (default_view.displayed === true) {
                    default_view.trigger()
                    return;
                }
            }
            // Else
            for (const view of View.getAll().reverse()) {
                if (view.displayed === true) {
                    view.trigger()
                }
            }
        })
    }

    init () {

        return new Promise((resolve, reject) => {
            this.waitForDependencies()
            .then(() => this.generateIframe())
            .then(() => this.generateButton())
            .then(() => this.generateContent())
            .then(() => this.insertContentInIframe())
            // Dispatch the ready event.
            .then(() => {
                window.dispatchEvent(this.ready_event)
                this.is_ready = true
            })
            .then(() => resolve())
            .catch(error => {
                error ? console.log("An error occured while trying to initialize this view " + this.id + ". Error : " + error) : null
                reject()
            })
        })
    }

    generateIframe () {

        return new Promise((resolve, reject) => {
            try {

                if (this.use_iframe_isolation === true) {
                    this.iframe = document.createElement("iframe")
                    this.iframe.classList.add("requires-css-reset")
                }
                else {
                    this.iframe = document.createElement("section")
                }

                this.iframe.classList.add("view-frame")

                if (this.use_iframe_isolation === true) {
                    this.iframe.addEventListener("load", function () {
                            this.iframe_window = this.iframe.contentWindow;
                            this.iframe_document = this.iframe_window.document;
                            resolve()
                    }.bind(this))

                    this.iframe.src = browser.runtime.getURL("/frontend/staticfiles/templates/view.html")
                    document.body.appendChild(this.iframe)
                }

                else {
                    const iframe_body = document.createElement("body")
                    this.iframe.appendChild(iframe_body)
                    document.body.appendChild(this.iframe)
                    resolve()
                }
            }
            catch (error) {
                reject("An error occured while generating iframe of view " + view.id + ". Error : " + error)
            }
        })
    }

    generateContent () {

        return new Promise((resolve, reject) => {

            try {

                this.body.innerHTML = "This content is generated by the default generateContent() method."

                // Resolve the promise.
                resolve()
            }
            catch (error) {
                reject("An error occured while generating content of view " + view.id + ". Error : " + error)
            }
        })
    }

    insertContentInIframe () {

        return new Promise((resolve, reject) => {

            try {

                if (this.use_iframe_isolation === true) {
                    this.iframe_document.body = this.body;
                }
                else {
                    const iframe_body = this.iframe.querySelector("body")
                    for (const child of this.body.querySelectorAll("body > *")) {
                        iframe_body.appendChild(child)
                    }
                }
                resolve()
            }
            catch (error) {
                reject("An error occured while inserting the content of view " + view.id + ". Error : " + error)
            }
        })
    }

    _trigger () {
        // On trigger --> display the View

        // Hide all views iframes
        for (const view of View.getAll()) {
            if (view.iframe) {
                view.iframe.style.display = "none";
            }
        }

        // Remove the displayed class from other buttons.
        for (const view of View.getAll()) {
            if (view.displayed === true) {
                view.button.classList.remove("displayed")
            }
        }

        // Display this view iframe
        this.iframe.style.display = "inline-block";

        // Add the displayed class to this button
        this.button.classList.add("displayed")
    }
}
