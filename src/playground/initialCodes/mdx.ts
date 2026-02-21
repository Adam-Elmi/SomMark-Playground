export const mdxInitialCode = `[Section]
  [Heading = level: 1, title: SomMark to MDX Example][end]

  [Block]
  MDX allows you to use JSX in your markdown documents. SomMark can transpile to MDX, 
  making it easy to integrate with React/Astro components.
  [end]

  [Block]
  (Custom Components)->(h2)
  SomMark blocks can map directly to MDX components if configured properly in your mapper.
  [end]

  [Alert = type: 'warning']
    This is an example of how a custom 'Alert' component might be represented.
  [end]

  [Button = message: Welcome to SomMark!]
    Click Me!
  [end]

  [Block]
  (Standard Elements)->(h2)
  Of course, (standard formatting)->(bold) and elements still work flawlessly.

  @_code_@: tsx;
  export const MyComponent = () => {
    return <div>Hello MDX!</div>;
  };
  @_end_@
  [end]
[end]`;

