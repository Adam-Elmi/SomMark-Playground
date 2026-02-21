export const textInitialCode = `[Section]
  [Block] (SomMark to Plain Text)->(h1) [end]

  [Block]
  When transpiling to plain text, SomMark strips away the structural tags 
  and formatting, leaving only the raw, readable content.
  [end]

  [h2] How it works [end]
  [Block]
  Notice how this (bold text)->(bold) and this (link)->(link: https\\://example.com) 
  will simply appear as plain text in the output.
  [end]

  [list]
    Lists lose their formatting.
    Headings lose their sizes.
  [end]
[end]`;

