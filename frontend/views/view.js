let views = []

class View {

    constructor (id,
                 display_name,
                 icon,
                 dependencies = [],
                 require_css_reset = true) {
        this.id = id;
        this.display_name = display_name;
        this.icon = icon;
        this.dependencies = dependencies;
        this.require_css_reset = require_css_reset;
        this._body = null;
    }

    generateContent () {
        this._body = "This content is generated by the default generateContent() method."
    }

    areDependenciesReady () {
        for (const dependency of this.dependencies) {
            if (eval(dependency + "._body") === null) {
                return false
            }
        }
        return true
    }

    displayView () {

        // Return false if the view is not ready yet.
        if (this._body === null) {
            return false;
        }

        // Reset the body but keep the header
        const body_childs = document.body.querySelectorAll("body > *:not(header#flowcus-header)")
        for (const child of body_childs) {
            document.body.removeChild(child)
        }

        // Append all the view's body childs to document.body
        const view_body_childs = this._body.querySelectorAll("body > *")
        for (const child of view_body_childs) {
            document.body.appendChild(child.cloneNode(true))
        }

        // Remove other views classes and add this view's id class to document.body
        for (const view of views) {
            document.body.classList.remove(view.id)
        }
        document.body.classList.add(this.id)

        // Add the css-reset class to document.body if required
        if (this.require_css_reset === true) {
            document.body.classList.add("requires-css-reset")
        }
        else {
            document.body.classList.remove("requires-css-reset")
        }
    }
}
