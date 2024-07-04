// console.log(tinymce.PluginManager,'editoreditor');

tinymce.PluginManager.add("placeholder", function (editor) {
  editor.on("init", function () {
    let label = new Label();

    onBlur();

    tinymce.DOM.bind(label.el, "click", onFocus);
    editor.on("focus", onFocus);
    editor.on("blur", onBlur);
    editor.on("change", onBlur);
    editor.on("setContent", onBlur);
    editor.on("keyup", onBlur);
    editor.on("keydown", onKeydown);

    function onFocus() {
      editor.execCommand("mceFocus", false);
    }

    function onBlur() {
      const text = editor.getContent({ format: "text" }).trim();
      if (!text) {
        label.show();
      } else {
        label.hide();
      }
    }

    function onKeydown() {
      label.hide();
    }
  });

  let Label = function () {
    let placeholder_text =
      editor.getElement().getAttribute("placeholder") ||
      editor.settings.placeholder;
    let placeholder_attrs = editor.settings.placeholder_attrs || {
      style: {
        position: "absolute",
        top: "2px",
        left: 0,
        color: "#C4C4C4",
        fontSize: "14px",
        width: "100%",
        overflow: "hidden",
        padding: "32px",
        "white-space": "pre-wrap",
        "pointer-events": 'none',
      },
    };
    let contentAreaContainer = editor.getContentAreaContainer();

    tinymce.DOM.setStyle(contentAreaContainer, "position", "relative");

    // Create label el
    this.el = tinymce.DOM.add(
      contentAreaContainer,
      editor.settings.placeholder_tag || "label",
      placeholder_attrs,
      placeholder_text
    );
  };

  Label.prototype.hide = function () {
    tinymce.DOM.setStyle(this.el, "display", "none");
  };

  Label.prototype.show = function () {
    tinymce.DOM.setStyle(this.el, "display", "");
  };
});
