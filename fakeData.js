const faker = require('faker');
const { Client } = require('pg');

const client = new Client({
  user: 'root',
  host: 'localhost',
  database: 'dbNoSQL',
  password: 'root',
  port: 5432,
});

async function generateFakeData() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      description TEXT,
      price DECIMAL
    );
  `);

  const insertQuery = 'INSERT INTO products(name, description, price) VALUES($1, $2, $3)';
  const values = [];

  for (let i = 0; i < 100; i++) {
    const name = faker.commerce.productName();
    const description = faker.lorem.paragraph();
    const price = faker.random.number({ min: 10, max: 1000, precision: 0.01 });

    values.push([name, description, price]);
  }

  try {
    await client.query('BEGIN');
    await Promise.all(
      values.map(params => client.query(insertQuery, params))
    );
    await client.query('COMMIT');
    console.log('Insertion de données réussie !');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de l\'insertion de données :', err);
  } finally {
    await client.end();
  }
}

generateFakeData();
