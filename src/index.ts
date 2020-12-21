type Arguments = {
  importFunction: (controllerName: string) => Promise<any>;
  onRegister: (controllerName: string, controller: any) => any;
  attribute?: string;
};

export default function attributeImport({
  importFunction,
  onRegister,
  attribute = "data-controller",
}: Arguments) {
  const registeredControllers = new Set();

  const loadControllers = (element: Element | Document) => {
    element.querySelectorAll(`[${attribute}]`).forEach(c => {
      const controllerNames = c.getAttribute(attribute);

      if (!controllerNames) return;

      controllerNames.split(" ").forEach(controllerName => {
        if (!controllerName || registeredControllers.has(controllerName)) {
          return;
        }

        registeredControllers.add(controllerName);

        importFunction(controllerName).then(({ default: controller }) => {
          onRegister(controllerName, controller);
        });
      });
    });
  };

  new MutationObserver(function callback(mutationList) {
    mutationList.forEach(function({ target }) {
      if (target instanceof Element) {
        loadControllers(target);
      }
    });
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });

  loadControllers(document);
}
