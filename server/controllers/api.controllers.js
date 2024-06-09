
const fs = require('fs');
const { entryNumber } = require('./../data.json');
const DATA_JSON_PATH = 'data.json';
const DICTIONARY_JSON_PATH = 'dictionary.json';


const getLexemes = (req, res) => {
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


module.exports = { getLexemes, clearData };