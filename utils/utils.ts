import type { FileUploadUploaderEvent } from 'primevue/fileupload'

export const processFile = (file: FileUploadUploaderEvent, isProcessed: Ref<boolean>): Promise<string[]> => {
  const fileData = file.files[0] 
  const lexemes: string[] = []
  let textFile = ''

  return new Promise((resolve, reject) => {
    // Leemos el archivo
    readFile(fileData).then((data) => {
      // Limpiamos el texto
      textFile = cleanText(data)

      // Convertimos el texto en lexemas
      lexemes.push(...textToLexemes(textFile))
      isProcessed.value = true
      resolve(lexemes)
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

const textToLexemes = (text: string): string[] => {
  const lexemes = text.split(/\s+/)
  const dataSet = new Set(lexemes)

  return Array.from(dataSet)
}

export const calculateProgress = (totalLexemes: number, analyzedLexemes: number): number => {
  const progress = (analyzedLexemes / totalLexemes) * 100

  return Math.floor(progress)
}

export const saveLexemeInToken = (selectedToken: string, lexeme: string) => {
}

const getInputFileID = () => {
  // Leemos la carpeta outputs y obtenemos la lista de archivos que hay en ella
  // const inputFiles = fs.readdirSync('outputs')
  // Obtenemos el id del archivo de entrada

}