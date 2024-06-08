interface Lexeme {
  lexeme: string;
  positions: string[];
}

interface TableOfSymbols {
  token: string;
  lexemes: Lexeme[];
}