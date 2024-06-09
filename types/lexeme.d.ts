interface TableOfSymbols {
  token: string;
  lexemes: Lexeme[];
}

interface Lexeme {
  lexeme: string;
  positions: string[];
}

interface LexemeMetadata {
  index: number | number[];
  lexeme: string;
  token?: string;
  lexemePosition?: number;
}