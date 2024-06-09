<template>
  <main>
    <h1>Tokenizador</h1>
    <div v-if="!isFileProcessed" class="form-file">
      <p>Seleccione un archivo de entrada en formato
        <Tag severity="success" value=".txt" />
        para procesar los lexemas:
      </p>
      <FileUpload choose-label="Subir" class="btn-file" mode="basic" name="text[]" custom-upload :max-file-size="1000000" @uploader="uploadFile" />
    </div>

    <form v-else class="form-tokens" @submit.prevent="saveLexeme">
        <p v-if="indexLexeme < lexemesToProcess.length" class="mb">Por favor, seleccione el grupo al cual pertenece el lexema: 
          <Tag severity="success" :value="lexemeActual"/>
        </p>
        <p v-else class="mb">Lexemas procesados!</p>

        <div class="flex">
          <div>
            <div class="radio-buttons-container">
              <div v-for="token in TOKENS" :key="token" class="radio-button-container">
                <RadioButton 
                  v-model="tokenSelected"
                  :disabled="indexLexeme >= lexemesToProcess.length"
                  :input-id="token"
                  name="tokens"
                  :value="token" 
                />
                <label :for="token" class="label">{{ token }}</label>
              </div>
            </div>
            <Button 
              type="submit"
              label="Guardar"
              outlined
              icon="pi pi-save"
              class="btn-save" 
              :disabled="indexLexeme >= lexemesToProcess.length || tokenSelected == ''"
            />
          </div>
          <div class="progress-container">
            <p>Porcentaje de lexemas procesados:</p>
            <Knob v-model="progressLexemeProcessed" :min="0" :max="100" readonly :value-template="`${progressLexemeProcessed}%`" />
            <p>Quedan {{ lexemesToProcess.length - indexLexeme }} lexemas por procesar</p>
            <p v-if="processedLexemes.length > 0">
              <span v-if="processedLexemes.length == 1">Se ha precargado {{ processedLexemes.length }} lexema del diccionario</span>
              <span v-else>Fueron precargados {{ processedLexemes.length }} lexemas del diccionario</span>
            </p>
            <p v-else>Ningun lexema fue precargado desde el diccionario</p>
          </div>
        </div>
    </form>

  </main>
</template>

<script setup lang="ts">
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import { TOKENS } from '@/helpers/constants'
import { processFile, saveLexemeInToken, calculateProgress } from '@/utils/utils'

// Refs
const tokenSelected = ref('')
const lexemeActual = ref('')
const indexLexeme = ref(0)
const progressLexemeProcessed = ref(0) 
const lexemesToProcess = ref<LexemeMetadata[]>([])
const processedLexemes = ref<LexemeMetadata[]>([])
const isFileProcessed = ref(false)


const uploadFile = async (e: FileUploadUploaderEvent) => {
  const aux = await processFile(e, isFileProcessed);

  lexemesToProcess.value = aux.lexemesToProcess;
  processedLexemes.value = aux.processedLexemes;

  lexemeActual.value = lexemesToProcess.value[indexLexeme.value].lexeme
  
  progressLexemeProcessed.value = calculateProgress(lexemesToProcess.value.length + processedLexemes.value.length, indexLexeme.value + processedLexemes.value.length)
}

const saveLexeme = () => {
  saveLexemeInToken(tokenSelected.value, lexemeActual.value)
  
  if (indexLexeme.value < lexemesToProcess.value.length - 1) {
    indexLexeme.value++
    lexemeActual.value = lexemesToProcess.value[indexLexeme.value].lexeme
    progressLexemeProcessed.value = calculateProgress(lexemesToProcess.value.length + processedLexemes.value.length, indexLexeme.value + processedLexemes.value.length)
  }
  else {
    indexLexeme.value++
    progressLexemeProcessed.value = calculateProgress(lexemesToProcess.value.length + processedLexemes.value.length, indexLexeme.value + processedLexemes.value.length)
  }
}


</script>

<style lang="scss">
.form-file {
  margin-bottom: 12px;

  .btn-file {
    margin-top: 4px;
    padding: 6px 10px;
    font-size: 14px;
    gap: 7px;
  }
}

.form-tokens {
  .flex {
    display: flex;
    gap: 200px;
    align-items: center;
  }

  .mb {
    margin-bottom: 8px;
  }
  .radio-buttons-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  
    .radio-button-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
  
      .label {
        text-transform: capitalize;
      }
    }
  }

  .btn-save {
    padding: 8px 10px;
    display: flex;
    gap: 6px;
    font-size: 14px;
  }

  .progress-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
}
</style>
