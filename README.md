# dom-parser-mini

A lightweight, dependency-free HTML parser for Node.js. This package provides a simple way to parse and manipulate HTML
content.

*This project is still in beta*

You can install the package using npm:

```bash
npm install dom-parser-mini
```

## Usage

Basic HTML Parsing

```javascript
const HTMLNode = require('dom-parser-mini');

const html = `<div><p>Hello, world!</p></div>`;
const nodes = HTMLNode.create(html);

console.log(nodes);
```

Currently, the dom parser mini only handles self closing tags.

```javascript
const html = `<div><img src="image.jpg" /></div>`;
const nodes = HTMLNode.create(html);

console.log(nodes);
```

## API

### `HTMLNode.create(input: string): HTMLNodeInterface[]`

Parses the input HTML string and returns an array of HTMLNodeInterface objects representing the DOM structure.

### `HTMLNodeInterface`

An interface representing a parsed HTML node with the following properties and methods:

#### Properties

- `tagName: string`: The tag name of the node.
- `attributes: { [key: string]: string }`: The attributes of the node.
- `children: HTMLNodeInterface[]`: The child nodes of the node.
- `content?: string`: The content of the node.

#### Methods

- `html(): string`: Returns the HTML representation of the node.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div><p>Hello</p></div>')[0];
      console.log(node.html()); // Outputs: <div><p>Hello</p></div>
      ```
- `text(): string`: Returns the text content of the node.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div>Hello <span>world</span></div>')[0];
      console.log(node.text()); // Outputs: Hello world
      ```
- `getElementById(id: string): HTMLNodeInterface | null`: Finds a child node by its ID.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div><p id="para">Hello</p></div>')[0];
      console.log(node.getElementById('para')); // Outputs the <p> node with id="para"
      ```
- `getElementsByClass(className: string): HTMLNodeInterface[]`: Finds child nodes by their class name.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div class="container"><p class="text">Hello</p></div>')[0];
      console.log(node.getElementsByClass('text')); // Outputs an array with the <p> node
      ```
- `hidden(): void`: Hides the node by setting `display: none;` in its style attribute.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div>Hello</div>')[0];
      node.hidden();
      console.log(node.html()); // Outputs: <div style="display: none;">Hello</div>
      ```
- `show(): void`: Shows the node by removing `display: none;` from its style attribute.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div style="display: none;">Hello</div>')[0];
      node.show();
      console.log(node.html()); // Outputs: <div>Hello</div>
      ```
- `remove(): void`: Marks the node as removed.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div>Hello</div>')[0];
      node.remove();
      console.log(node.html()); // Outputs: ''
      ```
- `unRemove(): void`: Unmarks the node as removed.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div>Hello</div>')[0];
      node.remove();
      node.unRemove();
      console.log(node.html()); // Outputs: <div>Hello</div>
      ```
- `filterAttributes(whitelist: string[]): void`: Filters the node's attributes based on a whitelist.
    - **Example:**
      ```javascript
      const node = HTMLNode.create('<div onclick="alert(\'hello\')" class="container">Hello</div>')[0];
      node.filterAttributes(['class']);
      console.log(node.html()); // Outputs: <div class="container">Hello</div>
      ```

## Contributing

Feel free to open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License.
