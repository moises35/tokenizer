/* eslint-disable brace-style */
import type { FileUploadUploaderEvent } from 'primevue/fileupload'

const URL_BACKEND = 'http://localhost:8000';

export const processFile = (file: FileUploadUploaderEvent, isProcessed: Ref<boolean>): Promise<{ lexemesToProcess: LexemeMetadata[], processedLexemes: LexemeMetadata[] }> => {
  const fileData = file.files[0] 
  const lexemes: LexemeMetadata[] = []
  const tableOfSymbols: TableOfSymbols[] = []
  
  return new Promise((resolve, reject) => {
    const lexemesToProcess: LexemeMetadata[] = []
    const processedLexemes: LexemeMetadata[] = []
    
    // Leemos el archivo
    readFile(fileData).then((textFile) => {
      // Convertimos el texto a lexemas
      lexemes.push(...textToLexemes(textFile))

      console.log('lexemes luego de eliminar los duplicados: ')
      console.log(lexemes)

      // Hacemos una llamada a la API para obtener el diccionario de datos
      fetch(`${URL_BACKEND}/api`).then((response) => {
        return response.json()
      }).then((data) => {
        const dictionary = ResponseToTableOfSymbols(data.dictionary)

        tableOfSymbols.push(...dictionary)

        // Comparamos el diccionario de datos con los lexemas, separamos los lexemas que no estén en el diccionario y los que si estan
        const { lexemesToProcess, processedLexemes } = compareDictionaryWithLexemes(tableOfSymbols, lexemes)


        console.log('lexemesToProcess: ')
        console.log(lexemesToProcess)
        console.log('processedLexemes: ')
        console.log(processedLexemes)

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

  console.log('lexemes luego del textsplit: ')
  console.log(lexemes)

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

export const calculateProgress = (totalLexemes: number, analyzedLexemes: number): number => {
  const progress = (analyzedLexemes / totalLexemes) * 100

  return Math.floor(progress)
}

export const saveLexemeInToken = (selectedToken: string, lexeme: string) => {
}


const compareDictionaryWithLexemes = (dictionary: TableOfSymbols[], lexemes: LexemeMetadata[]) => {
  const lexemesToProcess: LexemeMetadata[] = [] // Lexemes that are not in the dictionary
  const processedLexemes: LexemeMetadata[] = [] // Lexemes that are in the dictionary

  console.log('diccionario')
  console.log(dictionary)
  lexemes.forEach((lexeme) => {
    lexeme.lexemePosition = undefined;
    lexeme.token = undefined;

    // En caso de que se encuentre el lexema,  obtenememos el token al que pertenece y el indice en el array de lexemes
    dictionary.find((element) => {
      const lexemePosition: number = element.lexemes.findIndex((lexemeElement) => lexemeElement.lexeme === lexeme.lexeme)

      if (lexemePosition !== -1) {
        lexeme.token = element.token
        lexeme.lexemePosition = lexemePosition

        return true
      } 
    })

    lexeme.token != undefined ? processedLexemes.push(lexeme) : lexemesToProcess.push(lexeme)
  })

  return { lexemesToProcess, processedLexemes }
}