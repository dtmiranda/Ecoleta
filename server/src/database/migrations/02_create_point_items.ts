import Knex from 'knex';

export async function up(knex: Knex){
    await knex.schema.createTable('point_items', table =>{
        table.increments('id').primary();
        /**
         * Create a foreign key, at the point table, at id feeld
         */
        table.integer('point_id')
            .notNullable()
            .references('id')
            .inTable('points');

        /**
         * Create a foreign key, at the table, at id feeld
         */
        table.integer('items_id')
            .notNullable()
            .references('id')
            .inTable('items');
    });
}

export async function down(knex: Knex){
    await knex.schema.dropTable('point_items');
}