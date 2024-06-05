<template>
  <main>
    <h1>Tokenizador</h1>
    <div class="form-file" v-if="!isFileProcessed">
      <p>Seleccione un archivo de entrada en formato
        <Tag severity="success" value=".txt" />
        para procesar los lexemas:
      </p>
      <FileUpload choose-label="Subir" class="btn-file" mode="basic" name="text[]" customUpload :maxFileSize="1000000" @uploader="uploadFile" />
    </div>

    <form class="form-tokens" @submit.prevent="saveLexeme" v-else>
        <p v-if="indexLexeme < listLexemes.length" class="mb">Por favor, seleccione el grupo al cual pertenece el lexema: 
          <Tag severity="success" :value="lexemeActual"></Tag>
        </p>
        <p v-else class="mb">Lexemas procesados!</p>

        <div class="flex">
          <div>
            <div class="radio-buttons-container">
              <div class="radio-button-container" v-for="token in TOKENS" :key="token">
                <RadioButton 
                  :disabled="indexLexeme >= listLexemes.length"
                  v-model="tokenSelected"
                  :inputId="token"
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
              :disabled="indexLexeme >= listLexemes.length || tokenSelected == ''"
            />
          </div>
          <div class="progress-container">
            <p>Porcentaje de lexemas procesados:</p>
            <Knob v-model="progressLexemeProcessed" :min="0" :max="100" readonly :valueTemplate="`${progressLexemeProcessed}%`" />
            <p>Quedan {{ listLexemes.length - indexLexeme }} lexemas por procesar</p>
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
const listLexemes = ref<string[]>([])
const isFileProcessed = ref(false)


const uploadFile = async (e: FileUploadUploaderEvent) => {
  listLexemes.value = await processFile(e, isFileProcessed)
  lexemeActual.value = listLexemes.value[indexLexeme.value]
  progressLexemeProcessed.value = calculateProgress(listLexemes.value.length, indexLexeme.value)
}

const saveLexeme = () => {
  saveLexemeInToken(tokenSelected.value, lexemeActual.value)
  
  if (indexLexeme.value < listLexemes.value.length - 1) {
    indexLexeme.value++
    lexemeActual.value = listLexemes.value[indexLexeme.value]
    progressLexemeProcessed.value = calculateProgress(listLexemes.value.length, indexLexeme.value)
  }
  else {
    indexLexeme.value++
    progressLexemeProcessed.value = calculateProgress(listLexemes.value.length, indexLexeme.value)
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
