export const ResponseToTableOfSymbols = (dictionary: any): TableOfSymbols[] => {
  const tableOfSymbols: TableOfSymbols[] = []

  dictionary.forEach((element: any) => {
    const lexemes = ResponseToLexemes(element.lexemes)

    tableOfSymbols.push({
      token: element.token,
      lexemes: lexemes,
    })
  })

  return tableOfSymbols
}


const ResponseToLexemes = (data: any): Lexeme[] => {
  const lexemes: Lexeme[] = []

  data.forEach((element: any) => {
    lexemes.push({
      lexeme: element.lexeme,
      positions: element.positions,
    })
  })

  return lexemes
}
