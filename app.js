function tag(name, ...children) {
  const _ele = document.createElement(name);

  for (let child of children) {
    if (typeof child === "string") {
      _ele.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      _ele.appendChild(child);
    } else if (typeof child === "function") {
      const placeholder = document.createTextNode("");
      _ele.appendChild(placeholder);
      child((value) => {
        placeholder.textContent = value;
      });
    }
  }

  _ele.att$ = function (name, value) {
    this.setAttribute(name, value);
    return this;
  };

  _ele.class$ = function (classnames) {
    this.setAttribute("class", classnames);
    return this;
  };

  _ele.onClick$ = function (callback) {
    this.addEventListener("click", callback);
    return this;
  };

  _ele.link$ = function (path, router) {
    this.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent default anchor behavior
      router.navigate(path); // Use router to navigate
    });
    return this;
  };

  return _ele;
}

const example_todos = [
  { id: 0, done: false, name: "first todo" },
  { id: 1, done: false, name: "second todo" },
];

function Router(routes) {
  const routeContainer = document.createElement("div"); // Main container for route content

  const renderRoute = () => {
    const currentHash = window.location.hash || "#/"; // Get the current hash or default to "#/"
    const currentPath = currentHash.replace("#", ""); // Remove the "#" from the hash
    const routeComponent = routes[currentPath]; // Find the component for the current route

    if (routeComponent) {
      routeContainer.innerHTML = ""; // Clear the container
      routeContainer.appendChild(routeComponent()); // Render the new route component
    } else {
      routeContainer.innerHTML = "<h1>404 - Page Not Found</h1>"; // Handle unmatched routes
    }
  };

  // Listen for hash changes
  window.addEventListener("hashchange", renderRoute);

  // Navigate to a new hash route programmatically
  const navigate = (path) => {
    window.location.hash = path; // Update the hash
  };

  // Initialize the router
  renderRoute();

  return { navigate, routeContainer };
}

function useState(initialValue) {
  let value = initialValue;
  const listeners = new Set();

  const setValue = (newValue) => {
    if (typeof newValue === "function") {
      value = newValue(value);
    } else {
      value = newValue;
    }
    listeners.forEach((listener) => listener(value));
  };

  const bind = (updateFunction) => {
    listeners.add(updateFunction);
    updateFunction(value);
    return () => listeners.delete(updateFunction);
  };

  return [() => value, setValue, bind];
}

const CounterComponent = ({ count, setCount, bindCount }) => {
  return tag(
    "div",
    tag("p", bindCount),
    tag(
      "div",

      tag("button", "Increment")
        .class$("cursor-pointer")
        .class$("btn")
        .onClick$(() => setCount((prev) => prev + 1)),
      tag("button", "Decrement")
        .class$("cursor-pointer")
        .class$("btn")
        .onClick$(() => setCount((prev) => prev - 1))
    ).class$("flex gap-2")
  );
};

const Home = () => tag("div", tag("h1", "Home Page"));
const About = () => tag("div", tag("h1", "About Page"));
const Contact = () => tag("div", tag("h1", "Contact Page"));

const routes = {
  "/": Home,
  "/about": About,
  "/contact": Contact,
};

const { navigate, routeContainer } = Router(routes);

// Navigation bar
const NavBar = () =>
  tag(
    "nav",
    tag("a", "Home").link$("", { navigate }),
    tag("a", "About").link$("/about", { navigate }),
    tag("a", "Contact").link$("/contact", { navigate })
  );

const TodoListItem = ({ name, id, done = false, handleTodoClick }) => {
  return tag("div", tag("input").att$("type", "checkbox"), tag("p", name))
    .class$(`flex gap-2 ${done && "line-through"}`)
    .onClick$(handleTodoClick);
};

const HomePage = () => {
  return;
};

function main() {
  let _shadowDom;

  const [count, setCount, bindCount] = useState(0);
  const [todo, setTodo, bindTodo] = useState(example_todos);

  // Define the handleTodoClick function to update the state
  const handleTodoClick = (id) => {
    const updatedTodos = todo().map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setTodo(updatedTodos); // Update the state
  };

  const _div = tag(
    "div",
    tag(
      "div",
      NavBar(),
      tag("p", bindCount),
      tag(
        "div",
        tag("a", "abc")
          .att$("href", "/abc")
          .att$("target", "_blank")
          .class$("class", "blue")
      )
    ),
    tag(
      "div",
      tag("div", tag("img").att$("src", "./a.png")),
      tag("div", tag("h1", "This is the heading").class$("underline")),
      CounterComponent({ count, setCount, bindCount }),
      tag(
        "ul",
        ...todo().map((item) =>
          TodoListItem({
            id: item.id,
            name: item.name,
            done: item.done,
            handleTodoClick: () => handleTodoClick(item.id),
          })
        )
      )
    ).att$("class", "main-div")
  ).class$("m-20");

  _shadowDom = _div;

  // Define the re-render function
  // const renderApp = () => {
  //   if (_shadowDom) {
  //     document.body.removeChild(_shadowDom); // Remove the old DOM
  //   }

  //   _shadowDom = _div(); // Create a new DOM tree
  //   document.body.appendChild(_shadowDom); // Append the new DOM to the body
  // };

  // // Bind state updates to trigger re-render
  // bindTodo(renderApp);

  app.appendChild(_shadowDom);
}

main();
