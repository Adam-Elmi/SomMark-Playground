export const htmlInitialCode = `[Section]
  [Block] (SomMark v2: HTML Mapper Features)->(h1) [end]

  [Block]
  This document demonstrates the HTML mapper's core syntax and features.
  [end]

  # -------------------------------------------------------------------------- #
  #  1. Typography & Inline Styles                                             #
  # -------------------------------------------------------------------------- #
  [Section]
    [Block] (1. Typography)->(h2) [end]

    [Block]
    You can use (bold text)->(bold), (italicized text)->(italic), and (emphasized text)->(emphasis).
    Need more flavor? Let's add some (color!)->(color: coral)
    [end]

    [h3] Header Example [end]
    [Block] Paragraphs are just standard content inside a Block tag. [end]
  [end]

  # -------------------------------------------------------------------------- #
  #  2. Lists and Tables                                                      #
  # -------------------------------------------------------------------------- #
  [Section]
    [Block] (2. Structural Data)->(h2) [end]

    @_list_@
      Root List Item
      Indented Item 1
      Indented Item 2
    @_end_@

    [Block]
    Here is an example of a simple table:
    [end]

    @_table_@: Name, Version, Built for;
      SomMark Core, v2.0.0, Parsing
      CLI Tool, v1.0.0, Automation
    @_end_@
  [end]

  # -------------------------------------------------------------------------- #
  #  3. Media & Formatting                                                    #
  # -------------------------------------------------------------------------- #
  [Section]
    [Block] (3. Media & Extras)->(h2) [end]

    [Block]
    Links are inline statements: (Visit Repo)->(link: https://github.com/Adam-Elmi/SomMark, Source Code)
    [end]
    
    [Image = src: https\\://i.pinimg.com/736x/b9/37/3d/b9373dbb90d96f0c6cfdc1b78c5c3e70.jpg, alt: Battle Chess, width: 100%][end]

    (-)->(todo: Read Documentation)
    
    [hr][end]
    
    [Block]
    @_code_@: javascript;
    function htmlFeatureDemo() {
      console.log("SomMark makes structured HTML generation easy!");
    }
    @_end_@
    [end]
  [end]
[end]`;

