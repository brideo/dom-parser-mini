import HTMLNode from './parser'; // Adjust the path as necessary

describe('HTMLNode', () => {
  test('Basic HTML Structure', () => {
    const html = `<div><p>Hello, world!</p></div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('div');
    expect(nodes[0].children).toHaveLength(1);
    expect(nodes[0].children[0].tagName).toBe('p');
    expect(nodes[0].children[0].content).toBe('Hello, world!');
  });

  test('Nested Elements', () => {
    const html = `<ul><li>Item 1</li><li>Item 2<ul><li>Subitem 1</li><li>Subitem 2</li></ul></li></ul>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('ul');
    expect(nodes[0].children).toHaveLength(2);
    expect(nodes[0].children[0].tagName).toBe('li');
    expect(nodes[0].children[0].content).toBe('Item 1');
    expect(nodes[0].children[1].tagName).toBe('li');
    expect(nodes[0].children[1].children).toHaveLength(1);
    expect(nodes[0].children[1].children[0].tagName).toBe('ul');
    expect(nodes[0].children[1].children[0].children).toHaveLength(2);
    expect(nodes[0].children[1].children[0].children[0].tagName).toBe('li');
    expect(nodes[0].children[1].children[0].children[0].content).toBe('Subitem 1');
    expect(nodes[0].children[1].children[0].children[1].tagName).toBe('li');
    expect(nodes[0].children[1].children[0].children[1].content).toBe('Subitem 2');
  });

  test('Self-Closing Tags', () => {
    const html = `<div><img src="image.jpg" /></div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);

    expect(nodes[0].tagName).toBe('div');
    expect(nodes[0].children).toHaveLength(1);
    expect(nodes[0].children[0].tagName).toBe('img');
    expect(nodes[0].children[0].attributes['src']).toBe('image.jpg');
  });

  test('Attributes Without Values', () => {

    const html = `<input type="checkbox" checked />`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('input');
    expect(nodes[0].attributes['type']).toBe('checkbox');
    expect(nodes[0].attributes['checked']).toBe('');
  });

  test('Quoted Attributes with Special Characters', () => {

    const html = `<a href="http://example.com?param1=value1&param2=value2">Link</a>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('a');
    expect(nodes[0].attributes['href']).toBe('http://example.com?param1=value1&param2=value2');
    expect(nodes[0].content).toBe('Link');
  });

  test('Misnested Tags, malformed HTML', () => {
    const html = `<div><p>Misnested <div>tags</p></div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(0);
  });

  test('Whitespace Handling', () => {
    const html = `<div>   <p>  Extra   whitespace </p>   </div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('div');
    expect(nodes[0].children).toHaveLength(1);
    expect(nodes[0].children[0].tagName).toBe('p');
    expect(nodes[0].children[0].content).toBe('  Extra   whitespace ');
  });

  test('Script and Style Tags', () => {
    const html = `<script>alert('Hello');</script><style>body { background-color: #f00; }</style>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(2);
    expect(nodes[0].tagName).toBe('script');
    expect(nodes[0].content).toBe("alert('Hello');");
    expect(nodes[1].tagName).toBe('style');
    expect(nodes[1].content).toBe('body { background-color: #f00; }');
  });

  test('Entities and Special Characters', () => {
    const html = `<div>Some &amp; special &lt;characters&gt;</div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('div');
    expect(nodes[0].text()).toBe('Some &amp; special &lt;characters&gt;');
  });

  test('Empty Attributes', () => {
    const html = `<input type="text" disabled="" />`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('input');
    expect(nodes[0].attributes['type']).toBe('text');
    expect(nodes[0].attributes['disabled']).toBe('');
  });

  test('Attribute Order and Case Sensitivity', () => {
    const html = `<div id="main" CLASS="container">Content</div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].tagName).toBe('div');
    expect(nodes[0].attributes['id']).toBe('main');
    expect(nodes[0].attributes['class']).toBe('container');
    expect(nodes[0].content).toBe('Content');
  });

  test('Malformed Tags', () => {
    const html = `<div><p>Malformed <span> tags`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(0);
  });

  test('Mixed Content', () => {
    const html = `<div>Text before <p>text inside</p>text after</div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);

    expect(nodes[0].tagName).toBe('div');
    expect(nodes[0].content).toBe('Text before text after');
    expect(nodes[0].children).toHaveLength(1);
    expect(nodes[0].children[0].tagName).toBe('p');
    expect(nodes[0].children[0].content).toBe('text inside');
  });

  test('Filter Attributes', () => {
    const html = `<div onclick="alert('hello world')" class="container"><h1 id="title">Title</h1><p class="text important">Paragraph</p></div>`;
    const nodes = HTMLNode.create(html);

    expect(nodes).toHaveLength(1);

    const rootNode = nodes[0];

    rootNode.filterAttributes(['class', 'id']);

    expect(rootNode.attributes['class']).toBe('container');
    expect(rootNode.attributes['onclick']).toBe(undefined);
  });
});
