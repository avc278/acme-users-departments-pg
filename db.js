const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost:/acme_db');
client.connect();

const sync = async() => {
    const SQL = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) UNIQUE NOT NULL,
            CHECK (char_length(name) > 0)
        );
        CREATE TABLE users(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) UNIQUE NOT NULL,
            department_id UUID REFERENCES departments(id)
            CHECK (char_length(name) > 0)
        );
    `;

    await client.query(SQL);
    const [ fsaDep ] = await Promise.all([
        createDepartment( { name: 'FSA' })
    ]);
    await Promise.all([
        createUser( { name: 'Andres', department_id: fsaDep.id }),
        createUser( { name: 'Vinayak', department_id: fsaDep.id }),
        createUser( { name: 'Bob', department_id: null }),
    ]);

}
sync()

const createUser = async({ name, department_id }) => {
    const SQL = `
        INSERT INTO users(name, department_id) values($1, $2) returning *
    `;
    return (await client.query(SQL, [ name, department_id ])).rows[0];
};

const createDepartment = async({ name }) => {
    const SQL = `
        INSERT INTO departments(name) values($1) returning *
    `;
    return (await client.query(SQL, [ name ])).rows[0];
};

const findAllDepartments = async() => {
    const SQL = 'SELECT * FROM departments';
    console.log((await client.query(SQL)).rows);
    return (await client.query(SQL)).rows;
};

const findAllUsers = async() => {
    const SQL = 'SELECT * FROM users';
    return (await client.query(SQL)).rows;
};

module.exports = {
    findAllDepartments,
    findAllUsers,
    sync,
};
