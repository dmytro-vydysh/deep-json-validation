
### Per gli amanti di OOP e per i maniaci del typing in JavaScript/TypeScript - deep-json-validation è qui.
## 
## Una varietà di possibilità per validare i tuoi JSON provenienti da fonti o con strutture di dati sconosciute in modo sicuro e tipizzato.
## 
## Con Deep JSON Validation, puoi:
## - Validare strutture JSON complesse senza limiti di profondità.
## - Serializzare le tue validazioni e salvarle in un JSON.
## - Deserializzare le tue validazioni da un JSON e ricostruire le tue regole di validazione.
## - Conoscere il punto esatto in cui la validazione dei dati fallisce.
## - Ottenere un oggetto JSON tipizzato in modo sicuro dopo la validazione.
## - Scrivere le regole di validazione in modo facile, veloce e super-intuitivo.
## 
## 
## Di seguito, esempi di come utilizzare Deep JSON Validation.
## 

``` typescript
import {
  JV,
  JVAny,
  JVArray,
  JVBigInt,
  JVBoolean,
  JVClass,
  JVCustom,
  JVDate,
  JVNode,
  JVNumber,
  JVSomeOf,
  JVString,


  JVError,
  JVKeyError,
  JVKeyRegexError,
  JVKeyRequiredError,
  JVKeyTypeError,


  JN

} from '../index';

```


# Creiamo giusto due funzioni per utilità e per mostrare meglio il funzionamento di Deep JSON Validation.


``` typescript
class Response {
  private code: number = 200;
  private data: any = {}
  constructor() { }
  status(code: number): this {
    this.code = code;
    return this;
  }
  json(data: any): this {
    this.data = data;
    console.log('Response code:', this.code);
    console.log('Response data:', JSON.stringify(this.data, null, 2));
    return this;
  }
  end(): void {
    console.log(`Status code: ${this.code}, data: `, this.data);
  }
}
```


# Caso più comune: validare un body di una richiesta HTTP.


``` typescript
async function createPersonMiddleware(req: { body: any }, res: Response, next: any = () => { console.log('Middleware passato con successo!') }): Promise<void> {

  /** Potremmo avere una tabella "persone" che all'interno ha colonne come 
   * nome - dato di tipo string, obbligatorio
   * cognome - dato di tipo string, obbligatorio
   * email - dato di tipo string, obbligatorio nel body ma nullabile nel database
   * numeroDiTelefono - dato di tipo string, non obbligatorio
   * dataDiNascita - dato di tipo Date, non obbligatorio nel body e se presente può essere null
   * hobby - un array di stringhe, obbligatoria la presenza della chiave ma può essere un array vuoto
   * skills - un array di JSON strutturati, dove ogni JSON ha le chiavi "nome" (stringa, obbligatoria) e "livello" (numero, da 0 a 10, obbligatoria)
   * note - un array di JSON strutturati, non obbligatorio e se presente non può essere null, dove ogni JSON ha le chiavi "testo" (stringa, obbligatoria), "data" (Date, obbligatoria)
   * punteggio - un numero, non obbligatorio nel body, se presente invece deve essere tra 0 e 100
   * 
   * La validazione di questo body con Deep JSON Validation sarebbe:
   */


  const myJV = new JV()
    .req('nome', new JVString().regExp(/^[a-zA-Z'\s]{3,50}$/))
    .require('cognome', new JVString().regExp(/^[a-zA-Z'\s]{3,50}$/))
    .req('email', new JVString().regExp(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$|^[a-z0-9]{5,12}$/).nullable())
    .optional('numeroDiTelefono', new JVString().regExp(/^\+?\d{1,3}(?:\s?\d){5,12}$/))
    .opt('dataDiNascita', new JVDate().nullable())
    .req('hobby', new JVArray(new JVString().setRegex(/^.+$/)))
    .req('skills', new JVArray(
      new JVNode(
        new JV()
          .req('nome', new JVString().regExp(/^.{1,30}$/))
          .req('livello', new JVNumber().setMin(0).setMax(10))
      )
    ))
    .opt('note', new JVArray(
      new JVNode(
        new JV()
          .req('testo', new JVString().regExp(/^.{1,300}$/))
          .req('data', new JVDate())
      )
    ))
    .opt('punteggio', new JVNumber().min(0).max(100));


  const result = myJV.validate(

    /** Il body da validare */
    req.body,

    /** Se vogliamo che in caso di validazione fallita restituisca un booleano, altrimenti verrà lanciato un errore che estende  JVError*/
    false
  );

  if (!result)
    res.status(400).json({ error: 'Invalid request body' }).end();
  else
    next();
}
```


# Caso più comune: validare un body di una richiesta HTTP.

``` typescript

async function createPersonMiddlewareThrowError(req: { body: any }, res: Response, next: any = () => { console.log('Middleware passato con successo!') }): Promise<void> {

  /** 
   * Lo stesso esempio di prima
   */

  const myJV = new JV()
    .req('nome', new JVString().regExp(/^[a-zA-Z'\s]{3,50}$/))
    .require('cognome', new JVString().regExp(/^[a-zA-Z'\s]{3,50}$/))
    .req('email', new JVString().regExp(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$|^[a-z0-9]{5,12}$/).nullable())
    .optional('numeroDiTelefono', new JVString().regExp(/^\+?\d{1,3}(?:\s?\d){5,12}$/))
    .opt('dataDiNascita', new JVDate().nullable())
    .req('hobby', new JVArray(new JVString().setRegex(/^.+$/)))
    .req('skills', new JVArray(
      new JVNode(
        new JV()
          .req('nome', new JVString().regExp(/^.{1,30}$/))
          .req('livello', new JVNumber().setMin(0).setMax(10))
      )
    ))
    .opt('note', new JVArray(
      new JVNode(
        new JV()
          .req('testo', new JVString().regExp(/^.{1,300}$/))
          .req('data', new JVDate())
      )
    ))
    .opt('punteggio', new JVNumber().min(0).max(100));


  const result = myJV.validate(

    /** Il body da validare */
    req.body,

    /** Lanciamo appositamente un errore in caso di fallimento della validazione */
    true
  );


  /** Non controlliamo il risultato della validazione, se non è valido lancerà un errore, quindi, andremo a gestire il fallimento nel blocco catch */

  next();
}
```

# Testiamo la nostra middleware con un body valido:


``` typescript
createPersonMiddleware({
  body: {
    nome: "Dmytro",
    cognome: "Vydysh",
    email: "info@dmytrovydysh.com",
    dataDiNascita: null,
    hobby: ["Coding"],
    skills: [
      { nome: "TypeScript", livello: 9 },
      { nome: "ChatGPT", livello: 10 }
    ],
    note: [
      { testo: "Ha aggiunto nuove feature alla libreria deep-json-validation", data: new Date("2025-09-23") },
      { testo: "Persona fantastica!", data: new Date("2025-09-23") },
    ],
    punteggio: 95
  }
}, new Response());
```

``` bash
Middleware passato con successo!
```

# Proviamo invece a farlo fallire con un body non valido:


``` typescript
createPersonMiddleware({
  body: {
    nome: "Dmytro123", // Nome non valido, contiene numeri
    cognome: "Vydysh",
    email: "info@dmytrovydysh.com",
    numeroDiTelefono: "1234" // Numero di telefono non valido, formato errato
  }
}, new Response());
```

``` bash
Status code: 400, data:  { error: 'Invalid request body' }
```


# E se invece volessimo sapere esattamente dov'è che il body ha fallito la validazione?
# Dobbiamo far si che JV lanci un errore in caso di validazione fallita.

``` typescript
(async () => {

  try {
    await createPersonMiddlewareThrowError({
      body: {
        nome: "Dmytro", // Nome non valido, contiene numeri
        cognome: "Vydysh",
        email: "info@dmytrovydysh.com",
        numeroDiTelefono: "1234" // Numero di telefono non valido, formato errato
      }
    }, new Response());
  } catch (e) {
    if ((e as Error) instanceof JVError) {
      console.error('Validazione fallita. Dettagli: ', JV.error(e as JVError));
    } else console.error(e);

    // Qui la gestione della richieta fallita, ovviamente
  }
})()
``` 

``` bash
Validazione fallita. Dettagli:  {
  message: `The value "Dmytro123" does not match the regex "^[a-zA-Z'\\s]{3,50}$".`,
  address: 'nome'
}
```

# Stessa cosa per il numero di telefono

``` typescript
Validazione fallita. Dettagli:  {
  message: 'The value "1234" does not match the regex "^\\+?\\d{1,3}(?:\\s?\\d){5,12}$".',
  address: 'numeroDiTelefono'
}
``` 


``` quote
 * Il metodo statico "error" della classe JV recupera il messaggio di errore, che è formato:
 * 
 * JVKeyRegexError: [DEEP JSON VALIDATION] JSON validation failed!
 * Error: <JVError>The value "Dmytro123" does not match the regex "^[a-zA-Z'\s]{3,50}$".</JVError>
 * Key address: nome
 * 
 * Estrapola i dati necessari e se ci riesce, restituisce un oggetto con le seguenti proprietà:
 * - message: il messaggio di errore
 * - address: l'indirizzo della chiave che ha causato l'errore
 * 
 * 
 * La validazione fallisce al primo errore riscontrato, quindi se ce ne sono più di uno, lo scoprirete iterativamente.
 */
```

/**
 * Vediamo di seguito tutti i metodi statici e non statici della classe JV che ci possono essere utili.
 */

// Creo una nuova istanza di JV

const newJV = new JV();


/** 
 * Metodo 1 
 * 
 * Si utilizza per rendere una chiave obbligatoria nel JSON che si vuole validare.
 * Se la chiave non è presente, la validazione fallisce.
 **/
newJV.require(
  /** Il nome della chiave che deve essere presente nel mio JSON */
  'key0',
  /** Il tipo di dato che deve rispettare */
  new JVString()
);

// Disponibile anche la versione alias "req"
newJV.req('key1', new JVNumber());

/** 
 * Metodo 2
 * 
 * Si utilizza per rendere una chiave opzionale nel JSON che si vuole validare.
 * Se la chiave è presente, deve rispettare il tipo di dato specificato, altrimenti la validazione fallisce.
 * Se la chiave non è presente, la validazione passa comunque.
 **/
newJV.optional(
  /** Il nome della chiave che può essere presente nel mio JSON */
  'key2',
  /** Il tipo di dato che deve rispettare, se presente */
  new JVBoolean()
);

// Disponibile anche la versione alias "opt"
newJV.opt('key3', new JVAny());

/**
 * Metodo 3
 *
 * Si utilizza per generare un esempio di JSON che rispetta le regole di validazione definite.
 * Utile per testare le regole di validazione o per avere un esempio di JSON valido.
 * Restituisce un oggetto JSON con valori di esempio per ogni chiave definita.
 **/

// console.log(newJV.example());
// console:
// {
//   key0: 'a string value',
//   key1: 2025,
//   key2: false,
//   key3: 'Any seriazable value, including null.'
// }

/**
 * Metodo 4
 *
 * Si utilizza per generare un JSON con delle stringhe descrittive delle regole di validazione definite.
 * Utile per documentazioni veloci.
//  **/
// console.log(newJV.exampleWithRules());

// console:
// {
//   key0: 'A string, Has no specific regex, Cannot be null.',
//   key1: 'A number, Cannot be null.',
//   key2: 'A boolean, Cannot be null.',
//   key3: 'Any seriazable value'
// }

/**
 * Metodo 5
 *
 * Restituisce la struttura del JSON che vogliamo validare, con gli indirizzi di ogni chiave presente nel JSON.
 **/

/** Una breve operazione per rendere meglio l'idea */
// newJV.req('key4', new JVArray(new JVNode(new JV().req('subKey1', new JVBigInt()).opt('subKey2', new JVDate()))));
// console.log(newJV.path());

// console:
// {
//   key0: 'key0',
//   key1: 'key1',
//   key2: 'key2',
//   key3: 'key3',
//   'key4[]': { subKey1: 'key4/subKey1', subKey2: 'key4/subKey2' }
// }


/**
 * Metodo 6
 *
 * Statico
 *
 * Si utilizza per creare gli schemi JV a partire da un JSON.
 * Un po' limitante ma utile con i tipi di dato semplice come stringhe, array, numeri, booleani e date.
 * Non supporta tipi di dato complessi come classi personalizzate o validazioni custom.
 * Utile per creare velocemente uno schema di validazione di base.
 **/
// const myJVFromSchema = JV.schema({
//   nome: 'Dmytro',
//   cognome: 'Vydysh',
//   dataDiNascita: new Date('1990-01-01'),
// });

// console.log(myJVFromSchema.example());
// console:
// {
//   nome: 'a string value',
//   cognome: 'a string value',
//   dataDiNascita: '22/09/2025'
// }


/**
 * Metodo 7
 *
 * Si utilizza per rimuovere una chiave dallo schema di validazione JV.
 * Utile per modificare dinamicamente lo schema di validazione in base a certe condizioni.
 **/
// newJV.removeKey('key4');

/**
 * Metodo 8
 *
 * Si utilizza per serializzare lo schema di validazione JV in un JSON che poi possiamo storicizzare o fare altre operazioni.
 * Il JSON prodotto può essere utilizzato successivamente per ricostruire lo schema di validazione JV originale.
 *
 *
 * Attenzione: se nell'utilizzare i validatori JVClass avete utilizzato delle classi vere,
 * oppure se nell'utilizzare JVCustom avete utilizzato delle funzioni vere, verrà generato un errore
 * in quanto non è possibile serializzare le funzioni o classi in JSON (cioè, è possibile ma non è possibile deserializzarle poi).
 *
 *
 * Per serializzare JVClass o JVCustom, seguite la documentazione in fondo.
 */
// console.dir(newJV.json(), { depth: null });

// console:
// {
//   type: 'object',
//   keys: [
//     {
//       name: 'key0',
//       required: true,
//       config: { type: 'string', null: false, regex: 'undefined', enum: null }
//     },
//     {
//       name: 'key1',
//       required: true,
//       config: {
//         type: 'number',
//         null: false,
//         min: undefined,
//         max: undefined,
//         enum: null
//       }
//     },
//     {
//       name: 'key2',
//       required: false,
//       config: { type: 'boolean', null: false }
//     },
//     {
//       name: 'key3',
//       required: false,
//       config: { type: 'any', null: true }
//     }
//   ]
// }


/**
 * Metodo 9
 *
 * Statico
 *
 * Si utilizza per ricostruire uno schema di validazione JV a partire da un JSON prodotto dal metodo json().
 */

// const jvFromJSON = JV.fromJSON(newJV.json());


/**
 * Metodo 10
 *
 * Statico
 *
 *
 * Si utilizza per estrapolare i dati dell'errore di validazione in modo semplice e veloce.
 */
// console.log(JV.error(new JVError(`JVKeyRegexError: [DEEP JSON VALIDATION] JSON validation failed! Error: <JVError>The value "Dmytro123" does not match the regex "^[a-zA-Z'\s]{3,50}$".</JVError> Key address: nome`)));

// console:
// {
//   message: `The value "Dmytro123" does not match the regex "^[a-zA-Z's]{3,50}$".`,
//   address: 'nome'
// }


/**
 * Metodo 11
 *
 *
 * Si utilizza per validare un JSON contro lo schema di validazione JV definito.
 * Restituisce true se il JSON è valido, altrimenti lancia un errore JVError con i dettagli della validazione fallita.
 */
// const valid = newJV.validate({}, false/**Non lanciare l'errore */);

/**
 * Metodo  12
 *
 * Statico
 *
 * Permette di registrare globalmente una classe per poi poter serializzare lo schema che utilizza JVClass.
 */
// class AnyClass { }
// JV.registerClass('nomino-la-mia-classe', AnyClass);

// console.dir(new JV().req('class', new JVClass('nomino-la-mia-classe')).json(), { depth: null });
// console:
// {
//   type: 'object',
//   keys: [
//     {
//       name: 'class',
//       required: true,
//       config: { type: 'class', class: 'nomino-la-mia-classe', null: false }
//     }
//   ]
// }

/** Se lo faccio senza passare per JV.registerClass, invece, verrà generato un errore di serializzazione */
// console.dir(new JV().req('class', new JVClass({ class: AnyClass })).json(), { depth: null });
// console:
// JVKeyError: You cannot serialize a class key using real classes.

/**
 * Metodo 13
 *
 * Statico
 *
 * Permette di rimuovere le classi registrate dalla mappa globale delle classi JV per JVClass
 */
// JV.removeClass('nomino-la-mia-classe');


/**
 * Metodo 14
 *
 * Statico
 *
 * Permette di registrare globalmente una funzione di validazione personalizzata per poi poter serializzare lo schema che utilizza JVCustom.
 *
 */

// JV.registerCustom('mia-funzione-personalizzata', function (value: any) { return true });
// console.dir(new JV().req('custom', new JVCustom('mia-funzione-personalizzata')).json(), { depth: null });
// console:
// {
//   type: 'object',
//   keys: [
//     {
//       name: 'custom',
//       required: true,
//       config: {
//         type: 'custom',
//         callback: 'mia-funzione-personalizzata',
//         null: false
//       }
//     }
//   ]
// }

/** Se lo faccio senza passare per JV.registerCustom, invece, verrà generato un errore di serializzazione */
// console.dir(new JV().req('custom', new JVCustom(function (value: any) { return true })).json(), { depth: null });
// console:
// JVKeyError: You cannot serialize a direct custom validator in JSON.

/**
 * Metodo 15
 *
 * Statico
 *
 * Permette di rimuovere le funzioni di validazione personalizzate registrate dalla mappa globale delle funzioni JV per JVCustom
 */
// JV.removeCustom('mia-funzione-personalizzata');



/** Lista di tutti i validatori JV con i relativi metodi */

/**
 * Validatore di stringhe
 */

const jvString = new JVString()
  /** Imposta una regex per la validazione */
  .setRegex(/.*/)

  /** Alias di "setRegex" */
  .regExp(/.*/)

  /** Imposta una lista di valori consentiti */
  .setEnum(['a', 'b', 'c'])

  /** Alias di "setEnum" */
  .enum(['a', 'b', 'c'])

  /** Rende il valore valido se null */
  .setNull()

  /** Alias di "setNull" */
  .nullable();

/**
 * Validatore di numeri
 */

const jvNumber = new JVNumber()
  /** Imposta il valore minimo consentito */
  .setMin(0)

  /** Alias di "setMin" */
  .min(0)

  /** Imposta il valore massimo consentito */
  .setMax(100)

  /** Alias di "setMax" */
  .max(100)

  /** Imposta una lista di valori consentiti */
  .setEnum([0, 1, 2, 3, 4, 5])

  /** Alias di "setEnum" */
  .enum([0, 1, 2, 3, 4, 5])

  /** Rende il valore valido se null */
  .setNull()

  /** Alias di "setNull" */
  .nullable();


const jvBoolean = new JVBoolean()
  /** Rende il valore valido se null */
  .setNull()

  /** Alias di "setNull" */
  .nullable();


/**
 * Validatore di BigInt
 */

const jvBigInt = new JVBigInt()
  /** Imposta il valore minimo consentito */
  .setMin(BigInt(0))

  /** Alias di "setMin" */
  .min(BigInt(0))

  /** Imposta il valore massimo consentito */
  .setMax(BigInt(100))

  /** Alias di "setMax" */
  .max(BigInt(100))

  /** Imposta una lista di valori consentiti */
  .setEnum([BigInt(0), BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)])

  /** Alias di "setEnum" */
  .enum([BigInt(0), BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)])

  /** Rende il valore valido se null */
  .setNull()

  /** Alias di "setNull" */
  .nullable();


/**
 * Validatore di Date
 */

const jvDate = new JVDate()

  /** Imposta una data minima consentita */
  .setMin(new Date('2000-01-01'))

  /** Alias di "setMin" */
  .min(new Date('2000-01-01'))

  /** Imposta una data massima consentita */
  .setMax(new Date('2100-12-31'))

  /** Alias di "setMax" */
  .max(new Date('2100-12-31'))

  /** Imposta una lista di date consentite */
  .setEnum([new Date('2000-01-01'), new Date('2000-01-02'), new Date('2000-01-03')])

  /** Alias di "setEnum" */
  .enum([new Date('2000-01-01'), new Date('2000-01-02'), new Date('2000-01-03')])

  /** Rende il valore valido se null */
  .setNull()

  /** Alias di "setNull" */
  .nullable();


/**
 * Validatore generico, accetta qualsiasi valore
 */
const jvAny = new JVAny();


/**
 * Validatore di array
 * 
 * Come argomento necessita di un altro validatore JV che definisce il tipo di dato degli elementi dell'array.
 */

const jvArray = new JVArray(new JVString().setRegex(/^.+$/))

  /** Imposta la lunghezza minima dell'array */
  .setMin(0)

  /** Alias di "setMin" */
  .min(0)

  /** Imposta la lunghezza massima dell'array */
  .setMax(100)

  /** Alias di "setMax" */
  .max(100)

  /** Cambio di validatore */
  .setConf(new JVNumber().setMin(0).setMax(10))

  /** Alias di "setConf" */
  .config(new JVNumber().setMin(0).setMax(10));


/** 
 * Validatore di JSON annidati
 * 
 * Come argomento necessita di un'istanza di JV che definisce la struttura del JSON annidato.
 */
const jvNode = new JVNode(new JV().req('subKey1', new JVString()))

  /** Rende il valore valido se null */
  .setNull()

  /** Alias di "setNull" */
  .nullable();


/**
 * Validatore di classi. Controlla che il valore della chiave sia instanza della classe specificata
 */

const jvClass = new JVClass({ class: Number })

  /** Rende il valore valido se null */
  .setNull()

  /** Alias di "setNull" */
  .nullable();


/**Oppure, utilizzando la mappa delle classi globale */
const jvClass2 = new JVClass('nomino-la-mia-classe')


/** 
 * Validatore con funzione di validazione personalizzata
 */
const jvCustom = new JVCustom((v: any) => true)

/** Oppure, utilizzando la mappa delle funzioni globali */
const jvCustom2 = new JVCustom('mia-funzione-personalizzata');


/** 
 * Validatore che accetta più tipi di dato, se uno dei tipi di dato specificati è valido, la validazione passa.
 */
const jvSomeOf = new JVSomeOf([new JVString(), new JVNumber(), new JVBoolean()]);





/**
 *
 *
 * JN invece cos'è?
 *
 * JN è un tool di navigazione all'interno di un JSON che permette di navigare, ricreare, estrapolare e modificare i dati all'interno di un JSON in modo al quanto semplice.
 *
 */


/**
 * Di seguito, i metodi esistenti con esempi pratici:
 */

// path
// pathWithValues
// materialize
// get


/**
 * Metodo 1
 * 
 * Si utilizza per ottenere il percorso di tutte le chiavi finali presenti in un JSON.
 * 
 * Attenzione: funziona solo con i valori di tipo string, number, boolean e null
 */


// const pathed = JN.path({
//   key0: 'value0',
//   key1: 15,
//   key2: false,
//   key3: {
//     subKey1: 'subValue1',
//     subKey2: 25,
//     subKey3: {
//       subSubKey1: 'subSubValue1',
//       subSubKey2: null,
//       subSubKey3: [1, 2, 3]
//     }
//   }
// })
// console.dir(pathed, { depth: null });

// console:
// {
//   key0: 'key0',
//   key1: 'key1',
//   key2: 'key2',
//   key3: {
//     subKey1: 'key3/subKey1',
//     subKey2: 'key3/subKey2',
//     subKey3: {
//       subSubKey1: 'key3/subKey3/subSubKey1',
//       subSubKey2: 'key3/subKey3/subSubKey2',
//       subSubKey3: [
//         'key3/subKey3/subSubKey3/0',
//         'key3/subKey3/subSubKey3/1',
//         'key3/subKey3/subSubKey3/2'
//       ]
//     }
//   }
// }



/**
 * Metodo 2
 * 
 * Si utilizza per ottenere il percorso di tutte le chiavi finali presenti in un JSON, insieme ai loro valori.
 * 
 * Attenzione: funziona solo con i valori di tipo string, number, boolean e null
 */
// const pathedWithValues = JN.pathWithValues({
//   key0: 'value0',
//   key1: 15,
//   key2: false,
//   key3: {
//     subKey1: 'subValue1',
//     subKey2: 25,
//     subKey3: {
//       subSubKey1: 'subSubValue1',
//       subSubKey2: null,
//       subSubKey3: [1, 2, 3]
//     }
//   }
// })
// console.dir(pathedWithValues, { depth: null });

// console:
// {
//   key0: { value: 'value0', path: 'key0' },
//   key1: { value: 15, path: 'key1' },
//   key2: { value: false, path: 'key2' },
//   key3: {
//     subKey1: { value: 'subValue1', path: 'key3/subKey1' },
//     subKey2: { value: 25, path: 'key3/subKey2' },
//     subKey3: {
//       subSubKey1: { value: 'subSubValue1', path: 'key3/subKey3/subSubKey1' },
//       subSubKey2: { value: null, path: 'key3/subKey3/subSubKey2' },
//       subSubKey3: [
//         { value: 1, path: 'key3/subKey3/subSubKey3/0' },
//         { value: 2, path: 'key3/subKey3/subSubKey3/1' },
//         { value: 3, path: 'key3/subKey3/subSubKey3/2' }
//       ]
//     }
//   }
// }


/**
 * Metodo 3
 * 
 * Si utilizza per estrapolare un valore da un JSON, dato il suo percorso.
 */

// const value = JN.get({
//   key0: 'value0',
//   key1: 15,
//   key2: false,
//   key3: {
//     subKey1: 'subValue1',
//     subKey2: 25,
//     subKey3: {
//       subSubKey1: 'subSubValue1',
//       subSubKey2: null,
//       subSubKey3: [1, 2, 3]
//     }
//   }
// }, 'key3/subKey3/subSubKey3/2');

// console.log(value);

// console:
// 3

/**
 * Metodo 4
 * 
 * Si utilizza per ricreare un JSON a partire da un json fatto di percorsi.
 * Nel JSON di input, ogni chiave deve essere un percorso valido all'interno del JSON di sorgente.
 * 
 * 
 * Questo è molto utile quando si ha un JSON di partenza molto grande e annidato e si vogliono estrapolare solo alcune chiavi specifiche.
 */
const materialized = JN.materialize({
  number_25: 'key3/subKey2',
  number_3_from_array: 'key3/subKey3/subSubKey3/2',
  boolean: 'key2',
  string_subSubValue1: 'key3/subKey3/subSubKey1',
  also: [
    'key0',
    'key1'
  ],
  and_also_this: {
    nested: 'key3/subKey1'
  }
}, {
  key0: 'value0',
  key1: 15,
  key2: false,
  key3: {
    subKey1: 'subValue1',
    subKey2: 25,
    subKey3: {
      subSubKey1: 'subSubValue1',
      subSubKey2: null,
      subSubKey3: [1, 2, 3]
    }
  }
});

console.dir(materialized, { depth: null });

// console:
// {
//   number_25: 25,
//   number_3_from_array: 3,
//   boolean: false,
//   string_subSubValue1: 'subSubValue1',
//   also: [ 'value0', 15 ],
//   and_also_this: { nested: 'subValue1' }
// }






/**
 * La repository di deep-json-validation si trova su GitHub:
 * https://github.com/dmytro-vydysh/deep-json-validation
 * 
 * 
 * Se avete domande, trovate un bug o volete richiedere una nuova feature, aprite una issue su GitHub.
 * 
 * Qualsiasi contributo è ben accetto!
 */