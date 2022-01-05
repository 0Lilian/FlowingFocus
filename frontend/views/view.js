let views = []

class View {

    constructor (id,
                 display_name,
                 icon,
                 hotkey,
                 dependencies = [],
                 use_iframe_isolation = true,
                 require_css_reset = true) {
        this.id = id;
        this.display_name = display_name;
        this.icon = icon;
        this.dependencies = dependencies;
        this.require_css_reset = require_css_reset;
        this.use_iframe_isolation = use_iframe_isolation;

        this.body = document.createElement("body")
        this.iframe;
        this.iframe_window;
        this.iframe_document;
        this.button;
        this.is_ready = false;
        this.ready_event = new CustomEvent(this.id + "-ready")

    }

    static init () {
        const promises = []

        for (const view of views) {
            promises.push(view.init())
        }

        return Promise.all(promises)
    }


    static getViewById (id) {
        for (const view of views) {
            if (view.id === id) {
                return view
            }
        }
        return null
    }

    static displayDefaultView () {
        Settings.get("default-view", function (value) {
            View.getViewById(value).displayView()
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
                error ? console.log("An error occured while trying to initialize this view " + view.id + ". Error : " + error) : null
                reject()
            })
        })
    }

    waitForViewReady () {
        return new Promise((resolve, reject) => {
            try {
                if (this.is_ready === true) {
                    resolve()
                }
                else {
                    window.addEventListener(this.id + "-ready", function () {
                        resolve()
                    }.bind(this))
                }
            }
            catch (error) {
                reject("An error occured while waiting this view to be ready " + view.id + ". Error : " + error)
            }
        })
    }

    waitForDependencies () {

        const promises = []

        for (const dependency of this.dependencies) {
            promises.push(eval(dependency).waitForViewReady())
        }

        return Promise.all(promises)
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

    generateButton () {
        return new Promise((resolve, reject) => {

            try {
                // Create the view button and add the click event.
                this.button = document.createElement("button")
                this.button.innerHTML = `<span class="icon">${this.icon}</span><span class="name">${this.display_name}</span>`
                this.button.id = this.id + "-button"

                this.button.addEventListener("click", function () {
                    this.displayView()
                }.bind(this))

                // Resolve the promise.
                resolve()
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

    _displayView () {
        for (const view of views) {
            if (view.iframe) {
                view.iframe.style.display = "none";
            }
        }
        this.iframe.style.display = "inline-block";

        // Remove the displayed class from other buttons.
        for (const view of views) {
            view.button.classList.remove("displayed")
        }
        // Add the displayed class to this button
        this.button.classList.add("displayed")
    }

    displayView () {

        return new Promise((resolve, reject) => {

            try {

                if (this.is_ready === true) {
                    this._displayView()
                }
                else {
                    this.waitForViewReady()
                    .then(() => this._displayView())
                }
            }
            catch (error) {
                reject("An error occured while trying to display the view " + view.id + ". Error : " + error)
            }
        })
    }
}
