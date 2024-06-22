/* eslint-disable brace-style */
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import { POSITION_FORMAT, TOKENS } from '@/helpers/constants'

const URL_BACKEND = 'http://localhost:8000';
let numberOfEntries = 0;
const tableOfSymbols: TableOfSymbols[] = []

export const processFile = (file: FileUploadUploaderEvent, isProcessed: Ref<boolean>): Promise<{ lexemesToProcess: LexemeMetadata[], processedLexemes: LexemeMetadata[] }> => {
  const fileData = file.files[0] 
  const lexemes: LexemeMetadata[] = []
  
  return new Promise((resolve, reject) => {
    // Leemos el archivo
    readFile(fileData).then((textFile) => {
      // Convertimos el texto a lexemas
      lexemes.push(...textToLexemes(textFile))

      // Hacemos una llamada a la API para obtener el diccionario de datos
      fetch(`${URL_BACKEND}/api`).then((response) => {
        return response.json()
      }).then((data) => {
        const dictionary = ResponseToTableOfSymbols(data.dictionary)

        numberOfEntries = data.numberOfEntries

        tableOfSymbols.push(...dictionary)

        // Comparamos el diccionario de datos con los lexemas
        const { lexemesToProcess, processedLexemes } = compareDictionaryWithLexemes(tableOfSymbols, lexemes)

        isProcessed.value = true
        resolve({
          lexemesToProcess,
          processedLexemes,
        })
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error al obtener el diccionario de datos:', error)
        })
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error al leer archivo:', error)
      reject(error)
    })
  })
}

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsText(file)
  })
}

const cleanText = (text: string): string => {
  text = text.toLowerCase()

  return text.replace(/[^a-záéíóúñü\s]/g, '')
}

const textToLexemes = (text: string): LexemeMetadata[] => {
  text = cleanText(text)
  const textSplit: string[] = text.split(/\s+/)

  const lexemes: LexemeMetadata[] = textSplit.map((lexeme, index) => {
    return {
      index: index,
      lexeme: lexeme,
    }
  })

  const lexemesWithoutDuplicates = sortGroupRemoveDuplicates(lexemes)

  return lexemesWithoutDuplicates
}

const sortGroupRemoveDuplicates = (lexemes: LexemeMetadata[]): LexemeMetadata[] => {
  const finalLexemes: LexemeMetadata[] = []

  lexemes.sort((a, b) => {
    return a.lexeme.localeCompare(b.lexeme)
  })

  lexemes.forEach((lexeme: LexemeMetadata, index: number) => {
    if (index === 0) {
      finalLexemes.push(lexeme)
    } else {
      if (lexeme.lexeme !== lexemes[index - 1].lexeme) {
        finalLexemes.push(lexeme)
      } else {
        const previousPosition: number = finalLexemes.length - 1
        const previousIndex: number | number[] = finalLexemes[previousPosition].index

        if (Array.isArray(previousIndex)) {
          finalLexemes[previousPosition].index = [ ...previousIndex, lexeme.index ]
        } else {
          finalLexemes[previousPosition].index = [ previousIndex, lexeme.index ]
        }
      }
    }
  })

  return finalLexemes
}

const compareDictionaryWithLexemes = (dictionary: TableOfSymbols[], lexemes: LexemeMetadata[]) => {
  const lexemesToProcess: LexemeMetadata[] = [] // Lexemes that are not in the dictionary
  const processedLexemes: LexemeMetadata[] = [] // Lexemes that are in the dictionary

  lexemes.forEach((lexeme) => {
    lexeme.lexemePosition = undefined;
    lexeme.token = undefined;
    lexeme.tokenPosition = undefined;

    // En caso de que se encuentre el lexema,  obtenememos el token al que pertenece y el indice en el array de lexemes
    dictionary.find((element, index) => {
      const lexemePosition: number = element.lexemes.findIndex((lexemeElement) => lexemeElement.lexeme === lexeme.lexeme)

      if (lexemePosition !== -1) {
        lexeme.token = element.token
        lexeme.lexemePosition = lexemePosition
        lexeme.tokenPosition = index

        return true
      } 
    })

    lexeme.token != undefined ? processedLexemes.push(lexeme) : lexemesToProcess.push(lexeme)
  })

  return { lexemesToProcess, processedLexemes }
}

const setPositionFormat = (numOfEntry: number, position: number | number[]): string[] => {
  if (Array.isArray(position)) {
    return position.map((pos) => {
      return POSITION_FORMAT.replace('#', numOfEntry.toString()).replace('N', pos.toString())
    })
  }

  return [ POSITION_FORMAT.replace('#', numOfEntry.toString()).replace('N', position.toString()) ]
}

export const calculateProgress = (totalLexemes: number, analyzedLexemes: number): number => {
  const progress = (analyzedLexemes / totalLexemes) * 100

  // si el progreso es NaN, retornamos 0
  return isNaN(progress) ? 0 : Math.floor(progress) 
}

// 
export const saveLexemesIntoDictionary = (previouslyProcessedLexemes: LexemeMetadata[], lexemesProcessedNow: LexemeMetadata[]): Promise<{ result: ResultReport[], outputFile: string }> => {
  const newsLexemes: LexemeMetadata[] = [ ...previouslyProcessedLexemes, ...lexemesProcessedNow ]
  let result: ResultReport[] = []
  let outputPathFile = ''
  const outputFile: TableOfSymbols[] = []

  result = generateReport(previouslyProcessedLexemes, lexemesProcessedNow)

  TOKENS.forEach((token) => outputFile.push({ token, lexemes: [] }))

  // Agregamos a tableOfSymbols los nuevos lexemas
  newsLexemes.forEach((lexeme) => {
    if (lexeme.lexemePosition !== undefined) {
      tableOfSymbols[lexeme.tokenPosition!].lexemes[lexeme.lexemePosition].positions.push(...setPositionFormat(numberOfEntries, lexeme.index))
      outputFile[lexeme.tokenPosition!].lexemes.push({
        lexeme: lexeme.lexeme,
        positions: [ ...setPositionFormat(numberOfEntries, lexeme.index) ],
      })

    } else {
      tableOfSymbols[lexeme.tokenPosition!].lexemes.push({
        lexeme: lexeme.lexeme,
        positions: [ ...setPositionFormat(numberOfEntries, lexeme.index) ],
      })

      outputFile[lexeme.tokenPosition!].lexemes.push({
        lexeme: lexeme.lexeme,
        positions: [ ...setPositionFormat(numberOfEntries, lexeme.index) ],
      })
    }
  })

  return new Promise((resolve, reject) => {
    fetch(`${URL_BACKEND}/api`, {
      method: 'POST',
      body: JSON.stringify({
        dictionary: tableOfSymbols,
        outputFile: outputFile,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      return response.json()
    }).then((data) => {
      outputPathFile = data.outputFile
      resolve({
        result,
        outputFile: outputPathFile,
      })
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error al guardar el diccionario de datos:', error)
      reject(error)
    })
  })
  // Guardamos el diccionario de datos
}


const generateReport = (previouslyProcessedLexemes: LexemeMetadata[], lexemesProcessedNow: LexemeMetadata[]): ResultReport[] => {
  const results: ResultReport[] = []

  TOKENS.forEach((token, index) => {
    const lexemesToken: LexemeMetadata[] = previouslyProcessedLexemes.filter((lexeme) => lexeme.token === token)
    const lexemesProcessedNowToken: LexemeMetadata[] = lexemesProcessedNow.filter((lexeme) => lexeme.token === token)
    const sumOfLexemes = lexemesToken.length + lexemesProcessedNowToken.length

    const resultReport: ResultReport = {
      token: token,
      percentageOfPreprocessedLexemes: `${calculateProgress(sumOfLexemes, lexemesToken.length)}%`,
      percentageOfProcessLexemes: `${calculateProgress(sumOfLexemes, lexemesProcessedNowToken.length)}%`,
      cantOfTotalLexemes: tableOfSymbols[index].lexemes.length + lexemesProcessedNowToken.length,
      cantOfLexemesBeforeToRead: tableOfSymbols[index].lexemes.length,
      cantOfNewLexemes: lexemesProcessedNowToken.length,
      outputFile: '',
    }

    results.push(resultReport)
  });

  return results
}


