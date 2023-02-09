const { Pool } = require('pg')

// Configuração banco de dados PostgreeSQL
const pool = new Pool({
    user: '',
    database: '',
    password: '',
    port: 5432,
    host: '',
  })

module.exports = { pool }