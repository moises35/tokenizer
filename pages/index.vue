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

    <div v-if="isFileProcessed && indexLexeme >= lexemesToProcess.length" class="report_section">Reporte generados
      <DataTable :value="reports" show-gridlines  table-style="min-width: 50rem; margin-bottom:26px; margin-top:16px">
        <Column field="token" sortable header="Token" style="width: 17%"/>
        <Column field="percentageOfPreprocessedLexemes" header="% de lexemas pre-procesados previamente" header-style="text-align:center"  style="width: 14%"/>
        <Column field="percentageOfProcessLexemes" header="% de lexemas procesados ahora" header-style="text-align:center" style="width: 12%"/>
        <Column field="cantOfTotalLexemes" header="Cantidad de lexemas totales" header-style="text-align:center" style="width: 12%"/>
        <Column field="cantOfLexemesBeforeToRead" header="Cantidad de lexemas previa a la lectura" header-style="text-align:center" style="width: 12%"/>
        <Column field="cantOfNewLexemes" header="Cantidad de lexemas nuevos" header-style="text-align:center" style="width: 12%"/>
      </DataTable>
      <Tag severity="success" value="">El archivo de salida es: {{ outputPathFile }}</Tag>
      <!-- <Message severity="success"></Message> -->
      <!-- <Button class="btn-save" label="Archivo de tokens generado" icon="pi pi-file" @click="showToast" /> -->
    </div>
  </main>
</template>

<script setup lang="ts">
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import { useToast } from 'primevue/usetoast';
import { TOKENS } from '@/helpers/constants'
import { processFile, saveLexemesIntoDictionary, calculateProgress } from '@/utils/utils'

// Refs
const tokenSelected = ref('')
const lexemeActual = ref('')
const indexLexeme = ref(0)
const progressLexemeProcessed = ref(0) 
const lexemesToProcess = ref<LexemeMetadata[]>([])
const processedLexemes = ref<LexemeMetadata[]>([])
const isFileProcessed = ref(false)
const reports = ref<ResultReport[]>([])
const outputPathFile = ref('')
const toast = useToast();

const showToast = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'La ruta se ha copiado al portapapeles', life: 3000 });
};

const uploadFile = async (e: FileUploadUploaderEvent) => {
  const aux = await processFile(e, isFileProcessed);

  lexemesToProcess.value = aux.lexemesToProcess;
  processedLexemes.value = aux.processedLexemes;

  lexemeActual.value = lexemesToProcess.value[indexLexeme.value]?.lexeme
  progressLexemeProcessed.value = calculateProgress(lexemesToProcess.value.length + processedLexemes.value.length, indexLexeme.value + processedLexemes.value.length)

  if (lexemesToProcess.value.length === 0) {
    const aux = await saveLexemesIntoDictionary(processedLexemes.value, lexemesToProcess.value)

    reports.value = aux.result
    outputPathFile.value = aux.outputFile
  }
}

const saveLexeme = async () => {
  lexemesToProcess.value[indexLexeme.value].token = tokenSelected.value;
  lexemesToProcess.value[indexLexeme.value].tokenPosition = getTokenPosition(tokenSelected.value)
  
  if (indexLexeme.value < lexemesToProcess.value.length - 1) {
    indexLexeme.value++
    lexemeActual.value = lexemesToProcess.value[indexLexeme.value].lexeme
    progressLexemeProcessed.value = calculateProgress(lexemesToProcess.value.length + processedLexemes.value.length, indexLexeme.value + processedLexemes.value.length)
  }
  else {
    indexLexeme.value++
    progressLexemeProcessed.value = calculateProgress(lexemesToProcess.value.length + processedLexemes.value.length, indexLexeme.value + processedLexemes.value.length)
    const aux = await saveLexemesIntoDictionary(processedLexemes.value, lexemesToProcess.value)

    reports.value = aux.result
    outputPathFile.value = aux.outputFile
  }

}

const getTokenPosition = (token: string) => {
  return TOKENS.findIndex((t) => t.toLowerCase() === token.toLowerCase())
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

.btn-save {
  padding: 8px 10px;
  display: flex;
  gap: 6px;
  font-size: 14px;
}

.form-tokens {
  margin-bottom: 42px;

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

  

  .progress-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
}

tr {
  td:not(:first-child) {
    text-align: center;
  }
}
</style>
