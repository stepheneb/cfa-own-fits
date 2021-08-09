/*jshint esversion: 8 */

let emailKeyboard = {};

emailKeyboard.render = (page, registeredCallbacks) => {
  registeredCallbacks.push(callback);
  return '<div class="simple-keyboard"></div>';

  function callback() {
    const Keyboard = window.SimpleKeyboard.default;

    let keyboard = new Keyboard({
      onChange: input => onChange(input),
      onKeyPress: button => onKeyPress(button),
      useButtonTag: true
    });

    // function disabledKeys() {
    //   let keys = ['{enter}', '{tab}', '{space}', '(', ')'];
    //   return keys.map((disabledKey) => {
    //     return {
    //       attribute: "disabled",
    //       value: "true",
    //       buttons: `${disabledKey}`
    //     };
    //   });
    // }
    //
    // keyboard.setOptions({
    //   buttonAttributes: disabledKeys()
    // });

    keyboard.setOptions({
      layout: {
        'default': [
          '1 2 3 4 5 6 7 8 9 0 - {bksp}',
          'q w e r t y u i o p',
          'a s d f g h j k l',
          '{shift} z x c v b n m . {shift}',
          '@ .com'
        ],
        'shift': [
          '` ~ ! @ # $ % ^ & * _ + {bksp}',
          'Q W E R T Y U I O P',
          'A S D F G H J K L :',
          '{shift} Z X C V B N M {shift}',
          '.com @'
        ]
      }
    });

    // update simple-keyboard when input is changed directly
    document.querySelector("input#email").addEventListener("input", event => {
      keyboard.setInput(event.target.value);
    });

    // console.log(keyboard);

    function onChange(input) {
      document.querySelector("input#email").value = input;
      // console.log("Input changed", input);
    }

    function onKeyPress(button) {
      // console.log("Button pressed", button);

      // handle the shift and caps lock buttons
      if (button === "{shift}" || button === "{lock}") handleShift();
    }

    function handleShift() {
      let currentLayout = keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";

      keyboard.setOptions({
        layoutName: shiftToggle
      });
    }
  }
};

export default emailKeyboard;
