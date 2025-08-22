const responseSchema = {
   response: {
      200: {
         books: { type: 'array' }
      }
   }
}

const postSchema = {
   body: {
      properties: {
         book: { type: 'object' }
      },
      required: ['book'],
   },
   response: {
      200: {
         status: { type: 'number' }
      }
   }
}

const bookController = (fastify, options, done) => {
   fastify.get('/', { schema: responseSchema }, async (request, reply) => {
      try {
         const [books] = await fastify.mysql.execute('SELECT * FROM books')
         return { books };
      } catch (error) {
         return error;
      }
   });

   fastify.post('/', { schema: postSchema }, async (request, reply) => {
      const { book } = request.body;
      try {
         await fastify.mysql.execute(`
         INSERT INTO books (title, author, year, description, created_at, updated_at)
         VALUES (?,?,?,?,?,?)`,
            [book.title, book.author, book.year, book.description, new Date(), new Date()]);

         return { statusCode: 200 };
      } catch (error) {
         return error;
      }
   })

   done();
}

export default bookController;