export const markdownInitialCode = `[Section]
  [Heading = level: 1, title: SomMark to Markdown Example][end]

  [Block]
  SomMark can easily compile to clean, standard Markdown.
  [end]

  [Block]
  (Text Formatting)->(h2)
  You can use (bold text)->(bold), (italic text)->(italic), and (strikethrough)->(emphasis) easily.
  [end]

  [Block]
  (Lists & Tables)->(h2)
  @_list_@
    Root Item
    - Sub Item 1
    - Sub Item 2
  @_end_@

  @_table_@: Status, Task;
    Done, Documentation
    WIP, Parsing
  @_end_@
  [end]

  [Block]
  (Links and Images)->(h2)
  (Visit our repo)->(link: https\\://github.com/Adam-Elmi/SomMark)
  
  (Sample Image)->(image: https\\://i.pinimg.com/736x/b9/37/3d/b9373dbb90d96f0c6cfdc1b78c5c3e70.jpg, title)
  [end]

  [Block]
  (Code Blocks)->(h2)
  @_code_@: javascript;
  function helloMarkdown() {
    console.log("This will be formatted as a markdown code block!");
  }
  @_end_@
  [end]
[end]`;

