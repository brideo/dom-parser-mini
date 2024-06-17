enum TokenType {
  TEXT,
  TAG_OPEN,
  TAG_CLOSE,
  ATTRIBUTE_NAME,
  ATTRIBUTE_VALUE,
  SELF_CLOSING_TAG,
}

interface Token {
  type: TokenType;
  value: string;
}

const selfClosingTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr'
]);

export interface HTMLNodeInterface {
  tagName: string;
  attributes: { [key: string]: string };
  children: HTMLNodeInterface[];
  isSelfClosing: boolean;
  content?: string;

  html(): string;

  text(): string;

  getElementById(id: string): HTMLNodeInterface | null;

  getElementsByClass(className: string): HTMLNodeInterface[];

  hidden(): void;

  show(): void;

  remove(): void;

  unRemove(): void;

  filterAttributes(whitelist: string[]): void;
}

class HTMLNode implements HTMLNodeInterface {
  tagName: string;
  attributes: { [key: string]: string };
  children: HTMLNodeInterface[];
  content?: string;
  isRemoved: boolean;
  isSelfClosing: boolean;

  constructor(tagName: string, attributes: { [key: string]: string }, children: HTMLNodeInterface[], content?: string) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.children = children;
    this.content = content;
    this.isRemoved = false;
    this.isSelfClosing = false;
  }

  html(): string {
    if (this.isRemoved) {
      return '';
    }

    let innerHTML = this.content || '';
    for (const child of this.children) {
      innerHTML += child.html();
    }

    if (this.isSelfClosing) {
      return `<${this.tagName}${this.getAttributesString()} />`
    }

    return `<${this.tagName}${this.getAttributesString()}>${innerHTML}</${this.tagName}>`;
  }

  text(): string {
    return this.isRemoved ? '' : this.content || '';
  }

  getElementById(id: string): HTMLNodeInterface | null {
    if (this.isRemoved) {
      return null;
    }

    if (this.attributes['id'] === id) return this;

    for (const child of this.children) {
      const result = child.getElementById(id);
      if (result) return result;
    }

    return null;
  }

  getElementsByClass(className: string): HTMLNodeInterface[] {
    if (this.isRemoved) {
      return [];
    }

    const results: HTMLNodeInterface[] = [];

    if (this.attributes['class'] && this.attributes['class'].split(' ').includes(className)) {
      results.push(this);
    }

    for (const child of this.children) {
      results.push(...child.getElementsByClass(className));
    }

    return results;
  }

  remove(): void {
    this.isRemoved = true;
  }

  unRemove(): void {
    this.isRemoved = false;
  }

  hidden(): void {
    if (this.isRemoved) {
      return;
    }

    this.attributes['style'] = `${this.attributes['style'] || ''}; display: none;`;
  }

  show(): void {
    if (this.isRemoved) {
      return;
    }

    if (this.attributes['style']) {
      this.attributes['style'] = this.attributes['style'].replace(/display:\s*none;?/, '').trim();
      if (!this.attributes['style']) delete this.attributes['style'];
    }
  }

  filterAttributes(whitelist: string[]): void {
    if (whitelist.includes('*')) {
      return;
    }

    const filteredAttributes: { [key: string]: string } = {};

    for (const [key, value] of Object.entries(this.attributes)) {
      if (whitelist.includes(key)) {
        filteredAttributes[key] = value;
      }
    }

    this.attributes = filteredAttributes;

    for (const child of this.children) {
      child.filterAttributes(whitelist);
    }
  }

  private getAttributesString(): string {
    return Object.entries(this.attributes).map(([key, value]) => ` ${key}="${value}"`).join('');
  }

  static create(input: string): HTMLNodeInterface[] {
    const tokens = HTMLNode.tokenize(input);

    console.log(tokens);

    const nodes: HTMLNodeInterface[] = [];
    const stack: HTMLNode[] = [];

    let currentNode: HTMLNode | null = null;
    let currentAttributes: { [key: string]: string } = {};
    let currentContent: string = '';

    for (const token of tokens) {
      switch (token.type) {
        case TokenType.TAG_OPEN:
          if (currentNode) {

            if (Object.keys(currentNode.attributes).length === 0) {
              currentNode.attributes = currentAttributes
            }

            currentNode.content = currentContent.trim();

            currentAttributes = {};
            currentContent = '';

            stack.push(currentNode);
          }

          currentNode = new HTMLNode(token.value, {}, []);
          break;
        case TokenType.ATTRIBUTE_NAME:
          currentAttributes[token.value] = '';
          break;
        case TokenType.ATTRIBUTE_VALUE:
          const lastKey = Object.keys(currentAttributes).pop()!;
          currentAttributes[lastKey] = token.value;
          break;
        case TokenType.TAG_CLOSE:
        case TokenType.SELF_CLOSING_TAG:
          if (!currentNode) {
            break;
          }

          currentNode.isSelfClosing = token.type === TokenType.SELF_CLOSING_TAG;

          if (Object.keys(currentNode.attributes).length === 0) {
            currentNode.attributes = currentAttributes
          }

          if (!currentNode.content) {
            currentNode.content = currentContent;
          } else {
            currentNode.content += ' ' + currentContent;
          }

          currentContent = '';
          currentAttributes = {};
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(currentNode);
          } else {
            nodes.push(currentNode);
          }
          currentNode = stack.pop() || null;
          break;
        case TokenType.TEXT:
          if (currentNode) {
            currentContent += token.value;
          }
          break;
      }
    }

    return nodes;
  }

  private static tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
      if (input[i] === '<') {
        if (input[i + 1] === '/') {
          let j = i + 2;
          while (j < input.length && input[j] !== '>') j++;
          tokens.push({ type: TokenType.TAG_CLOSE, value: input.slice(i + 2, j).trim() });
          i = j + 1;
        } else {
          let j = i + 1;
          while (j < input.length && input[j] !== ' ' && input[j] !== '>' && input[j] !== '/') j++;
          const tagName = input.slice(i + 1, j).trim();
          tokens.push({ type: TokenType.TAG_OPEN, value: input.slice(i + 1, j).trim() });

          while (j < input.length && input[j] !== '>') {
            if (input[j] === ' ') {
              j++;
              let attrName = '';
              while (j < input.length && input[j] !== '=' && input[j] !== ' ' && input[j] !== '>' && input[j] !== '/') {
                attrName += input[j];
                j++;
              }

              if (attrName !== '') {
                tokens.push({type: TokenType.ATTRIBUTE_NAME, value: attrName.trim().toLowerCase()});
              }

              if (input[j] === '=') {
                j++;
                const quoteType = input[j];
                j++;
                let attrValue = '';
                while (j < input.length && input[j] !== quoteType) {
                  attrValue += input[j];
                  j++;
                }
                tokens.push({ type: TokenType.ATTRIBUTE_VALUE, value: attrValue });
                j++;
              }
            }
            else {
              j++;
            }
          }

          if (selfClosingTags.has(tagName.toLowerCase()) && input[j] === '>') {
            tokens.push({ type: TokenType.SELF_CLOSING_TAG, value: tagName });
          }

          if (input[j] === '>') {
            j++;
          }

          i = j;
        }
      } else {
        let j = i;
        while (j < input.length && input[j] !== '<') j++;
        tokens.push({ type: TokenType.TEXT, value: input.slice(i, j) });
        i = j;
      }
    }

    return tokens;
  }
}

export default HTMLNode;
