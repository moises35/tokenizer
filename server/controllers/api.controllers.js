
const fs = require('fs');
const { entryNumber } = require('./../data.json');
const DATA_JSON_PATH = 'data.json';
const DICTIONARY_JSON_PATH = 'dictionary.json';
const OUTPUT_PATH = 'outputs';

const getDictionary = (req, res) => {
  // Leer el archivo .json
  const data = fs.readFileSync(DICTIONARY_JSON_PATH);
  const dictionary = JSON.parse(data);
  const numberOfEntries = getNumberOfEntries();

  const response = {
    numberOfEntries,
    dictionary,
  };

  res.json(response);
};

const setDictionary = (req, res) => {
  const { dictionary, outputFile } = req.body;

  if (!fs.existsSync(`${__dirname}/../${OUTPUT_PATH}`)) {
    fs.mkdirSync(`${__dirname}/../${OUTPUT_PATH}`);
  }

  const outputFilePath = `${__dirname}/../${OUTPUT_PATH}/output${entryNumber}.json`;

  fs.writeFileSync(DICTIONARY_JSON_PATH, JSON.stringify(dictionary));
  fs.writeFileSync(outputFilePath, JSON.stringify(outputFile));

  setNumberOfEntries();
  res.json({ message: 'Dictionary updated', dictionary: dictionary, outputFile: outputFilePath});
}

const clearData = (req, res) => {
  fs.writeFileSync(DATA_JSON_PATH, JSON.stringify({ entryNumber: 1 }));

 const tokens = [ 'articulo', 'sustantivo', 'verbo', 'adjetivo', 'adverbio', 'otros' ]; 
 
  const dictionary = tokens.map(token => {
    return {
      token,
      lexemes: [],
    };
  });

  fs.writeFileSync(DICTIONARY_JSON_PATH, JSON.stringify(dictionary));


  res.json({ message: 'Data cleared' });
}


const getNumberOfEntries = () => {
  return entryNumber;
}

const setNumberOfEntries = () => {
  const aux = entryNumber + 1;

  fs.writeFileSync(DATA_JSON_PATH, JSON.stringify({ entryNumber: aux }));
}


module.exports = { getDictionary, setDictionary, clearData };