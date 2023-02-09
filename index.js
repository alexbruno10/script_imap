const { ImapFlow } = require('imapflow');
const { pool } = require("./db");
const nodemailer = require('nodemailer');

// Configurações do ImapFlow
const client = new ImapFlow({
    host: '',
    port: 143,
    secure: false,
    auth: {
        user: '',
        pass: ''
    }
});

// Função que armazena no Banco de Dados PostgreeSQL, utilizando 'pool', que vem do arquivo db.js, que possui as configurações do banco de dados
async function saveLog() {
    try {
      const res = await pool.query(
        "INSERT INTO ...",
      );
    } catch (error) {
      console.error(error);
    }
  }
  
// Configurações do serviço de e-mail
const transporter = nodemailer.createTransport({
    host: "",
    port: 587,
    secure: false,
    auth: {
        user: "",
        pass: ""
    },
    tls: { rejectUnauthorized: false }
  });

// Criando um novo objeto para armazenar os e=-mails que serão lidos na caixa de e-mail
var relatos = []

const main = async () => {
    await client.connect();

    let lock = await client.getMailboxLock('INBOX');
    try {

        let status = await client.status('INBOX', {unseen: false});

        // Lê todos e-mails, começando pelo primeiro
        let message = await client.fetchOne('1:*', { source: true });

        // Converte a resposta em string
        var string = message.source.toString();

        // Utiliza o método de decode
        var emBase64 = new Buffer(string).toString('base64')

        var deBase64 = new Buffer(emBase64, 'base64').toString('ascii')

        
        
        // Lê todos os e-mails que encontrou, começando pelo primeiro
        for await (let message of client.fetch('1:*', { envelope: true, source: true })) {

            var verify = message.source.toString();
            var device =  message.envelope.subject

            let obj = {
                dvr: device,
                msg: deBase64,
                type: verify
               };

            // Insere os dados do e-mail no objeto 'relatos'
            relatos.push(obj);
        }

        // Após ler todos os e-mails e inserir no objeto, ele limpa a caixa de entrada do e-mail, começando pelo primeiro
        await client.messageMove('1:*', 'Trash');
    } finally {
        lock.release();
    }

    await client.logout();
    // console.log(relatos)

    // Percorre o objeto de 'relatos', que possui os e-mails 
    relatos.forEach(function(item) {

        // Procura a palavra específica
        let existHDD = item.type.search("PALAVRA ESPECIFICA");
        let existDisco = item.type.search("PALAVRA ESPECIFICA");

    // 'exist' retornará a possível que se encontra a palavra que deseja procurar, caso não encontre, ela retornará -1
    if(existHDD != -1 || existDisco != -1) {
        // console.log(exist)
        const mailOptions = {
            from: '',
            to: '',
            subject: ':: CFTV ::',
            text: ``
           };

           
           transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } 
            });



        // Salva no banco de dados, passandos os parâmetros
        saveLog()
    } 

    });

};

main()
